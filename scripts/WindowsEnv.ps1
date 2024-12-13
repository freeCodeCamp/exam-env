param(
    [string]$EnvPath = ".env",

    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Check if the .env file exists
if (!(Test-Path -Path $EnvPath)) {
    Write-Error "The specified .env file does not exist: $EnvPath"
    exit 1
}

# Load environment variables from the .env file
Get-Content $EnvPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $value)
    }
}

# Execute the provided command
Write-Host "Executing command: $Command"
Invoke-Expression $Command
