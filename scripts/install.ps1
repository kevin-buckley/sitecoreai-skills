<#
.SYNOPSIS
Install or update the SitecoreAI skills into an agent's skills directory.

.DESCRIPTION
For Claude Code, prefer the plugin:
    /plugin marketplace add kevin-buckley/sitecoreai-skills
    /plugin install sitecoreai-skills@sitecoreai-skills

This script is for agents without a plugin system (Cursor, Codex, Goose, ...),
and for installing a subset.

.EXAMPLE
./scripts/install.ps1
.EXAMPLE
./scripts/install.ps1 -Dest "$HOME/.cursor/skills"
.EXAMPLE
./scripts/install.ps1 -Category migration
.EXAMPLE
./scripts/install.ps1 -Only sitecoreai-media,sitecoreai-workflow
.EXAMPLE
./scripts/install.ps1 -Link
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]   $Dest = (Join-Path $HOME ".claude/skills"),
    [ValidateSet("migration", "authoring", "project-review")]
    [string]   $Category,
    [string[]] $Only,
    [switch]   $Link,
    [switch]   $Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$src      = Join-Path $repoRoot "skills"
if (-not (Test-Path $src)) { throw "No skills directory at $src" }

# Resolve the selection.
if ($Only) {
    $selected = foreach ($name in $Only) {
        $n = $name.Trim()
        if (-not (Test-Path (Join-Path $src $n))) { throw "No such skill: $n" }
        Get-Item (Join-Path $src $n)
    }
} else {
    $selected = Get-ChildItem -Path $src -Directory | Where-Object {
        if (-not $Category) { return $true }
        $skillFile = Join-Path $_.FullName "SKILL.md"
        (Get-Content $skillFile -Raw) -match "(?m)^\s+category:\s+$([regex]::Escape($Category))\s*$"
    }
}

if (-not $selected) {
    throw "Nothing selected$(if ($Category) { " for category '$Category'" })"
}

$mode = if ($Link) { " (symlinks)" } else { "" }
Write-Host "Installing $($selected.Count) skill(s) into $Dest$mode"

if (-not (Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

foreach ($skill in $selected) {
    $target = Join-Path $Dest $skill.Name

    # Only ever replace a directory we recognise as one of ours.
    $action = "install"
    if (Test-Path $target) {
        $isSkill = Test-Path (Join-Path $target "SKILL.md")
        $isLink  = (Get-Item $target -Force).LinkType
        if (-not $Force -and -not $isSkill -and -not $isLink) {
            throw "$target exists and is not a skill directory - refusing to replace it (use -Force)"
        }
        $action = "update"
    }

    if ($PSCmdlet.ShouldProcess($target, $action)) {
        if (Test-Path $target) { Remove-Item $target -Recurse -Force }
        if ($Link) {
            New-Item -ItemType SymbolicLink -Path $target -Target $skill.FullName | Out-Null
        } else {
            Copy-Item $skill.FullName -Destination $target -Recurse
        }
    }
    Write-Host ("  {0,-8} {1}" -f $action, $skill.Name)
}

Write-Host "Done. Restart your agent to pick up the changes."
