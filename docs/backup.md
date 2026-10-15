# Adatmentés és visszaállítás

A DB tartalmazza a gyermekprofilt, gyakorlásokat, próbálkozásokat, haladást és jutalmakat. A böngésző helyi eredményei és session cookie-ja külön tárolódnak; a DB-dump nem állítja vissza a cookie-alapú hozzáférést. Az APP_SECRET-et és session storage-ot biztonságosan, a dump mellett külön kell megőrizni a hozzáférés folytatásához.

MySQL-klienshez a jelszót 0600 jogosultságú, repositoryn kívüli defaults-extra-file tartalmazza. A fájlban `[client]` szekció, host, user, password. Ne add a jelszót CLI argumentumként.

```sh
mysqldump --defaults-extra-file=/secure/zorka-client.cnf --single-transaction --routines --triggers zorka > /secure/zorka-backup.sql
```

A dump személyes gyakorlási adatot tartalmaz: korlátozott hozzáférés, titkosított tárolás, előre meghatározott megőrzés és rendszeres visszaállításpróba szükséges. A fájl nem kerülhet Gitbe vagy a webrootba.

Visszaállítás előtt hozz létre új, üres, elkülönített adatbázist; ne írj felül működő DB-t. A példában `zorka_restore` az új DB neve:

```sh
mysql --defaults-extra-file=/secure/zorka-client.cnf zorka_restore < /secure/zorka-backup.sql
```

Ellenőrizd a tábla- és rekordszámokat, migrációverziót, kulcskapcsolatokat, valamint egy elkülönített alkalmazáspéldány session/eredmény/dashboard folyamatát. Csak sikeres ellenőrzés után állítsd át a DATABASE_URL-t az új DB-re.

2026-10-11: `scripts/verify-backup.php` a kizárólag tesztadatot tartalmazó `zorka_learning_test` DB-t mentette, külön `zorka_restore_probe` DB-be visszaállította, nyolc tábla rekordszámát egyezőnek találta, majd a saját ideiglenes DB-t és dumpot eltávolította. Éles adatot nem módosított.
