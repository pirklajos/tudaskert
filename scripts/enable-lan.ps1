param(
    [string]$LanAddress = '192.168.1.110',
    [string]$ProjectPath = '/home/lajos/codes/tudaskert',
    [string]$LinuxUser = 'lajos'
)
$ErrorActionPreference = 'Stop'
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script in an Administrator PowerShell window.'
}
if (-not (Get-NetIPAddress -AddressFamily IPv4 -IPAddress $LanAddress -ErrorAction SilentlyContinue)) {
    throw "This computer does not have LAN address $LanAddress. Supply -LanAddress with its current Wi-Fi/Ethernet address."
}
$wslAddresses = (& wsl.exe -u $LinuxUser hostname -I).Trim().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
$wslAddress = $wslAddresses | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' } | Select-Object -First 1
if (-not $wslAddress) { throw 'Could not determine the WSL IPv4 address.' }
try {
    Invoke-WebRequest "http://${wslAddress}:8080/api/health" -UseBasicParsing -TimeoutSec 3 | Out-Null
} catch {
    Start-Process -FilePath wsl.exe -ArgumentList "-u $LinuxUser --cd $ProjectPath env APP_DEBUG=0 php -S 0.0.0.0:8080 -t public router.php" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Invoke-WebRequest "http://${wslAddress}:8080/api/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
}
Set-Service iphlpsvc -StartupType Automatic
Start-Service iphlpsvc
& netsh.exe interface portproxy add v4tov4 listenaddress=$LanAddress listenport=8080 connectaddress=$wslAddress connectport=8080
if ($LASTEXITCODE -ne 0) { throw 'Could not configure Windows port forwarding.' }
$ruleName = 'Zorka-LAN-8080'
if (Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -Name $ruleName
}
New-NetFirewallRule -Name $ruleName -DisplayName 'Zorka - local network port 8080' -Direction Inbound -Action Allow -Protocol TCP -LocalAddress $LanAddress -LocalPort 8080 -RemoteAddress LocalSubnet -Profile Any | Out-Null
Invoke-WebRequest "http://${LanAddress}:8080/api/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
Write-Host "Zorka is available on the same local network: http://${LanAddress}:8080"
Write-Host 'Run this script again if the Windows or WSL IP address changes.'
