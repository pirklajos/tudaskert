# Milestone-ok

Jelölés: [ ] nincs elkezdve; [~] folyamatban; [x] kész; [!] blokkolt.


## M0 — Repository bootstrap és specifikáció
Elfogadási feltételek:
- [x] meglévő repository auditálva
- [x] projektstruktúra létrehozva
- [x] README
- [x] PROJECT_STATE
- [x] MILESTONES
- [x] CHANGELOG
- [x] DECISIONS
- [x] docs alapok
- [x] .gitignore
- [x] lokális indítás dokumentálva

## M1 — Interaktív világ prototípus
- [x] responsive HTML shell
- [x] erdei főképernyő
- [x] külön interaktív world objectek
- [x] fa
- [x] ház
- [x] felhők
- [x] kert
- [x] madár
- [x] hátizsák
- [x] érintési feedback
- [x] asszociatív vissza/home navigáció
- [x] telefon/tablet landscape/portrait
- [x] reduced motion

Elfogadás: backend nélkül megnyitható és Zorka végig tud navigálni az aktív helyszíneken.

## M2 — Felhős betűkereső
- [x] játék engine alap
- [x] randomizált feladat
- [x] magyar betűkészlet kezelése
- [x] helyes/hibás visszajelzés
- [x] több próbálkozás
- [x] eredmény objektum
- [x] nehézségi szintek
- [x] hang/fallback
- [x] tesztek

Elfogadás: minimum 3 feladattípus játszható.

## M3 — Szóház
- [x] kép->kezdőbetű
- [x] kép->szó párosítás
- [x] betűkből szókirakás
- [x] virtuális betűbillentyűzet
- [x] magyar ékezetes betűk
- [x] asset/data struktúra új szavakhoz
- [x] tesztek

Elfogadás: legalább 20 minta szóval működik.

## M4 — Íráskert
- [x] touch canvas/SVG
- [x] pointer events
- [x] vezetővonal
- [x] mintabetű
- [x] törlés/újrapróbálás
- [x] toleráns alak-összehasonlítás
- [x] nagy/kisbetű alapok
- [x] tesztek

Elfogadás: telefonon és tableten ujjal használható.

## M5 — Backend + adatbázis
- [x] Symfony alkalmazás
- [x] Doctrine
- [x] MySQL/MariaDB — elkülönített fejlesztői és tesztadatbázis
- [x] migrations
- [x] entities
- [x] API
- [x] validation
- [x] demo child profil
- [x] session mentés
- [x] attempt mentés
- [x] functional tests

Elfogadás: frontend eredmények ténylegesen DB-be mentődnek.

## M6 — Progress + adaptív feladatválasztás
- [x] skill modell
- [x] statisztika aggregáció
- [x] betűnkénti eredmény
- [x] tévesztések
- [x] adaptív súlyozás
- [x] ismétlés szabályok
- [x] algoritmus unit teszt

Elfogadás: gyengébb készségek kontrolláltan gyakrabban jelennek meg.

## M7 — Szülői dashboard
- [x] szülői kapu
- [x] dashboard
- [x] gyakorlási idő
- [x] készségek
- [x] betűk
- [x] tévesztések
- [x] válaszidő
- [x] időbeli fejlődés
- [x] mobil/desktop

Elfogadás: egy felnőtt érthetően látja a haladást.

## M8 — Jutalmak és világ fejlődése
- [x] csillag/jutalom rendszer
- [x] gyűjtemény
- [x] jutalom feloldás
- [x] világ dekoráció
- [x] pozitív, nem büntető motiváció

## M9 — Olvasásfa / Mesekuckó
- [x] szótagok
- [x] rövid olvasás
- [x] egyszerű mondatok
- [x] mini történetek
- [x] szövegértés

## M10 — PWA + offline
- [x] manifest
- [x] service worker
- [x] installálható — Chromium installability kritériumok ellenőrizve
- [x] offline shell
- [x] cache stratégia
- [x] offline gyakorlás alap
- [x] reconnect kezelés

## M11 — Hardening / v1.0
- [x] accessibility audit — Axe WCAG A/AA, szemantika, kontraszt/fókusz/reduced motion
- [x] security review — helyi API és hozzáférés; production audit külön hátravan
- [x] responsive audit — négy Chromium viewport és screenshot QA
- [x] performance audit — frontend átviteli méret <300 KiB, külső runtime függőség nélkül
- [x] E2E tesztek — 41 sikeres, 15 viewporttól független eset szándékosan skip
- [x] hibakezelés
- [x] production konfiguráció dokumentáció
- [x] adatmentés/visszaállítás dokumentáció — teszt-DB restore ellenőrizve
- [x] clean install teszt
- [ ] valódi Android/tablet ujjas és telepítési próba
- [ ] éles HTTPS/PHP-FPM/cookie/cache ellenőrzés

M11 összességében [~]. A kiadás v1.0 státusza csak a tényleges készülékes és éles környezeti ellenőrzés után adható meg.

---



