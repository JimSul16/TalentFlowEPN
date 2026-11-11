<#
.SYNOPSIS
    Gestor de skills para Antigravity / Gemini CLI en TalentFlow.
.DESCRIPTION
    Permite activar, desactivar, buscar y listar skills desde la biblioteca local (.agent/skills_library)
    hacia la carpeta de skills activas (.agent/skills).
.EXAMPLE
    .\activate-skill.ps1 -List
    .\activate-skill.ps1 -Search "stripe"
    .\activate-skill.ps1 -Skill "stripe-payments"
    .\activate-skill.ps1 -Deactivate "stripe-payments"
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$Skill,

    [Parameter()]
    [string]$Search,

    [Parameter()]
    [string]$Deactivate,

    [Parameter()]
    [switch]$List
)

$libraryDir = Join-Path $PSScriptRoot ".agent/skills_library"
$activeDir  = Join-Path $PSScriptRoot ".agent/skills"

if (-not (Test-Path $libraryDir)) {
    Write-Error "No se encontro la biblioteca de skills en: $libraryDir"
    exit 1
}

if (-not (Test-Path $activeDir)) {
    New-Item -ItemType Directory -Path $activeDir -Force | Out-Null
}

# 1. Listar skills activas
if ($List) {
    $active = Get-ChildItem -Path $activeDir -Directory | Select-Object -ExpandProperty Name
    Write-Host "`n=== Skills Activas en .agent/skills ($($active.Count)) ===" -ForegroundColor Cyan
    $active | ForEach-Object { Write-Host " - $_" -ForegroundColor Green }
    exit 0
}

# 2. Buscar en la biblioteca
if ($Search) {
    Write-Host "`nBuscando '$Search' en .agent/skills_library..." -ForegroundColor Cyan
    $results = Get-ChildItem -Path $libraryDir -Directory | Where-Object { $_.Name -like "*$Search*" }
    if ($results) {
        Write-Host "Encontradas $($results.Count) skills coincidentes:" -ForegroundColor Green
        $results | ForEach-Object {
            $isActive = Test-Path (Join-Path $activeDir $_.Name)
            $badge = if ($isActive) { "[ACTIVA]" } else { "[disponible]" }
            $color = if ($isActive) { "Yellow" } else { "Gray" }
            Write-Host " $badge $($_.Name)" -ForegroundColor $color
        }
    } else {
        Write-Host "No se encontraron skills con el termino '$Search'." -ForegroundColor DarkYellow
    }
    exit 0
}

# 3. Desactivar skill
if ($Deactivate) {
    $target = Join-Path $activeDir $Deactivate
    if (Test-Path $target) {
        Remove-Item -Path $target -Recurse -Force
        Write-Host "Skill '$Deactivate' desactivada de .agent/skills." -ForegroundColor Green
    } else {
        Write-Warning "La skill '$Deactivate' no esta activa."
    }
    exit 0
}

# 4. Activar skill
if ($Skill) {
    $src = Join-Path $libraryDir $Skill
    $dst = Join-Path $activeDir $Skill

    if (-not (Test-Path $src)) {
        Write-Error "La skill '$Skill' no existe en .agent/skills_library."
        exit 1
    }

    if (Test-Path $dst) {
        Write-Host "La skill '$Skill' ya esta activa." -ForegroundColor Yellow
        exit 0
    }

    Copy-Item -Path $src -Destination $dst -Recurse -Force
    Write-Host "Skill '$Skill' activada correctamente en .agent/skills." -ForegroundColor Green
    exit 0
}

Write-Host "Uso: .\activate-skill.ps1 [-Skill <nombre>] [-Search <palabra>] [-Deactivate <nombre>] [-List]" -ForegroundColor Cyan
