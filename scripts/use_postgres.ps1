$envFile = Join-Path $PSScriptRoot "..\apps\api\.env"

@"
DATABASE_URL=postgresql+psycopg://constructflow:constructflow@localhost:5433/constructflow
AUTH_PROVIDER=demo
STORAGE_PROVIDER=local
NOTIFICATION_PROVIDER=local
GOOGLE_INTEGRATIONS_ENABLED=false
RBAC_ENABLED=false
"@ | Set-Content -Encoding UTF8 $envFile

Write-Host "Switched to POSTGRES config."
