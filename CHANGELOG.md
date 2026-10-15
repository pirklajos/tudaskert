# Fejlesztési napló

## 2026-10-11 — M5–M10 és M11 előkészítés
- Valódi MySQL migráció, elkülönített dev/test DB, cookie-profil, session/feladat/eredmény API és frontend-integráció.
- CSRF, szerveroldali válaszellenőrzés, tulajdonosvizsgálat, tranzakciós/idempotens mentés, minimális adatkezelés.
- Adaptív betűválasztás, per-skill/per-module/tévesztés/idő aggregáció, szerveres szülői kapu és responsive dashboard.
- Négy fix jutalom, megőrzött gyűjtemény és világdekorációk; öt Olvasásfa feladattípus.
- PWA manifest/PNG ikonok, verziózott statikus offline cache, négy helyszín offline, reconnect retry a kiadott szöveges feladatokra.
- 9 frontend unit, 119 backend domain check, 41 E2E/audit teszt sikeres; 15 redundant viewport eset kihagyva. Axe, Chromium installability, clean install és teszt-DB backup/restore sikeres.
- Kontraszt javítva, helyi magyar hangokra korlátozott TTS, külön 30 napos session storage. Kiadási és adatmentési dokumentáció kész.
- M11 valódi készülék és production HTTPS ellenőrzés még hátravan; v1.0 státusz nincs megadva.

## 2026-10-11 — 0.1.0 fejlesztés
- Üres repository auditálva, Git inicializálva, projektstruktúra és dokumentáció létrehozva.
- Interaktív erdei világ, asszociatív navigáció és hangos madársegítő.
- Három felhős játéktípus, nehézségek, toleráns visszajelzés és helyi eredménytárolás.
- Unit és Playwright E2E tesztkörnyezet.
- Szóház: 20 szó, kezdőbetű, kép–szó, kirakás és virtuális beírás. Többjegyű magyar betűk egy egységként.
- Íráskert: 10 minta, valódi pointer capture, kezdőpontok, iránynyilak, toleráns geometriai értékelés.
- 9 unit és 16 responsive E2E teszt sikeres. Telefonos világ és játék képernyőképek ellenőrizve.
- M5 elkezdve: Symfony 7.4, Doctrine, Migrations, Validator, CSRF komponens, hét leképezett entitás és health endpoint. MySQL Compose env-alapú jelszavakkal előkészítve; indítása még nincs tesztelve.
- Backend Composer validáció, konténerlint, ORM mapping, PHP syntax és health smoke sikeres; migráció és DB/API integráció következik.

## Szülői betűválasztás (2026-10-11)

A Szülőknek → Gyakorolható betűk alatt választhatók a már tanult betűk. A felhős, írásos, szavas és olvasási gyakorlás a mentett listát követi, offline is. Legalább egy betű szükséges. A teljes szavakhoz és olvasási tartalmakhoz minden bennük szereplő betűt ismerni kell; megfelelő tartalom hiányában a gyermek tájékoztató üzenetet kap. Az Íráskert csak a már elkészített mintákat kínálja. Új telepítésnél a szokásos migrációs parancs az új gyermekprofil mezőt is létrehozza.

PWA frissítés: az új verzió teljes cache-elése után azonnal aktiválódik, a már vezérelt lap egyszer újratöltődik. A szülői belépés szövege a tanult betűk beállítását is jelzi. Nyitott lap melletti worker-frissítési regressziós teszt hozzáadva.

A betűlista most a Zorka telepítés közös, adatbázisban tárolt beállítása. Eszközváltás, új böngészőprofil és localhost/LAN címváltás esetén is megmarad. A migráció megőrzi a legutóbbi korábbi mentett listát.

Íráskert: a Kész! után százalékosan látszik, hogy a rajz mekkora része halad a minta mentén. A szülői felület „Íráskert elfogadási küszöbe” szakaszában 1–100% közötti határ menthető, alapérték 70%. A határt elérő vagy meghaladó eredmény elfogadott; alatta újrapróbálást kér. Közös tartós és offline beállítás, szerveroldali újraértékelés.

Íráskert teljes minta ellenőrzése: a pontosság és a mintalefedettség közül az alacsonyabb százalék határozza meg a sikert. Mindkét érték külön látszik. Az A vízszintes keresztvonala önmagában már nem eredményez 100%-os teljesítést.

Közös szülői statisztikák: az összes eszköz adatbázisban tárolt gyakorlása és korábbi eredménye látható a szülői felületen. Új legutóbbi gyakorlások táblázat időponttal, eszközzel, feladattal, helyes aránnyal és íráseredménnyel.

Szülői Íráskert beállítás: külön megadható a minimális vonalpontosság és a minimális mintalefedettség. Mindkettő 1–100%, tartósan adatbázisban mentve, több eszközön és offline gyakorlásnál is használva. Az eddigi küszöbérték megőrizve mindkét mező alapjául.
