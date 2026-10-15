# Kiadási konfiguráció

Jelen állapot: funkciók implementálva, helyi MySQL/Chromium ellenőrzés elvégezve. Valódi Android/tablet ujjas próba és telepítés, valamint éles webserveren végzett ellenőrzés még szükséges, ezért M11/v1.0 kiadás nincs lezárva.

## Telepítés

Node 22+ a buildhez; PHP 8.4+ és pdo_mysql, mbstring, ctype, iconv, xml, session, openssl; MySQL 8/MariaDB. A fejlesztés PHP 8.5.4/MySQL 8.4.11 környezetben történt. A lockolt Doctrine csomagok PHP 8.4-et igényelnek, ezt a composer.json is rögzíti.

```sh
npm ci
npm run build
cd backend
APP_ENV=prod APP_DEBUG=0 composer install --no-dev --optimize-autoloader
APP_ENV=prod APP_DEBUG=0 php bin/console doctrine:migrations:migrate --no-interaction
APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear
```

A környezeti változókat már a telepítési parancsok előtt biztosítsd: APP_ENV=prod, APP_DEBUG=0, véletlen APP_SECRET és DATABASE_URL. Jelszó nem kerülhet forrásba vagy shell historyba. A migrációhoz elkülönített DDL-jogosultság, a runtime felhasználónak csak a saját adatbázishoz SELECT/INSERT/UPDATE/DELETE kell. Kizárólag HTTPS-en szolgáld ki; PHP session cookie HttpOnly, SameSite=Strict, HTTPS mellett Secure.

## Webserver

A dokumentumgyökér a repository `public/` mappája. A `/api/` útvonalakat a `backend/public/index.php` Symfony front controllerhez irányítsd PHP-FPM-en. Az alkalmazás forrása, backend config, `.env*`, vendor, var, scripts és tests nem publikálható. Statikus fájlok és service worker ugyanazon origin alatt legyenek. A webserver a service-worker.js/precache.js fájlokra frissítést megengedő cache headert használjon, az API no-store maradjon. Állíts be trusted host és proxy konfigurációt a tényleges domain/infrastruktúra szerint. A PHP időzóna UTC.

A `router.php` és a PHP beépített szerver helyi fejlesztéshez való. Nem végeztünk éles webserveres telepítést. Nincs külső követőkód vagy runtime CDN.

## Profil és hozzáférés

A jelenlegi személyes használati modell: egy böngészőprofil egy gyermekprofil. A titkos session cookie adja a hozzáférést; másik böngésző másik profilt kap. Nincs email, teljes név vagy megosztott nyilvános azonosító. A szülői szorzásos kapu a véletlen gyermekbelépést gátolja, nem helyettesít felhasználónév/jelszó alapú szülői hitelesítést. Nyilvános, több családos szolgáltatáshoz további account-kezelés kell; ez nincs a jelenlegi személyes használati modellben.

## Kiadás előtti maradék ellenőrzés

- Valódi Android telefon és tablet: portrait/landscape, pointer cancel, több ujj, hosszabb rajzolás, navigáció.
- PWA tényleges telepítés, első online megnyitás után offline restart; frissítés régi installról.
- iOS/Safari és Firefox smoke; magyar helyi hang hiányában vizuális fallback.
- Éles HTTPS origin, PHP-FPM routing, cookie-k, cache és szülői jogosultságok ellenőrzése.

Ezeket nem jelöltük elvégzettnek emulált tesztek alapján.
