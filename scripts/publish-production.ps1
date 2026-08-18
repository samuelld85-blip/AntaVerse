[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Message
)

$ErrorActionPreference = "Stop"
$projectDirectory = Split-Path -Parent $PSScriptRoot
$productionUrl = "https://qui-des-9-psi.vercel.app/"

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory)]
    [string]$Name,

    [Parameter(Mandatory)]
    [scriptblock]$Command
  )

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name a échoué avec le code $LASTEXITCODE."
  }
}

Push-Location -LiteralPath $projectDirectory
try {
  $branch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -ne "main") {
    throw "La publication doit être lancée depuis la branche main."
  }

  Invoke-CheckedCommand "Le build" { npm run build }
  Invoke-CheckedCommand "La vérification du diff" { git diff --check }
  Invoke-CheckedCommand "La préparation du commit" { git add --all }

  & git diff --cached --quiet
  $stagedDiffExitCode = $LASTEXITCODE
  if ($stagedDiffExitCode -eq 1) {
    $commitMessage = if ($Message.Trim()) {
      $Message.Trim()
    } else {
      "Publication production $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    Invoke-CheckedCommand "Le commit" { git commit -m $commitMessage }
  } elseif ($stagedDiffExitCode -ne 0) {
    throw "La vérification des changements préparés a échoué."
  }

  Invoke-CheckedCommand "Le push Git" { git push origin main }
  Invoke-CheckedCommand "Le déploiement Vercel" { npx --yes vercel@latest --prod --yes }

  $response = Invoke-WebRequest -Uri $productionUrl -UseBasicParsing
  if ($response.StatusCode -ne 200) {
    throw "La production répond avec le statut HTTP $($response.StatusCode)."
  }

  Write-Host "Publication terminée : $productionUrl" -ForegroundColor Green
} finally {
  Pop-Location
}
