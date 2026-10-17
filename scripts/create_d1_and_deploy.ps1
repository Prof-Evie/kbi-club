<#
Automates creating a Cloudflare D1 database, importing schema/data, updating wrangler.jsonc,
and deploying the project. Run from project root in PowerShell.

Usage:
  .\scripts\create_d1_and_deploy.ps1 [-SkipInstall] [-SkipData]

Notes:
  - Requires Node.js and wrangler (bundled via npx is used).
  - The script will call `npx wrangler login` which opens a browser for auth when interactive.
  - The script parses the `database_id` line printed by `wrangler d1 create` and
    replaces the placeholder in `wrangler.jsonc`.
#>

param(
    [switch]$SkipInstall,
    [switch]$SkipData
)

function ExitWith($code, $msg) {
    Write-Host $msg -ForegroundColor Red
    exit $code
}

Write-Host "Starting Cloudflare D1 + deploy automation..." -ForegroundColor Cyan

if (-not $SkipInstall) {
    Write-Host "Running npm install (this may take a while)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { ExitWith 2 "npm install failed." }
}

Write-Host "Using non-interactive mode: checking CF_API_TOKEN..." -ForegroundColor Yellow
if (-not $env:CF_API_TOKEN) {
    ExitWith 3 "Environment variable CF_API_TOKEN is not set. Set it to a Cloudflare API token with Workers and D1 permissions before running this script." 
}

# Export token for wrangler
$env:CLOUDFLARE_API_TOKEN = $env:CF_API_TOKEN

Write-Host "Creating D1 database named 'kbiclub' (non-interactive)..." -ForegroundColor Yellow
$accountArg = $null
if ($env:CF_ACCOUNT_ID) { $accountArg = $env:CF_ACCOUNT_ID } elseif ($env:CLOUDFLARE_ACCOUNT_ID) { $accountArg = $env:CLOUDFLARE_ACCOUNT_ID }

Write-Host "wrangler version:" -ForegroundColor Gray
try { & npx wrangler --version } catch { Write-Host "(wrangler --version failed)" -ForegroundColor Yellow }

Write-Host "wrangler whoami (checks token permissions):" -ForegroundColor Gray
try {
    $whoamiOut = & npx wrangler whoami 2>&1
    Write-Host $whoamiOut
    if ($whoamiOut -match "User API Token") {
        Write-Host "WARNING: Detected a User API Token. For non-interactive D1 creation you usually need an Account-level API token with D1 'Edit' permission." -ForegroundColor Yellow
    }
} catch {
    Write-Host "(wrangler whoami failed)" -ForegroundColor Yellow
}

# Build command arguments safely (invoke via `npx wrangler ...`)
# NOTE: removed unsupported flags --yes and --verbose which cause "Unknown arguments" in some wrangler versions.
$args = @('wrangler','d1','create','kbiclub')
if ($accountArg) { $args += @('--account-id',$accountArg) }

Write-Host "Running: npx $($args -join ' ')" -ForegroundColor Gray
try {
    $createOut = & npx @args 2>&1
} catch {
    $createOut = $_.Exception.Message
}
Write-Host "Create output:" -ForegroundColor Gray
Write-Host $createOut

# Try to parse database_id from output
$dbId = $null
if ($createOut -match 'database_id\s*=\s*"?([0-9a-fA-F\-]{36})"?') { $dbId = $matches[1] }
elseif ($createOut -match 'database_id\s*:\s*"?([0-9a-fA-F\-]{36})"?') { $dbId = $matches[1] }
elseif ($createOut -match '([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})') { $dbId = $matches[1] }

if (-not $dbId) {
    Write-Host "Could not parse database_id from wrangler output." -ForegroundColor Yellow
    if ($env:CF_D1_DATABASE_ID) {
        Write-Host "Found CF_D1_DATABASE_ID in environment; using that value." -ForegroundColor Green
        $dbId = $env:CF_D1_DATABASE_ID
    } else {
        Write-Host "Attempting to list existing D1 databases for debugging..." -ForegroundColor Yellow
        try {
            $listArgs = @('wrangler','d1','list','--json')
            if ($accountArg) { $listArgs += @('--account-id',$accountArg) }
            $listOut = & npx @listArgs 2>&1
            Write-Host $listOut
            # try parse JSON and find database named kbiclub
            try {
                $json = $listOut | ConvertFrom-Json
                $match = $json | Where-Object { $_.name -eq 'kbiclub' }
                if ($match) {
                    $dbId = $match.id
                    Write-Host "Found existing kbiclub database with id: $dbId" -ForegroundColor Green
                }
            } catch {
                Write-Host "(could not parse JSON list output)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "(wrangler d1 list failed)" -ForegroundColor Yellow
        }
        if (-not $dbId) {
            Write-Host "ERROR: Unable to create D1 database automatically. Possible causes: insufficient API token permissions (needs Account · D1 Databases: Edit), or D1 is unavailable for this account." -ForegroundColor Red
            Write-Host "Action: Create the D1 database manually in the Cloudflare dashboard or create an Account-level API token with these permissions and add it to GitHub Secrets as CF_API_TOKEN:" -ForegroundColor Red
            Write-Host "  - Account: D1 Databases -> Edit" -ForegroundColor Red
            Write-Host "  - Workers: Scripts -> Edit" -ForegroundColor Red
            Write-Host "Or set CF_D1_DATABASE_ID in the environment to skip creation." -ForegroundColor Red
            exit 1
        }
    }
}
if ($LASTEXITCODE -ne 0) {
    Write-Host $createOut
    ExitWith 4 "Failed to create D1 database. See output above." 
}

# Try to extract database_id from known output formats (again, in case it was filled during listing)
$dbId = $null
if ($createOut -match 'database_id\s*=\s*"?([0-9a-fA-F\-]{36})"?') { $dbId = $matches[1] }
elseif ($createOut -match 'database_id\s*:\s*"?([0-9a-fA-F\-]{36})"?') { $dbId = $matches[1] }
elseif ($createOut -match '([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})') { $dbId = $matches[1] }

if (-not $dbId) {
    Write-Host $createOut
    ExitWith 5 "Could not parse database_id from wrangler output. Please run 'npx wrangler d1 create kbi-db' manually and paste the database_id into wrangler.jsonc" 
}

Write-Host "Found D1 database_id: $dbId" -ForegroundColor Green

$wranglerPath = Join-Path (Get-Location) 'wrangler.jsonc'
if (-not (Test-Path $wranglerPath)) { ExitWith 6 "Could not find wrangler.jsonc in current directory." }

$content = Get-Content $wranglerPath -Raw
if ($content -notmatch 'PASTE_YOUR_D1_DATABASE_ID_HERE') {
    Write-Host "Warning: placeholder not found in wrangler.jsonc — will still attempt to replace any existing id." -ForegroundColor Yellow
}

$new = $content -replace 'PASTE_YOUR_D1_DATABASE_ID_HERE', $dbId
Set-Content -Path $wranglerPath -Value $new -Encoding UTF8
Write-Host "Updated wrangler.jsonc with new database_id." -ForegroundColor Green

Write-Host "Importing schema to remote D1..." -ForegroundColor Yellow
npm run cf:d1-schema-remote
if ($LASTEXITCODE -ne 0) { ExitWith 7 "Failed to execute schema import (cf:d1-schema-remote)." }

if (-not $SkipData) {
    Write-Host "Importing data to remote D1..." -ForegroundColor Yellow
    npm run cf:d1-data-remote
    if ($LASTEXITCODE -ne 0) { ExitWith 8 "Failed to execute data import (cf:d1-data-remote)." }
} else {
    Write-Host "Skipping data import as requested." -ForegroundColor Yellow
}

Write-Host "Building and deploying to Cloudflare..." -ForegroundColor Yellow
npm run cf:deploy
if ($LASTEXITCODE -ne 0) { ExitWith 9 "Deployment failed (cf:deploy)." }

Write-Host "Deployment complete. Use 'npx wrangler tail' to watch logs or open your workers.dev URL." -ForegroundColor Green

exit 0
