param(
  [Parameter(Mandatory=$false)]
  [string]$DatabaseUrl
)

if (-not $DatabaseUrl) {
  if ($env:DATABASE_URL) {
    $DatabaseUrl = $env:DATABASE_URL
  } else {
    Write-Host "Usage: .\scripts\apply_schema_to_db.ps1 -DatabaseUrl '<connection-string>'"
    Write-Host "Or set the environment variable DATABASE_URL and run the script without arguments."
    exit 1
  }
}

# Convert Windows path to a form docker can mount
$pwdPath = (Get-Location).Path
# When running docker on Windows, use the native path. The postgres image can read mounted files.

Write-Host "Using DATABASE_URL: (masked)"
# Mask credentials for output
try {
  $uri = [System.Uri]$DatabaseUrl
  Write-Host "Host: $($uri.Host)  DB: $($uri.AbsolutePath.TrimStart('/'))"
} catch {
  Write-Host "Provided DATABASE_URL could not be parsed; proceeding anyway."
}

# Apply schema
Write-Host "Applying schema.sql to target database..."
$schemaCmd = "docker run --rm -v `"$pwdPath`":/work -w /work postgres:15 psql \"$DatabaseUrl\" -f /work/database/schema/schema.sql"
Write-Host $schemaCmd
$schemaExit = cmd /c $schemaCmd
if ($LASTEXITCODE -ne 0) {
  Write-Error "schema.sql execution failed. See output above."
  exit $LASTEXITCODE
}

Write-Host "Schema applied successfully."

# Apply optional mock data if file exists
$seedPath = Join-Path -Path $pwdPath -ChildPath "database/seeds/mock_data.sql"
if (Test-Path $seedPath) {
  Write-Host "Applying mock_data.sql to target database..."
  $seedCmd = "docker run --rm -v `"$pwdPath`":/work -w /work postgres:15 psql \"$DatabaseUrl\" -f /work/database/seeds/mock_data.sql"
  Write-Host $seedCmd
  $seedExit = cmd /c $seedCmd
  if ($LASTEXITCODE -ne 0) {
    Write-Error "mock_data.sql execution failed. See output above."
    exit $LASTEXITCODE
  }
  Write-Host "Mock data applied successfully."
} else {
  Write-Host "No mock_data.sql found at database/seeds/mock_data.sql — skipping seeds."
}

Write-Host "Done. Please call the API health endpoint to verify:"
Write-Host "curl -H \"Origin: https://hyf-final-project-name-frontend.onrender.com\" https://hyf-final-project-name.onrender.com/api/health"
