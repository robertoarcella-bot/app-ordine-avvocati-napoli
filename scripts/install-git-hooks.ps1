<#
.SYNOPSIS
  Installa gli hook git che duplicano la repo su Google Drive dopo ogni
  commit, merge (pull) e checkout. Da lanciare una volta per ogni clone:
    powershell -File scripts\install-git-hooks.ps1

  Gli hook avviano scripts\sync-gdrive.ps1 in un processo separato e
  nascosto, quindi git non resta in attesa della copia.
#>
$root = (git rev-parse --show-toplevel) -replace '/', '\'
if (-not $root) { throw 'Non sono dentro una repo git' }
$hooksDir = Join-Path $root '.git\hooks'

$hook = @'
#!/bin/sh
# Duplica la repo su Google Drive in background (scripts/sync-gdrive.ps1)
SCRIPT="$(cygpath -w "$(git rev-parse --show-toplevel)/scripts/sync-gdrive.ps1")"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command \
  "Start-Process powershell.exe -WindowStyle Hidden -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','$SCRIPT','-Quiet'" \
  >/dev/null 2>&1 &
exit 0
'@ -replace "`r`n", "`n"

foreach ($name in 'post-commit', 'post-merge', 'post-checkout') {
  $path = Join-Path $hooksDir $name
  [IO.File]::WriteAllText($path, $hook, (New-Object Text.UTF8Encoding($false)))
  "installato $path"
}
