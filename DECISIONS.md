# Technikai döntések

## 2026-10-11 — Önálló frontend
A repository üres volt, csak a master prompt létezett. Vanilla JS modulokkal kezdünk, PHP beépített szerver biztosítja a lokális indítást. Symfony/Doctrine bevezetése M5-ben történik; a mostani helyi tárolás nem backendhelyettesítő.

## Tanulási egységek
A betűk string alapú tanulási egységek; CS/DZS és más többjegyű betűk nem karakterekre bontva szerepelnek. A feladat domain motorja független a DOM-tól, injektálható órával és véletlenforrással tesztelhető.

## Értékelés
Egy kijavított feladat completed=true, de korábbi tévesztés esetén correct=false. Az egyes válaszok külön tárolódnak, így a későbbi statisztika nem mutat hamis 100%-os felismerést.

## Grafika
Külön HTML/CSS elemek rendszeremojikkal adnak azonnal használható placeholder világot, külső letöltések nélkül. A grafika platformonként eltérhet; a helyszínek azonosítója és felirata stabil marad. Egyéni SVG-k később cserélhetők.

## Backend
Symfony 7.4 és Doctrine külön `backend/` könyvtárban, hogy a már működő önálló frontend megmaradjon a DB/API kialakítása alatt. ChildReward és SkillProgress technikai id-t, valamint összetett UNIQUE indexet kapott. Minden entitás explicit mezőtípusokat használ. A hitelesítés, szerveroldali válaszellenőrzés és frontend-bekötés még következő M5-feladat.

## 2026-10-11 — M5–M10 és hardening
- M5 implementálva: a backend és frontend ugyanazon origin, helyben router.php kapcsolja össze. Cookie-hoz kötött minimális demo profil, CSRF, server-issued Exercise példány és szerveroldali válaszellenőrzés. Külön zorka_learning/zorka_learning_test DB és külön felhasználó, secret csak ignorált env-fájlban.
- A lockolt Doctrine csomagok PHP 8.4-et igényelnek; a composer.json és dokumentáció ezt rögzíti (a PHP 8.2+ preferencián belüli magasabb minimum). A tényleges tesztkörnyezet PHP 8.5.4/MySQL 8.4.11.
- Exercise globális katalógus helyett kiadott, sessionhöz kötött feladatpéldány; a canonical adat közös generált learning.json. completed és UNIQUE válaszszám védi a retry-t. Minden tévesztés külön rekord, raw rajz helyett score tárolódik.
- A szülői számtani kapu véletlen belépés ellen véd; nem account-hitelesítés. A jelenlegi személyes profil böngészőcookie-hoz kötött. A kapu 15 percig érvényes, öt hibás válasz után 30 mp várakozás, kilépéskor lock.
- Determinisztikus adaptív betűválasztás, confidence-alapú súly és utolsó két egység kihagyása; szavak/írás/olvasás statisztikái készülnek, adaptív sorrendjük még nincs.
- Jutalmak fix 1/5/10/20 befejezett feladatnál, nincs levonás vagy streak. Az offline helyi jutalom nem hiteles szerveradat.
- Service worker statikus allowlistet tárol, API-t soha. Reconnect retry csak korábban szervertől kiadott szöveges feladatra, raw rajz nem kerül helyi tárolóba. Teljes offline-generált eredményhez később külön szinkronprotokoll kell.
- Hang csak magyar localService voice-szal; hiányában vizuális fallback. Nincs külső TTS-adatküldés.
- M11 nem lezárt: emulált touch és CDP installability nem helyettesít tényleges Android/tablet és production próbaeredményt.
