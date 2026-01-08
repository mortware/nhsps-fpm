[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'init', 'seed', 'down', 'rm', 'status')]
  [string] $Action = 'status',

  [string] $ContainerName = 'fpm-postgis',
  [string] $VolumeName = 'fpm_pgdata',
  [string] $Image = 'postgis/postgis:16-3.4',

  [int] $HostPort = 5432,
  [string] $Database = 'fpm',
  [string] $Username = 'postgres',
  [string] $Password = 'postgres',

  [switch] $RemoveVolume
)

$ErrorActionPreference = 'Stop'

function Test-DockerRunning {
  docker version *> $null
}

function Get-ContainerExists([string] $name) {
  $id = (docker ps -a --filter "name=^${name}$" --format '{{.ID}}')
  return -not [string]::IsNullOrWhiteSpace($id)
}

function Get-ContainerRunning([string] $name) {
  $id = (docker ps --filter "name=^${name}$" --format '{{.ID}}')
  return -not [string]::IsNullOrWhiteSpace($id)
}

function Ensure-ContainerUp {
  if (-not (Get-ContainerExists $ContainerName)) {
    Write-Host "Creating container '$ContainerName' on localhost:$HostPort..."
    docker run -d --name $ContainerName -p "${HostPort}:5432" `
      -e "POSTGRES_PASSWORD=$Password" `
      -e "POSTGRES_DB=$Database" `
      -e "POSTGRES_USER=$Username" `
      -v "${VolumeName}:/var/lib/postgresql/data" `
      $Image | Out-Null
  }

  if (-not (Get-ContainerRunning $ContainerName)) {
    Write-Host "Starting container '$ContainerName'..."
    docker start $ContainerName | Out-Null
  }
}

function Invoke-InitSql {
  $initSqlPath = Join-Path $PSScriptRoot 'src\api\db\init.sql'
  if (-not (Test-Path $initSqlPath)) {
    throw "Cannot find init.sql at: $initSqlPath"
  }

  Write-Host "Applying schema/seed from $initSqlPath ..."
  Get-Content -Raw $initSqlPath | docker exec -i $ContainerName psql -U $Username -d $Database | Out-Host
}

function Invoke-Seed {
  Ensure-ContainerUp

  # Ensure schema exists, then reset the table so init.sql will seed fresh.
  Invoke-InitSql
  docker exec -i $ContainerName psql -U $Username -d $Database -c "TRUNCATE TABLE rooms RESTART IDENTITY;" | Out-Host
  Invoke-InitSql
}

try {
  Test-DockerRunning

  switch ($Action) {
    'up' {
      Ensure-ContainerUp
      docker ps --filter "name=^${ContainerName}$" | Out-Host
    }
    'init' {
      Ensure-ContainerUp
      Invoke-InitSql
    }
    'seed' {
      Invoke-Seed
    }
    'down' {
      if (Get-ContainerRunning $ContainerName) {
        docker stop $ContainerName | Out-Null
        Write-Host "Stopped '$ContainerName'."
      }
      else {
        Write-Host "'$ContainerName' is not running."
      }
    }
    'rm' {
      if (Get-ContainerRunning $ContainerName) {
        docker stop $ContainerName | Out-Null
      }
      if (Get-ContainerExists $ContainerName) {
        docker rm $ContainerName | Out-Null
        Write-Host "Removed container '$ContainerName'."
      }
      else {
        Write-Host "Container '$ContainerName' does not exist."
      }

      if ($RemoveVolume) {
        docker volume rm $VolumeName | Out-Null
        Write-Host "Removed volume '$VolumeName'."
      }
    }
    'status' {
      docker ps -a --filter "name=^${ContainerName}$" | Out-Host
    }
  }
}
catch {
  Write-Error $_
  exit 1
}
