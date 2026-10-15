# Backend

Symfony 7.4, Doctrine ORM/Migrations, Validator és CSRF komponens, PHP 8.4+. A gyermekprofil, session, szerveres feladatkiadás, eredménymentés, adaptív betűválasztás, haladás, szülői kapu és jutalmak működnek. A frontend ugyanazon originről hívja az API-t a gyökér router.php fájlján keresztül.

## Konfiguráció

A DATABASE_URL és APP_SECRET env-változó vagy ignorált .env.local érték. Tesztekhez a Symfony külön .env.test.local fájlt olvas, és automatikusan `_test` utótagot ad az adatbázis nevéhez.

```dotenv
APP_SECRET=<generált véletlen érték>
DATABASE_URL=mysql://<felhasználó>:<URL-kódolt jelszó>@127.0.0.1:3306/zorka?serverVersion=8.4&charset=utf8mb4
```

A verzió igazodjon a tényleges MySQL/MariaDB szerverhez. A .env nem tartalmaz működő hitelesítést. Külön, kizárólag az alkalmazás DB-jéhez jogosult felhasználót használj. Élesben különítsd el a migrációs DDL és a runtime DML jogosultságokat.

```sh
composer install
php bin/console doctrine:migrations:migrate --no-interaction
APP_ENV=test php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:schema:validate
php bin/console lint:container
php tests/domain.php
php tests/smoke.php
cd ..
php -S 0.0.0.0:8080 -t public router.php
```

WSL helyi socket admin bootstrap: `sudo php scripts/setup-local-db.php` a projekt gyökeréből. Csak a dedikált zorka_learning/zorka_learning_test adatbázisokat hozza létre; secretet nem ír a kimenetre. Meglévő DB vagy env esetén nem írja felül a konfigurációt. Ebben a workspace-ben a DB-k és env-fájlok már létrejöttek.

## Opcionális Docker

Állítsd be a ZORKA_DB_PASSWORD és ZORKA_DB_ROOT_PASSWORD process env értékeket, majd ebben a könyvtárban `docker compose up -d`. A DB lokálisan 3307-en érhető el, neve/felhasználója zorka; a DATABASE_URL ezt a portot használja. A Compose nincs ténylegesen indítva ebben a környezetben, mert Docker nem volt elérhető; a működő perzisztenciatesztek a helyi MySQL-t használják.

## API és működés

GET /api/health az alkalmazás liveness ellenőrzése; nem ellenőrzi a DB elérhetőségét. A többi endpoint: [docs/api.md](../docs/api.md). A session cookie ZORKASESSID, külön fájltárolóval a backend/var/sessions alatt, 30 napos megőrzéssel. Szülői hozzáférés 15 percig él, kilépéskor lezárjuk.

A profil böngészőhöz kötött, a szülői számtani kapu véletlen belépés ellen véd. Account-hitelesítés nincs. A mentés szerveroldali értékelést használ, a kliens correct mezőjét figyelmen kívül hagyja. A raw rajz nem perzisztálódik.
