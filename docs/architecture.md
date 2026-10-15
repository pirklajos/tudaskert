# Architektúra

A public/ statikus webroot vanilla ES module frontend. A gyökér router.php helyi fejlesztésben az API-t a backend/ Symfony kernelhez irányítja, a statikus fájlokat a PHP szerver szolgálja ki. Productionban a public/ a webroot, /api/ a backend/public/index.php front controllerre megy PHP-FPM-en.

## Frontend

- content.js, words-content.js, writing-content.js, reading-content.js, rewards-content.js: canonical tanulási és jutalomtartalom.
- engine.js: felhős domain motor, injektálható óra/véletlen; words-engine.js: stringalapú szó/olvasásértékelés; writing-engine.js: normalizált geometriai pontosság és lefedettség.
- clouds.js, words.js, writing.js, reading.js: DOM UI adapterek. Aszinkron feladatkérés alatt busy állapot, generációs azonosító eldobja a navigáció/módváltás után beérkező régi válaszokat.
- api.js: same-origin JSON/CSRF/session adapter, hibatűrő lokális fallback.
- storage.js: max 1000 helyi eredmény, szerveres mentés és kiadott szöveges eredmények online retry-ja. Raw rajzot helyben sem őriz.
- parent.js: ellenőrző kapu és dashboard; dinamikus adatok textContent-tal kerülnek a DOM-ba.
- rewards.js: gyűjtemény és fix helyi fallback; szerveres jutalmak authoritative.
- speech.js: csak helyi magyar hang; nincs külső TTS szolgáltatás.

## Backend

Hét Doctrine entitás és kezdeti migráció. BrowserContext a cookie-profil és CSRF adapter. Catalog a közös generált JSON-ból ad feladatot; AttemptEvaluator a canonical adat alapján értékel; TraceEvaluator nem bízik kliensoldali score-ban. Minden választ saját ExerciseAttemptként tárolunk.

LearningController tranzakcióban lockolja a gyermek/feladat sort, ellenőrzi a tulajdonost, majd menti a próbálkozásokat, frissíti a SkillProgress-t és megadja a fix jutalmakat. completed flag és UNIQUE exercise/attemptNumber védi az ismételt beküldést.

AdaptiveSelector reprodukálható SHA256-seeded súlyozással választ betűt. Az ismeretlen egység súlya 2, megbízhatóan erősé 1, gyengéé legfeljebb 5. Az utolsó két egység kimarad, amikor a készlet engedi. Nincs ML/AI vagy időbüntetés. A szó/írás/olvasás statisztika kész, ezek adaptív sorrendje még nincs bevezetve.

ParentController szerveres matematikai kaput, lejáratot és próbálkozáskorlátot kezel. A haladási statisztika csak feloldott kapu mögött érhető el. A profil személyes használatra böngészőhöz kötött; account-kezelés nincs.

## PWA

A build közös backend JSON-t és tartalomhash-es precache.js allowlistet generál. A service worker csak statikus shell/tartalom fájlokat tárol, navigáció network-first offline index.html fallbackkel. API és szülői adat soha nem cache-elődik. Új verzió aktiválásakor csak a Zorka korábbi shell cache-ei törlődnek.

## Ellenőrzés és release

Unit/domain, MySQL-backed Playwright, Axe, offline/reconnect és installability tesztek. M11 valódi eszköz és production HTTPS ellenőrzése még hátravan; részletek docs/production.md.
