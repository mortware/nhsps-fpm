[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'down', 'status')]
  [string] $Action = 'up'
)

$ErrorActionPreference = 'Stop'

function Start-ChildPwsh(
  [Parameter(Mandatory)] [string] $WorkingDirectory,
  [Parameter(Mandatory)] [string] $Command,
  [Parameter(Mandatory)] [string] $Title
) {
  $escapedTitle = $Title.Replace('"', '""')
  $argList = @(
    '-NoProfile',
    '-NoExit',
    '-Command',
    "`$Host.UI.RawUI.WindowTitle='$escapedTitle'; Set-Location -LiteralPath '$WorkingDirectory'; $Command"
  )

  Start-Process -FilePath 'pwsh' -WorkingDirectory $WorkingDirectory -ArgumentList $argList | Out-Null
}

$repoRoot = $PSScriptRoot
$apiDir = Join-Path $repoRoot 'src\api'
$clientDir = Join-Path $repoRoot 'src\client'

switch ($Action) {
  'up' {
    & (Join-Path $repoRoot 'dev-db.ps1') up
    & (Join-Path $repoRoot 'dev-db.ps1') init

    Start-ChildPwsh -WorkingDirectory $apiDir -Title 'fpm API' -Command 'dotnet run'
    Start-ChildPwsh -WorkingDirectory $clientDir -Title 'fpm Client' -Command 'npm install; npm run dev'

    Write-Host 'Started DB, API, and client.'
    Write-Host 'API:    http://localhost:5085'
    Write-Host 'Client: check terminal output for Vite URL (usually http://localhost:5173)'
  }
  'down' {
    & (Join-Path $repoRoot 'dev-db.ps1') down
    Write-Host 'Stopped DB container. (API/client terminals are not auto-closed.)'
  }
  'status' {
    & (Join-Path $repoRoot 'dev-db.ps1') status
  }
}
