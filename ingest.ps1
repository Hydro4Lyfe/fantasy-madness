# ingest.ps1
# Root helper for running the Fantasy Madness ingest service (local or Docker)
# Usage examples are at the bottom.

[CmdletBinding()]
param(
  # How to run: docker (default) or local
  [ValidateSet("docker", "local")]
  [string]$RunAs = "docker",

  # Action: live (service), sync (one tournament), backfill (years), status (db-only)
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("live", "sync", "backfill", "status")]
  [string]$Action,

  # Common flags
  [ValidateSet("summary", "full")]
  [string]$Mode = "summary",

  [switch]$Print,

  # Tournament targeting
  [string]$TournamentId,
  [int]$SeasonYear,

  # Backfill targeting
  [int]$FromYear,
  [int]$ToYear,
  [string]$Years, # comma-separated list: "2019,2021,2024"

  # Env + image
  [string]$EnvFile = "apps/ingest/.env",
  [string]$Image = "fantasy-madness-ingest:dev",
  [string]$Dockerfile = "apps/ingest/Dockerfile",

  # Optional: rebuild image / build local dist before running
  [switch]$Build
)

$ErrorActionPreference = "Stop"

function Assert-Root {
  if (!(Test-Path "package.json")) {
    throw "Run this from the repo root (where package.json lives)."
  }
}

function Warn-IfQuotedEnv([string]$path) {
  if (!(Test-Path $path)) { return }
  $lines = Get-Content $path -ErrorAction SilentlyContinue
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim -match '^\s*#' -or $trim.Length -eq 0) { continue }
    if ($trim -match '^(SPORTRADAR_BASE_URL|SPORTRADAR_API_KEY)\s*=\s*".*"\s*$') {
      Write-Warning "Your $path contains quoted env values (e.g. KEY=""...""), which Docker --env-file will keep. Remove the quotes."
      break
    }
  }
}

function Build-DockerImage {
  Write-Host "Building Docker image $Image from $Dockerfile ..."
  docker build -f $Dockerfile -t $Image .
}

function Build-LocalIngest {
  Write-Host "Building local ingest dist..."
  npm -w @fantasy-madness/ingest run build
}

function Run-Docker([string[]]$cliArgs) {
  Warn-IfQuotedEnv $EnvFile

  $cmd = @(
    "run", "--rm",
    "--env-file", $EnvFile,
    $Image
  ) + $cliArgs

  Write-Host ("docker " + ($cmd -join " "))
  docker @cmd
}

function Run-Local([string[]]$cliArgs) {
  # Uses ingest start script: node --env-file=.env dist/index.js ...
  # Assumes apps/ingest/.env exists.
  $cmd = @(
    "-w", "@fantasy-madness/ingest", "run", "start", "--"
  ) + $cliArgs

  Write-Host ("npm " + ($cmd -join " "))
  npm @cmd
}

function Require([bool]$cond, [string]$msg) {
  if (-not $cond) { throw $msg }
}

# --------------------------
# Main
# --------------------------
Assert-Root

if ($Build) {
  if ($RunAs -eq "docker") { Build-DockerImage } else { Build-LocalIngest }
}

# Build CLI args for dist/index.js
$cli = @()

switch ($Action) {
  "live" {
    # No args, or explicitly: "live"
    $cli += @("live")
  }

  "sync" {
    Require ($TournamentId), "sync requires -TournamentId"
    Require ($SeasonYear -gt 0), "sync requires -SeasonYear (e.g. 2024)"
    $cli += @("sync", "--tournamentId", $TournamentId, "--seasonYear", "$SeasonYear", "--mode", $Mode)
    if ($Print) { $cli += "--print" }
  }

  "backfill" {
    $cli += @("backfill", "--mode", $Mode)
    if ($Years) {
      $cli += @("--years", $Years)
    } else {
      Require ($FromYear -gt 0 -and $ToYear -gt 0), "backfill requires either -Years (e.g. 2019,2021,2024) OR -FromYear and -ToYear"
      $cli += @("--fromYear", "$FromYear", "--toYear", "$ToYear")
    }
    if ($Print) { $cli += "--print" }
  }

  "status" {
    Require ($TournamentId), "status requires -TournamentId"
    $cli += @("status", "--tournamentId", $TournamentId)
  }
}

# Execute
if ($RunAs -eq "docker") {
  Run-Docker $cli
} else {
  Run-Local $cli
}

<#
--------------------------
Examples (PowerShell)
--------------------------

# 1) Docker: build image, then run summary-only sync (bracket validation)
.\ingest.ps1 docker sync -Build -TournamentId 56befd3f-4024-47c4-900f-892883cc1b6b -SeasonYear 2024 -Mode summary -Print

# 2) Docker: full sync
.\ingest.ps1 docker sync -TournamentId 56befd3f-4024-47c4-900f-892883cc1b6b -SeasonYear 2024 -Mode full -Print

# 3) Docker: backfill range
.\ingest.ps1 docker backfill -FromYear 2018 -ToYear 2024 -Mode summary -Print

# 4) Docker: backfill specific years
.\ingest.ps1 docker backfill -Years "2019,2021,2024" -Mode summary -Print

# 5) Docker: status (no API calls)
.\ingest.ps1 docker status -TournamentId 56befd3f-4024-47c4-900f-892883cc1b6b

# 6) Local (uses npm workspace start): build dist then run
.\ingest.ps1 local sync -Build -TournamentId 56befd3f-4024-47c4-900f-892883cc1b6b -SeasonYear 2024 -Mode summary -Print

# 7) Docker: live/service mode
.\ingest.ps1 docker live

#>
