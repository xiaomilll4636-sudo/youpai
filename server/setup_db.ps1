$ErrorActionPreference = "Stop"

$pgDir = "$pwd\.pg"
$pgZip = "$pwd\.pg.zip"
$version = "16.2-1"
$url = "https://get.enterprisedb.com/postgresql/postgresql-$version-windows-x64-binaries.zip"

if (-not (Test-Path $pgDir)) {
    Write-Host "Downloading PostgreSQL binaries..."
    Invoke-WebRequest -Uri $url -OutFile $pgZip
    
    Write-Host "Extracting..."
    # expand-archive is slow, but we will use it
    Expand-Archive -Path $pgZip -DestinationPath $pwd -Force
    Rename-Item -Path "$pwd\pgsql" -NewName ".pg"
    Remove-Item -Path $pgZip
}

$binDir = "$pgDir\bin"
$dataDir = "$pgDir\data"
$logFile = "$pgDir\logfile.log"

if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing database cluster..."
    # Initialize with trust authentication for local dev
    & "$binDir\initdb.exe" -D $dataDir -U postgres -A trust
}

Write-Host "Starting database server (if not already running)..."
$pgRunning = Get-Process -Name postgres -ErrorAction SilentlyContinue
if (-not $pgRunning) {
    & "$binDir\pg_ctl.exe" -D $dataDir -l $logFile start
    Start-Sleep -Seconds 3
}

Write-Host "Creating database 'youpai_housekeeping'..."
# Ignore errors if DB already exists
& "$binDir\createdb.exe" -w -U postgres youpai_housekeeping 2>$null

Write-Host "Database setup complete. Connection string:"
Write-Host "postgres://postgres@localhost:5432/youpai_housekeeping"
