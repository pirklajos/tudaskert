# Zorka elérése másik helyi eszközről

A WSL fejlesztőszerver `0.0.0.0:8080` címen figyel. Windows alapértelmezett WSL NAT mellett a telefon/tablet a Windows hálózati címén keresztül csatlakozik; ehhez Windows-porttovábbítás és helyi alhálózatra korlátozott tűzfalszabály szükséges.

Nyiss **rendszergazdai PowerShellt**, majd futtasd:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\lajos\codes\tudaskert\scripts\enable-lan.ps1"
```

Azonos Wi-Fi/hálózat másik eszközén: **http://192.168.1.110:8080**. A szkript ellenőrzi és szükség esetén indítja a szervert, beállítja a Windows IP Helper porttovábbítást, és csak a helyi alhálózatról engedi a 8080-as portot. Nem kell router-portnyitás.

IP-változás esetén futtasd újra; más Windows hálózati címhez add meg a `-LanAddress` paramétert. WSL-újraindítás után a WSL-cím is változhat. A gépnek bekapcsolva kell maradnia. A Wi-Fi vendéghálózat/eszközizoláció megakadályozhatja az eszközök közötti kapcsolatot.

A helyi HTTP-címen a normál gyakorlás és szülői felület működik. A PWA telepítés és service worker offline mód másik eszközön HTTPS-t igényel (a localhost kivétel csak saját gépen érvényes).

A LAN beállítás eltávolítása rendszergazdai PowerShellből:

```powershell
netsh interface portproxy delete v4tov4 listenaddress=192.168.1.110 listenport=8080
Remove-NetFirewallRule -Name Zorka-LAN-8080
```
