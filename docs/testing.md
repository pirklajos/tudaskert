# Tesztelés

## Automatikus ellenőrzések

`npm test`: 9 unit teszt — feladatgenerálás minden felhős mód/szintre, többjegyű magyar egységek, tévesztés és retry, dupla célérintés, időmérés, szóadatok, normalizált ékezet, toleráns írásértékelés.

`npm run test:backend`: 119 domain check és Symfony health smoke. Szerveroldali szó/rajzértékelés, hamis correct flag, duplikált felhőcél elutasítása, determinisztikus adaptív súlyozás, gyenge betű gyakorisága és ismétléskorlátozás.

`npm run test:e2e`: a teljes alkalmazás APP_ENV=test és APP_DEBUG=0 mellett, elkülönített MySQL `_test` DB-vel. Native session storage és HTTP cookie biztosítja a valós sessionfolyamatot. A teszt induláskor újraépíti a test cache-t, így új controller nem marad ki elavult route-cache miatt.

Négy viewport: 360×800 telefon, 800×1024 tablet, 800×360 landscape és 1280×900 desktop Chromium. Mobilprojektekben CDP touch eseményekkel rajzolunk, desktopon egérrel.

- Négy tanulóhelyszín navigációja, minden feladattípus, retry és localStorage.
- API CSRF/input/tulajdonos-ellenőrzés, idempotencia, session-lezárás.
- Valódi DB-persistencia read-only CLI próbával: sorok ténylegesen megvannak a test DB-ben.
- Szülői kapu helyes/hibás válasza, 50%-os tévesztési statisztika, dashboard és exit lock.
- Jutalomküszöbök, tévesztés utáni megőrzés és duplicate mentés.
- Öt Olvasásfa mód és szerveres mentés.
- PWA installability, service worker allowlist, offline reload és négy offline helyszín, reconnect retry.
- Axe WCAG A/AA, kontraszt, 48px gombok, reduced motion, normál flow-ban nincs pageerror/console error.
- Statikus frontend átviteli méret <300 KiB. Ez helyi méretellenőrzés, nem teljes mobil CPU/Lighthouse benchmark.

2026-10-11 végső eredmény: 41 sikeres, 15 szándékos skip. A viewporttól független API/jutalom/installability tesztek desktopon egyszer futnak, a többi viewporton kihagyjuk őket. Nincs sikertelen vagy flaky/retry-ba rejtett teszt.

Telefonos világ, felhős játék, dashboard és olvasás full-page screenshotok vizuálisan ellenőrizve. A végső screenshotok a gitignorált test-results/ alatt vannak és új tesztfutás felülírhatja őket.

## Build, dependency és DB

`npm run check:generated` ellenőrzi, hogy a backend canonical learning.json és service-worker precache tartalomhash szinkronban van a forrással. Frontend/tartalom változás után `npm run build`.

Composer validate --strict, check-platform-reqs, audit; Symfony lint:container; Doctrine schema:validate valódi dev DB ellenőrzéssel. PHP 8.5.4/MySQL 8.4.11. A lock PHP 8.4-et igényel.

`scripts/clean-install.sh`: friss /tmp másolat, credential nélkül, npm ci + unit/buildellenőrzés, Composer install lockból, konténer/mapping/domain/health. Nem módosít DB-t. A `--skip-sync` itt kizárólag mappinget validál; DB-persistencia külön az E2E tesztben ellenőrzött.

`scripts/verify-backup.php`: kizárólag a dedikált test DB-t menti, saját üres scratch DB-be visszaállítja, nyolc táblaszámot ellenőriz. A scratch DB-t csak akkor törli, ha saját maga hozta létre; élő DB-hez nem nyúl.

## M11 hátralévő ellenőrzés

Az emulált touch/CDP installability nem valódi Android/tablet használat vagy tényleges telepítés. Valódi készülékek, régi install update, Safari/Firefox smoke és kijelölt éles HTTPS/PHP-FPM/cookie/cache vizsgálat még szükséges. M11 nincs késznek jelölve. Részletek: production.md.
