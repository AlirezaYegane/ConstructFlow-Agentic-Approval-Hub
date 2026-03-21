Write-Host "== ConstructFlow smoke demo =="

Write-Host "`n[1] Health"
Invoke-RestMethod http://127.0.0.1:8000/api/health | ConvertTo-Json -Depth 5

Write-Host "`n[2] Dashboard Summary"
Invoke-RestMethod http://127.0.0.1:8000/api/dashboard/summary | ConvertTo-Json -Depth 5

Write-Host "`n[3] Dashboard Charts"
Invoke-RestMethod http://127.0.0.1:8000/api/dashboard/charts | ConvertTo-Json -Depth 10

Write-Host "`n[4] Request"
Invoke-RestMethod http://127.0.0.1:8000/api/requests/11 | ConvertTo-Json -Depth 10

Write-Host "`n[5] Events"
Invoke-RestMethod http://127.0.0.1:8000/api/requests/11/events | ConvertTo-Json -Depth 10

Write-Host "`n[6] Document Preview"
Invoke-RestMethod http://127.0.0.1:8000/api/requests/11/document-preview | ConvertTo-Json -Depth 10
