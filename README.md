# Zorka Tanulóvilág

Magyar, érintésre tervezett erdei tanulóvilág. Betűfelhők, Szóház, Íráskert és Olvasásfa, megőrzött jutalmak és szülői haladási dashboard. Vanilla JavaScript ES modules; Symfony 7.4, Doctrine és MySQL/MariaDB backend; PWA/offline gyakorlás.

M0–M10 implementálva. M11 kiadási ellenőrzése folyamatban: valódi Android/tablet és éles HTTPS/webserver próba még szükséges. A jelenlegi modell személyes, böngészőhöz kötött gyermekprofil, nem többcsaládos account-rendszer.

## Lokális indítás

PHP 8.4+, Composer, Node 22+, MySQL 8/MariaDB szükséges. A lockolt Doctrine csomagok PHP 8.4-et igényelnek.

```sh
npm ci
npm run build
cd backend
composer install
```

Állítsd be az APP_SECRET és DATABASE_URL értéket környezeti változóként vagy az ignorált backend/.env.local fájlban. Konfiguráció és DB-jogosultságok: [backend/README.md](backend/README.md).

```sh
php bin/console doctrine:migrations:migrate --no-interaction
cd ..
php -S 0.0.0.0:8080 -t public router.php
```

Megnyitás: http://localhost:8080. Azonos hálózaton a fejlesztőgép IP-címével a gyermekfelület is kipróbálható; PWA/offline telepítéshez localhost vagy HTTPS kell.

Backend nélküli gyakorláshoz továbbra is használható `php -S 0.0.0.0:8080 -t public`. Ilyenkor helyi eredménymentés van, szülői DB-statisztika nincs.

## Ellenőrzések

```sh
npx playwright install --with-deps chromium
npm test
npm run test:backend
npm run check:generated
npm run test:e2e
```

A teljes E2E teszt külön `_test` adatbázist igényel: az ignorált backend/.env.test.local fájlban állítsd be a kapcsolatot, majd `APP_ENV=test php backend/bin/console doctrine:migrations:migrate --no-interaction`. A tesztek valódi DB-be írnak, ezért csak elkülönített tesztadatbázist használj.

WSL helyi MySQL socket adminhoz opcionális scripts/setup-local-db.php létrehozza a dedikált zorka_learning és zorka_learning_test DB-t és a külön felhasználót; meglévő env vagy DB esetén nem írja felül. A mostani workspace-ben ez már lefutott. A Node/Composer helyi útvonalait a [PROJECT_STATE.md](PROJECT_STATE.md) tartalmazza.

`npm run build` minden frontend/tartalom változtatás után szükséges: közös backend katalógust és verziózott offline precache-listát generál. A PNG appikonok újragenerálása: `node scripts/generate-icons.mjs` (Playwright Chromium szükséges).

## Offline és adatok

Első online megnyitás után a shell és mind a négy gyakorlóhelyszín offline használható. A feladatokat és eredményeket helyben tároljuk, a szülői API-t nem cache-eljük. A korábban kiadott szerveres betű/szó/olvasási feladat sikertelen mentése reconnectkor újrapróbálható. Teljesen offline generált feladat és eldobott rajzpontok alapján nem készül hiteles DB-eredmény; ezek helyi eredményként maradnak meg.

Telepítés: [docs/production.md](docs/production.md). Adatmentés: [docs/backup.md](docs/backup.md). Biztonság: [docs/security.md](docs/security.md). Folytatási pont: [PROJECT_STATE.md](PROJECT_STATE.md).
