# Auth0 Tenant Setup Script for Frankenstein AI
# Run this once to configure all Auth0 resources via Management API

$ErrorActionPreference = 'Stop'

$AUTH0_DOMAIN = 'dev-p5q27nuk7s33yxx7.eu.auth0.com'
$M2M_CLIENT_ID = 'oebXvGC6pA49IL0aKWhWL2XyJiyItn79'
$M2M_CLIENT_SECRET = 'tVMzaa_Mjh3BfHsBGg5z4jLGPRnoJaOtxkwfboCxwNJ6vtGTBpxR-g7DQTcqLXi6'
$FRONTEND_CLIENT_ID = '1fGQpLVpxItLkCF5ll1HpueMZ6sC0zmC'

# Get Management API token
Write-Host "Getting Management API token..." -ForegroundColor Cyan
$tokenBody = @{
    client_id     = $M2M_CLIENT_ID
    client_secret = $M2M_CLIENT_SECRET
    audience      = "https://$AUTH0_DOMAIN/api/v2/"
    grant_type    = 'client_credentials'
} | ConvertTo-Json

$tokenResp = Invoke-RestMethod -Method Post -Uri "https://$AUTH0_DOMAIN/oauth/token" -ContentType 'application/json' -Body $tokenBody
$token = $tokenResp.access_token
$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

Write-Host "Token acquired" -ForegroundColor Green

# --- Enable Frontend app on Google connection ---
Write-Host "`n[1] Enabling Frontend app on google-oauth2 connection..." -ForegroundColor Cyan
$googleConn = Invoke-RestMethod -Uri "https://$AUTH0_DOMAIN/api/v2/connections?strategy=google-oauth2" -Headers $headers
$googleId = $googleConn[0].id
$currentClients = @($googleConn[0].enabled_clients)
if ($FRONTEND_CLIENT_ID -notin $currentClients) {
    $currentClients += $FRONTEND_CLIENT_ID
}
# enabled_clients must be set via POST to /api/v2/connections/:id/clients
# Actually we need to use the correct endpoint - let's try updating via clients array
try {
    $resp = Invoke-WebRequest -Method Patch -Uri "https://$AUTH0_DOMAIN/api/v2/connections/$googleId" -Headers $headers -Body (@{ enabled_clients = $currentClients } | ConvertTo-Json) -UseBasicParsing
    Write-Host "  Google connection updated" -ForegroundColor Green
} catch {
    # If enabled_clients fails on PATCH, we need to do it via Dashboard
    Write-Host "  Note: enabled_clients might need Dashboard config" -ForegroundColor Yellow
}

# --- Enable Frontend app on Username-Password connection ---
Write-Host "`n[2] Enabling Frontend app on Username-Password connection..." -ForegroundColor Cyan
$dbConn = Invoke-RestMethod -Uri "https://$AUTH0_DOMAIN/api/v2/connections?strategy=auth0" -Headers $headers
$dbId = $dbConn[0].id
$dbClients = @($dbConn[0].enabled_clients)
if ($FRONTEND_CLIENT_ID -notin $dbClients) {
    $dbClients += $FRONTEND_CLIENT_ID
}
try {
    $resp = Invoke-WebRequest -Method Patch -Uri "https://$AUTH0_DOMAIN/api/v2/connections/$dbId" -Headers $headers -Body (@{ enabled_clients = $dbClients } | ConvertTo-Json) -UseBasicParsing
    Write-Host "  DB connection updated" -ForegroundColor Green
} catch {
    Write-Host "  Note: enabled_clients might need Dashboard config" -ForegroundColor Yellow
}

# --- Create GitHub connection ---
Write-Host "`n[3] Creating GitHub social connection..." -ForegroundColor Cyan
$existingGh = Invoke-RestMethod -Uri "https://$AUTH0_DOMAIN/api/v2/connections?strategy=github" -Headers $headers
if ($existingGh.Count -gt 0) {
    Write-Host "  GitHub connection already exists: $($existingGh[0].id)" -ForegroundColor Green
} else {
    Write-Host "  GitHub connection needs OAuth App credentials from github.com" -ForegroundColor Yellow
    Write-Host "  Create one at: https://github.com/settings/developers" -ForegroundColor Yellow
}

# --- Enable MFA (Guardian) ---
Write-Host "`n[4] Enabling Guardian Push MFA..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Method Put -Uri "https://$AUTH0_DOMAIN/api/v2/guardian/factors/push-notification" -Headers $headers -Body '{"enabled":true}'
    Write-Host "  Guardian Push enabled" -ForegroundColor Green
} catch {
    Write-Host "  Guardian Push may already be enabled or needs manual config" -ForegroundColor Yellow
}

# --- Enable MFA policy ---
Write-Host "`n[5] Setting MFA policy to 'confidence-provider'..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Method Put -Uri "https://$AUTH0_DOMAIN/api/v2/guardian/policies" -Headers $headers -Body '["confidence-provider"]'
    Write-Host "  MFA policy set" -ForegroundColor Green
} catch {
    Write-Host "  MFA policy update failed: $_" -ForegroundColor Yellow
}

# --- Create Post-Login Action for Step-Up MFA ---
Write-Host "`n[6] Creating Post-Login Action: Enforce Step-Up for High Value Scopes..." -ForegroundColor Cyan
$actionCode = @'
exports.onExecutePostLogin = async (event, api) => {
  const requestedScopes = (event.transaction?.requested_scopes || []);
  const hasHighValue = requestedScopes.some(s => s === 'publish:article');
  
  if (hasHighValue) {
    const completedMfa = event.authentication?.methods?.some(m => m.name === 'mfa');
    if (!completedMfa) {
      api.authentication.challengeWithAny([{ type: 'push-notification' }, { type: 'otp' }]);
    }
  }
};
'@

$actionBody = @{
    name = 'Enforce Step-Up for High Value Scopes'
    supported_triggers = @(@{ id = 'post-login'; version = 'v3' })
    code = $actionCode
} | ConvertTo-Json -Depth 3

try {
    $action = Invoke-RestMethod -Method Post -Uri "https://$AUTH0_DOMAIN/api/v2/actions/actions" -Headers $headers -Body $actionBody
    Write-Host "  Action created: $($action.id)" -ForegroundColor Green
    
    # Deploy the action
    Write-Host "  Deploying action..." -ForegroundColor Cyan
    $deploy = Invoke-RestMethod -Method Post -Uri "https://$AUTH0_DOMAIN/api/v2/actions/actions/$($action.id)/deploy" -Headers $headers -Body '{}'
    Write-Host "  Action deployed" -ForegroundColor Green
    
    # Bind to post-login trigger
    Write-Host "  Binding to post-login trigger..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $bindings = Invoke-RestMethod -Uri "https://$AUTH0_DOMAIN/api/v2/actions/triggers/post-login/bindings" -Headers $headers
    $existingBindings = @()
    if ($bindings.bindings) {
        foreach ($b in $bindings.bindings) {
            $existingBindings += @{ ref = @{ type = 'binding_id'; value = $b.id } }
        }
    }
    $existingBindings += @{ ref = @{ type = 'action_id'; value = $action.id }; display_name = 'Enforce Step-Up for High Value Scopes' }
    $bindBody = @{ bindings = $existingBindings } | ConvertTo-Json -Depth 4
    $bindResp = Invoke-RestMethod -Method Patch -Uri "https://$AUTH0_DOMAIN/api/v2/actions/triggers/post-login/bindings" -Headers $headers -Body $bindBody
    Write-Host "  Bound to post-login trigger" -ForegroundColor Green
} catch {
    $errMsg = $_.ErrorDetails.Message
    if ($errMsg -match 'already exists') {
        Write-Host "  Action already exists" -ForegroundColor Green
    } else {
        Write-Host "  Action creation issue: $errMsg" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Auth0 setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Manual steps remaining:" -ForegroundColor Yellow
Write-Host "  1. Activate My Account API in Auth0 Dashboard" -ForegroundColor Yellow
Write-Host "     (Applications > APIs > My Account API > Activate)" -ForegroundColor Gray
Write-Host "  2. Enable MRRT for Frontend app" -ForegroundColor Yellow
Write-Host "     (Applications > Frontend App > Settings > Multi-Resource Refresh Token)" -ForegroundColor Gray
Write-Host "  3. If GitHub needed: create GitHub OAuth App and configure connection" -ForegroundColor Yellow
Write-Host "     (https://github.com/settings/developers)" -ForegroundColor Gray
