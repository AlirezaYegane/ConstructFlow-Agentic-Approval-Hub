$envFile = Join-Path $PSScriptRoot "..\apps\api\.env"

@"
DATABASE_URL=sqlite:///./constructflow.db
AUTH_PROVIDER=demo
STORAGE_PROVIDER=local
NOTIFICATION_PROVIDER=local
GOOGLE_INTEGRATIONS_ENABLED=false
RBAC_ENABLED=false
"@ | Set-Content -Encoding UTF8 $envFile

Write-Host "Switched to SQLITE config."
