param(
    [int]$IntervalSeconds = 2,
    [int]$MaxCaptures = 300
)

$scriptPath = Join-Path $PSScriptRoot "capture_spine_screen.ps1"
for ($i = 0; $i -lt $MaxCaptures; $i++) {
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath | Out-Null
    Start-Sleep -Seconds $IntervalSeconds
}
