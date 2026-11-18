<#
.SYNOPSIS
  Duplica la repo di lavoro (C:\dev\APP_COA\app-coa) nella copia su Google Drive.

.DESCRIPTION
  Dal 18/11/2026 la repo "viva" sta su disco locale: Google Drive per desktop
  crea desktop.ini anche dentro .git/refs (git fetch/pull falliscono) e altera
  i file durante le build. La cartella su Drive resta una copia speculare,
  aggiornata da questo script:
    - lanciato in automatico dagli hook git post-commit / post-merge /
      post-checkout (in background, vedi scripts/install-git-hooks.ps1);
    - lanciabile a mano: powershell -File scripts\sync-gdrive.ps1

  Copia speculare (robocopy /MIR) INCLUSA la cartella .git, ESCLUSI:
  dipendenze (node_modules), output di build (dist, build, .gradle, .kotlin,
  asset web sincronizzati in android) e i desktop.ini di Drive. Le cartelle e
  i file esclusi non vengono né copiati né cancellati sulla destinazione.

.PARAMETER Quiet
  Nessun output a console (usato dagli hook); il log resta comunque scritto.
#>
param(
  [string]$Source = 'C:\dev\APP_COA\app-coa',
  [string]$Dest   = 'G:\Il mio Drive\002_APPLICAZIONI\12_APP_COA\app-coa',
  [switch]$Quiet
)

$log = Join-Path (Split-Path $Source -Parent) 'sync-gdrive.log'
$rcLog = Join-Path (Split-Path $Source -Parent) 'sync-gdrive-robocopy.log'

if (-not (Test-Path $Source)) { throw "Sorgente inesistente: $Source" }
if (-not (Test-Path (Split-Path $Dest -Parent))) { throw "Cartella Drive non raggiungibile: $(Split-Path $Dest -Parent)" }

# Un solo sync alla volta (gli hook possono scattare in rapida successione)
$mutex = New-Object System.Threading.Mutex($false, 'Global\COA_app_sync_gdrive')
if (-not $mutex.WaitOne([TimeSpan]::FromMinutes(10))) { throw 'Altro sync in corso da oltre 10 minuti' }
try {
  $xd = @(
    'node_modules', 'dist', 'build', '.gradle', '.kotlin',
    (Join-Path $Source 'android\app\src\main\assets\public')
  )
  $rcArgs = @($Source, $Dest, '/MIR', '/XF', 'desktop.ini', '/XD') + $xd + @(
    '/R:2', '/W:2', '/MT:16', '/NP', '/NDL', "/LOG:$rcLog"
  )
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') sync $Source -> $Dest" | Out-File -FilePath $log -Append -Encoding utf8
  & robocopy @rcArgs | Out-Null
  $rc = $LASTEXITCODE
  # robocopy: 0-7 = successo (1 = file copiati, 2 = extra rimossi, ...), >= 8 = errori
  $esito = if ($rc -lt 8) { "OK (robocopy $rc)" } else { "ERRORE (robocopy $rc) - vedi $rcLog" }
  "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')   esito: $esito" | Out-File -FilePath $log -Append -Encoding utf8
  if (-not $Quiet) { "Sync Google Drive: $esito" }
  if ($rc -ge 8) { exit 1 }
} finally {
  $mutex.ReleaseMutex()
}
