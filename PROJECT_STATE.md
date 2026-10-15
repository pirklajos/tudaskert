# Projektállapot

Frissítve: 2026-10-11.

- Aktuális milestone: M11 — kiadás előtti ellenőrzés, folyamatban. M0–M10 kész.
- Aktuális task: valódi készülékes és éles HTTPS/webserver próba előkészítve, még nem végrehajtva.
- Legutóbb befejezett task: teljes regresszió, WCAG automatizált audit, Chromium installability, tiszta forrásból install és teszt-DB backup/restore ellenőrzése.
- Működik: négy tanulóhelyszín (3 felhős, 4 szavas, 10 írásminta, 5 olvasási típus); valódi MySQL session/eredménymentés; szerveroldali értékelés; adaptív betűválasztás; skill/stat aggregáció; kapuval védett szülői dashboard; fix küszöbös megőrzött matricák/dekorációk; PWA és teljes offline shell/gyakorlóadatok; kiadott szöveges feladatok reconnect szinkronja.
- Ismert korlátok: az emulált Chromium touch teszt nem helyettesít valódi Android/tablet ujjas próbát. Éles HTTPS/PHP-FPM routing és valódi telepítés nincs tesztelve. Csak böngészőhöz kötött személyes profil, account-hitelesítés nincs. Teljesen offline generált eredmény és raw rajz nélküli íráseredmény helyi marad, nem kerül hiteles DB statisztikába. Magyar helyi Speech API voice hiányában csak vizuális instrukció. A grafikák rendszeremoji/SVG placeholder assetek.
- Blokkolók: kódszintű blokk nincs. A valódi készülékek és a kijelölt éles környezet nincsenek elérhetővé téve ebben a munkamenetben. Docker nincs; a Compose opcionális és nem tesztelt. Git author nincs beállítva, így commit nem készült; azonosságot nem találtunk ki.
- Következő konkrét lépés: olvasd el docs/production.md-t és docs/testing.md-t. Indítsd a teljes appot `php -S 0.0.0.0:8080 -t public router.php` paranccsal. Valódi telefon/tablet portrait/landscape rajzolás, pointer-cancel/többujjas próba, PWA install/offline restart és régi install frissítés következik. Ezután kijelölt HTTPS origin/PHP-FPM környezetben routing, cookie, cache és szülői kapu audit. Csak a bizonyított ellenőrzések után zárd M11-et és nevezd v1.0-nak. Ne kezdd újra az implementált milestone-okat.
- Utolsó sikeres tesztek: `npm test` 9/9; `php backend/tests/domain.php` 119 ellenőrzés; Symfony health smoke; `npm run test:e2e` 41 sikeres/15 szándékosan kihagyott (API/jutalom/installability viewporttól független esetek egyszer futnak desktopon). Négy viewport: 360×800, 800×1024, 800×360, 1280×900. Axe WCAG A/AA, 48px touch célok, <300 KiB frontend transfer, normál használatban nincs console/pageerror. Chromium PWA installability errors üres.
- További sikeres ellenőrzések: Composer validate/check-platform-reqs/audit, Doctrine DB séma szinkron, tiszta másolatból npm ci + Composer install + domain/smoke ellenőrzések, teszt-DB dump visszaállítás nyolc egyező táblaszámmal. Telefonos világ/felhő/dashboard/olvasás screenshotok vizuálisan ellenőrizve.
- Technikai döntések: vanilla ES modules; Symfony 7.4, Doctrine, PHP 8.4+ (lockolt Doctrine igénye), MySQL/MariaDB. Egy böngészőcookie egy gyermekprofil. Szerver adja és ellenőrzi a feladatot. Minden válasz külön DB-rekord, tévesztés megmarad. CSRF, row lock, unique válaszszám/idempotencia. Raw rajz nem perzisztálódik. Adaptáció determinisztikus súlyozás, az utolsó két betű elkerülésével. Jutalmak 1/5/10/20 befejezett feladat után, nincs pontvesztés/streak. API-t a SW soha nem cache-eli.

## Környezet

Workspace WSL: `/home/lajos/codes/tudaskert`. PHP 8.5.4, MySQL 8.4.11. Node 22.14.0: /home/lajos/.local/zorka-tools/bin/node; Composer 2.10.3: /home/lajos/.local/zorka-tools/composer. Chromium és rendszerfüggőségek telepítve.

A zorka_learning és zorka_learning_test DB-k létrehozva; kizárólag ezekhez jogosult zorka_local account. Secret csak ignorált backend/.env.local és backend/.env.test.local. E fájlokat ne olvasd ki toolkimenetbe. Mindkét DB migrálva a Version20261011072322 verzióra. A test adatbázis kizárólag automatikus demoadatokat tartalmaz; az első HTTP env hibát javítottuk, a végső tesztek ellenőrzötten ezt használják.

A profil sessionje ZORKASESSID HttpOnly/SameSite=Strict cookie-val, külön backend/var/sessions/{env} tárolóban, 30 napos GC/cookie megőrzéssel. A szülői kapu 15 perc után lejár és kilépéskor lezárul. SQL logging tiltva.

```sh
export PATH=/home/lajos/.local/zorka-tools/bin:/usr/local/bin:/usr/bin:/bin
cd /home/lajos/codes/tudaskert
npm run build
npm test
npm run test:backend
npm run check:generated
npm run test:e2e
php -S 0.0.0.0:8080 -t public router.php
```

Tiszta install ellenőrzés:

```sh
ZORKA_COMPOSER=/home/lajos/.local/zorka-tools/composer bash scripts/clean-install.sh
```

Nem másol secretet és nem módosít működő DB-t. Ideiglenes ellenőrző másolata a /tmp/zorka-clean-install.* könyvtárakban maradt. Tesztadatbázis backup ellenőrzés: `sudo php scripts/verify-backup.php`, csak saját scratch DB-t/dumpot töröl.

Frontend/tartalom módosítás után `npm run build` kell a canonical public/data/learning.json és precache hash frissítéséhez. A teljes apphoz router.php szükséges; a régi router nélküli indítás csak helyi fallback gyakorlás.

2026-10-11: a betöltési hibát a leállított fejlesztőszerver okozta. A szerver elindítva a http://localhost:8080 címen; Windows felől az oldal, health és child API HTTP 200, session létrehozás és feladatlekérés sikeres. A szerver az aktuális terminálfolyamatban fut, újraindítás után ismét indítani kell. Git repository létezik, minden forrás még untracked, nincs commit; nincs elveszett vagy felülírt korábbi alkalmazáskód. M11 előtt kézi eszköz- és deployment eredményeket ténylegesen kell rögzíteni.

2026-10-11 – Szülői betűválasztás: a szülői dashboard „Gyakorolható betűk” részében menthető a tanult betűk listája (magyar többjegyű betűkkel). Gyermekprofilhoz tartozó MySQL JSON mező, szülői kapu + CSRF védelem. A felhők célbetűi és zavaró válaszai, az írásminták, a szavas feladatok és az olvasási tartalom követik a választást. Kezdőbetű feladatnál csak a kezdőbetű szükséges; teljes szónál minden egység. Nem megfelelő tartalom esetén üres állapot, nincs szűretlen visszaesés. Helyi mentés biztosítja az offline szűrést. Minimum egy betű választható. Új migráció: Version20261011110000, fejlesztői és teszt adatbázison alkalmazva.

Betűválasztás ellenőrzés: 10/10 JS egységteszt, 119 PHP domain ellenőrzés, Doctrine schema in sync; kapcsolódó böngészőtesztek 25 sikeres/3 viewport-redundáns skip, frissített API validációs betűteszt további 4/4. WCAG audit sikeres, generált tartalom/cache ellenőrzés sikeres. A fejlesztőszerver a tesztek után ismét elindítva localhost:8080-on.

2026-10-11: „nem látom a funkciót” javítás. A fejlesztői API-n ellenőrzött szülői letters endpoint 44 választható betűt ad. A PWA régi aktív worker mellett várakozó frissítése okozhatott régi felületet: új shell sikeres cache-elése után skipWaiting, controllerchange után egyszeri újratöltés, updateViaCache none + update ellenőrzés. A szülői kapu szövege jelzi a betűbeállítást. Betűválasztás/offline 12/12 böngészőteszt, nyitott lap melletti worker-frissítés 1/1 sikeres.

2026-10-11 LAN elérés előkészítve: Windows Wi-Fi 192.168.1.110, WSL 172.24.100.156, PHP 0.0.0.0:8080 elérhető WSL címen (HTTP 200). Windows munkamenet nem admin; tűzfalszabály létrehozása Error 5 Access denied. scripts/enable-lan.ps1 kész és PowerShell parserrel ellenőrzött: admin futtatás beállítja Windows LAN:8080 -> aktuális WSL:8080 portproxy-t, LocalSubnet tűzfalszabályt, ellenőrzi/indítja szervert. docs/lan.md indítás/eltávolítás. LAN külső eszközös elérés még nem igazolt; admin szkript futtatása szükséges.

2026-10-11 LAN beállítás alkalmazva: enable-lan.ps1 rendszergazdai indítása sikerült. Ellenőrzött Windows portproxy 192.168.1.110:8080 -> 172.24.100.156:8080; Zorka-LAN-8080 enabled Allow. Windows felől a LAN címen főoldal és /api/health HTTP 200. Másik fizikai eszközről a felhasználó ellenőrizheti.

2026-10-11 tartós közös betűbeállítás: a korábbi böngészőhöz kötött Child.practiceLetters helyett a practice_settings singleton tárolja az alkalmazás közös listáját. Migráció a legutóbbi nem-null korábbi listát átemeli (fejlesztői adatbázisban 18 mentett betű visszanyerve). Current/parent/next endpoint minden eszközön a közös listát használja, a szülői kapu/CSRF változatlan. Version20261011120000 migráció dev/test alkalmazva, schema in sync, 119 domain check és 4 viewport betűteszt sikeres új böngésző-context visszatöltési ellenőrzéssel. Több külön gyermek támogatásakor a beállítást család/gyermek szerinti azonosítóhoz kell kötni; jelenleg egy Zorka alkalmazás közös beállítása.

2026-10-11 Íráskert százalékos értékelés: a rajz mintához közeli mintavételi pontjainak aránya egész százalékra kerekítve jelenik meg. Ez a precision érték; a coverage továbbra is megfigyelési adat, nem külön elfogadási kapu. Szülői küszöb 1–100%, alapérték 70%, >= elfogadott. Üres/túl rövid rajz 0%. A traceConfig küszöb a kiadott exercise payloadban rögzül, frontend/backend ugyanazzal értékel, későbbi beállításmódosítás csak új feladatra hat. Közös DB mező practice_settings.writing_threshold, GET current/parent letters és védett PUT parent/writing, offline helyi másolat. Version20261011130000 migráció dev/test alkalmazva. 11 JS teszt, 125 PHP check, Doctrine schema in sync, desktop írásbeállítás és rajzolás e2e 2/2 sikeres.

Végső írásellenőrzés: 8/8 böngészőteszt (phone/tablet/landscape/desktop), generated check sikeres. Dev cache frissítve, APP_DEBUG=0 szerver visszaindítva; LAN főoldal HTTP 200, current API writingThreshold=70. Korábban mentett betűlista megőrizve.

2026-10-11 Íráskert lefedettségi javítás: az eredmény min(kerekített vonalpontosság%, kerekített mintalefedettség%). Mindkettőnek el kell érnie a közös szülői küszöböt. UI mindkét értéket és az eredményt külön mutatja; szülői magyarázat frissítve. JS/PHP regresszió az A keresztvonalával: precision 100%, coverage <50%, alapküszöbön elutasított; teljes A elfogadott. Szerveroldali AttemptEvaluator is elutasítja a hiányos A-t. 12 JS teszt és 130 PHP ellenőrzés sikeres.

2026-10-11 közös szülői statisztika: az exercise_attempt/LearningSession adatok eddig is MySQL-ben voltak, de a ProgressService.summary az aktuális böngésző child_id-jára szűrt. A Zorka egygyermekes telepítés szülői összesítése most minden böngészőprofil adatát tartalmazza, a korábbi adatokkal együtt. A válasz/eredménybeküldés tulajdonosi védelme és a szülői kapu változatlan. Új recentActivity maximum 50 feladat: időpont, eszköztípus, skill, próbálkozások, helyesek, idő és utolsó írásszázalék; szülői táblázat megjeleníti. Más gyermek/família többfelhasználós támogatásakor kötelező család/gyermek scope bevezetése. 12 JS teszt, 130 PHP check, külön learner/parent browser context és DB újratöltési regresszió 4 viewporton sikeres. Offline/meg nem küldött adatok csak szerverre szinkronizálás után látszanak másik eszközön; az offline írás nyers rajza eddig nem került szinkronra.

2026-10-11 külön minimális mintalefedettség: szülői form két mezővel (pontosság és lefedettség, 1–100%). practice_settings.writing_coverage migráció a korábbi writing_threshold értéket megőrzi. PUT parent/writing coveragePercent opcionális kompatibilitásból, megadáskor szigorú egész 1–100 validáció; hiányában megtartja az aktuális értéket. Current/parent letters writingCoverage, issued traceConfig.coveragePercent. JS/PHP döntés külön precision >= acceptancePercent és coverage >= coveragePercent. Offline cache mindkettőt menti. 12 JS teszt, 132 PHP ellenőrzés, schema in sync.

2026-10-11 felhasználó kérésére statisztikák nullázva: dev MySQL 168 válasz és 58 SkillProgress törölve tranzakcióban. Settings, child profiles és child_reward teljes tartalma előtte/utána egyező. Korábbi exercise enabled=false megakadályozza régi offline queued eredmények visszajutását. Helyi statisztikai cache reset-időponttal szűrve, betű/írásbeállítás localStorage érintetlen. API-n attempts/completedExercises/practiceTimeMs=0 ellenőrizve; 12 JS teszt, 132 PHP check sikeres, LAN szerver visszaindítva. Karbantartó parancs scripts/reset-statistics.php --statistics-only explicit dev DB ellenőrzéssel.
