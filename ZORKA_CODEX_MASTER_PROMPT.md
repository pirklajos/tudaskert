# CODEX MASTER PROMPT — Zorka Tanulóvilág

## 0. Szereped és működési módod
Te vagy a projekt vezető fejlesztője és technikai megvalósítója. A feladatod nem pusztán kódrészletek javaslása, hanem a teljes alkalmazás fokozatos, működőképes elkészítése ebben a repositoryban.

A projektet milestone-okra bontva, önállóan vidd végig. Minden munkamenet elején állapítsd meg, hol tart a projekt, és pontosan onnan folytasd, ahol az előző munkamenet félbeszakadt.

FONTOS ALAPSZABÁLYOK:
1. Ne kezdd újra a projektet, ha már vannak fájlok vagy korábbi eredmények.
2. Minden módosítás előtt olvasd el a projekt állapotfájljait és vizsgáld meg a repositoryt.
3. Egy milestone-t csak akkor jelölj késznek, ha annak elfogadási feltételei ténylegesen teljesülnek.
4. Minden lényeges változtatás után futtasd az elérhető ellenőrzéseket/teszteket.
5. Ne hagyj szándékosan nem működő alkalmazást két lépés között.
6. Ha valami blokkol, dokumentáld a blokkot, a hibát és a következő konkrét lépést.
7. Ne kérj jóváhagyást rutinszerű technikai döntésekhez. Válassz ésszerű, egyszerű, karbantartható megoldást és dokumentáld.
8. Ne építs indokolatlanul komplex architektúrát.
9. Mobile-first/touch-first szemlélettel dolgozz.
10. A gyermek felületén magyar nyelvet használj.
11. A repositoryban ne tárolj valódi jelszavakat, API kulcsokat vagy más secretet.
12. Ha a környezet nem enged valamit telepíteni/futtatni, készítsd elő a kódot és dokumentáld pontosan a szükséges parancsot.

---

# 1. Projekt

Projekt neve: **Zorka Tanulóvilág**

Cél: egy 7 éves gyermek számára készülő, játékos, vizuális, asszociatív webes tanulási környezet, amely elsősorban az írás- és olvasáskészség fejlődését támogatja.

A rendszer elsődleges felhasználója jelenleg Zorka, 7 éves.

A felület ne hagyományos oktatási adminisztrációs rendszernek vagy menürendszernek érződjön. Egy felfedezhető, kedves, meseszerű világ legyen, amelyben a helyszínek és tárgyak jelentik a navigációt.

Példák:
- felhők -> betűfelismerő játékok
- fa / könyv -> olvasási feladatok
- ház -> szavak és szóalkotás
- virágoskert -> írásgyakorlás
- madár -> instrukció / hangos segítség
- hátizsák -> jutalmak, gyűjtemény
- csillag -> teljesítmény/jutalom
- falevelekből kirakott nyíl -> vissza
- kis ház ikon -> főképernyő

A navigáció asszociatív legyen. Az ikonok mellett idővel rövid szöveg is megjelenhet, mert maga a kezelőfelület is segítse az olvasást.

---

# 2. Technológiai irány

A teljes rendszer WEBES.

## Frontend
- HTML5
- modern CSS
- JavaScript ES modules
- mobile-first / responsive
- touch-first
- PWA
- első körben lehetőleg framework nélkül (vanilla JS)
- CSS animációk és szükség esetén Canvas/SVG
- Web Audio / Speech API használható, de legyen fallback

## Backend
Preferált stack:
- PHP 8.2+
- Symfony 7 kompatibilis megoldások
- REST/JSON API
- Doctrine ORM
- MySQL 8 / MariaDB kompatibilitás

Ha a repositoryban már létezik ettől eltérő, működő stack, ne írd át automatikusan; először vizsgáld meg.

## Fejlesztői környezet
Készíts egyszerű lokális indítást. Ha praktikus, használj Docker Compose-t PHP + webserver + MySQL szolgáltatásokkal, de ne tedd szükségtelenül nehézzé a fejlesztést.

---

# 3. UX alapelvek

A gyermekoldal szabályai:
- nincs hamburger menü
- nincs admin jellegű navigáció
- minimális szöveg
- nagy, legalább kb. 48px érintési célok
- ne legyen hover-függő funkció
- egyértelmű vizuális visszajelzés minden érintésre
- hibánál ne legyen büntető piros X vagy negatív hangulat
- hibánál finom animáció + biztató visszajelzés
- helyes megoldásnál rövid pozitív animáció/hang
- lehetőleg egy feladatra koncentráljon egyszerre
- ne legyen reklám, külső link vagy gyermekoldalról elérhető vásárlás
- ne legyen végtelen görgetés
- ne legyen manipulatív jutalmazási mechanika
- ne legyen nyilvános profil vagy közösségi funkció
- a gyermekoldalon ne jelenjen meg technikai hibaüzenet

A gyermek navigációjához ne kelljen billentyűzet. Virtuális billentyűzet csak olyan gyakorlatnál jelenjen meg, amelynek maga a célja a szó beírása.

A rendszer legyen használható legalább:
- ~360px széles telefonon
- modern Android telefonon
- 7–11 colos tableten
- desktop böngészőben fejlesztés/teszt céljára

Portré és landscape módot is kezeljen értelmesen.

---

# 4. Vizuális világ

Kiinduló koncepció: kedves erdei tisztás / tanulóvilág.

Főképernyő elemei:
- ég
- mozgó felhők
- nagy fa
- kis ház
- virágoskert
- madár karakter
- hátizsák
- csillagok
- ösvény
- falevél navigáció

A világ legyen könnyen később témázható. A fontos objektumok NE egyetlen háttérkép részei legyenek. Külön HTML/SVG elemekként legyenek megvalósítva, hogy kattinthatók, animálhatók és reszponzívan áthelyezhetők legyenek.

Ha végleges grafikai asset nincs, készíts jó minőségű egyszerű SVG/CSS placeholdert. Ne blokkolja a fejlesztést az asset hiánya.

---

# 5. Játék-/tanulási modulok

A modulrendszer legyen bővíthető.

## 5.1 Felhős betűkereső
Példák:
- „Keresd meg az A betűt!”
- több felhő között kell kiválasztani a helyes betűt
- „Pukkaszd ki az összes K betűt!”
- hang alapján betű kiválasztása
- azonos betűk párosítása

Nehézség:
- kevés zavaró betű
- hasonló betűk
- kis- és nagybetűk
- később időkorlát nélkül gyorsaság mérése

Soha ne büntesse a gyereket időtúllépésért.

## 5.2 Szóház — kép -> szó
Megjelenik egy kép, például alma.

Feladatváltozatok:
- válaszd ki a kezdőbetűt
- rakd ki a szót betűkből
- írd be a szót
- hiányzó betű pótlása
- szó és kép párosítása

Kezdetben rövid, fonetikailag egyszerű magyar szavakat használj.

## 5.3 Íráskert
- betű rajzolása ujjal
- nagy- és kisbetű
- halvány vezetővonal
- kezdőpont és irány vizuális jelölése
- újrapróbálás
- egyszerű pontossági visszajelzés

A rajzoláshoz használható HTML Canvas vagy SVG pointer events.

A pontosságértékelés első verziója legyen toleráns; ne várjon kalligráfiai pontosságot egy 7 éves gyermektől.

## 5.4 Olvasásfa / Mesekuckó
Későbbi modul:
- szótagok
- rövid szavak
- egyszerű mondatok
- 1–3 mondatos mini történetek
- képhez megfelelő mondat kiválasztása
- egyszerű szövegértési kérdések

## 5.5 Hang
A madár legyen a segítő karakter.

Feladata:
- instrukció megismétlése
- betű hangjának kimondása
- biztatás
- opcionális felolvasás

Hang nélküli környezetben az alkalmazás maradjon használható.

---

# 6. Jutalmazás

A jutalmazás célja motiváció, nem függőséget okozó engagement.

Lehetséges jutalmak:
- csillagok
- levelek
- matricák
- kis erdei állatok
- dekorációk a világ számára

Ne legyen lootbox, véletlenszerű fizetős jutalom vagy streak-vesztéstől való félelem.

A hibázásért ne veszítsen megszerzett jutalmat.

---

# 7. Szülői mód

A gyermek UI-jától elkülönített felület.

A belépés ne legyen könnyen véletlenül aktiválható. Első verzióban például egyszerű felnőtt ellenőrző feladat vagy hosszú nyomás + ellenőrzés használható.

Szülői dashboard:
- összes gyakorlási idő
- utolsó használat
- feladattípusonkénti eredmény
- betűnkénti felismerési arány
- gyakran tévesztett betűk
- szófeladatok eredménye
- írásgyakorlás eredménye
- átlagos válaszidő
- fejlődés időben

A dashboard ne diagnosztizáljon tanulási zavart. Csak megfigyelhető teljesítményt mutasson.

---

# 8. Adaptív tanulás

A backend tárolja legalább:
- melyik feladatot kapta
- mi volt a várt válasz
- mit válaszolt
- helyes volt-e
- válaszidő
- próbálkozások száma
- időpont
- nehézségi szint

Ezekből készíts egyszerű adaptív súlyozást.

Példa:
Ha egy betű felismerése stabilan jó, kisebb súllyal jelenjen meg.
Ha egy betűvel sok hiba történik, gyakrabban jelenjen meg, de ne egymás után frusztráló módon.

Első verzióban ne használj AI/ML modellt. Determinisztikus, jól tesztelhető algoritmust készíts.

---

# 9. Javasolt adatmodell

Legalább az alábbi fogalmak legyenek modellezve:

Child
- id
- displayName
- birthYear opcionális
- createdAt

LearningSession
- id
- child
- startedAt
- endedAt
- deviceType opcionális

Exercise
- id
- type
- skill
- difficulty
- payload JSON
- enabled

ExerciseAttempt
- id
- child
- session
- exercise
- expectedAnswer
- givenAnswer
- correct
- responseTimeMs
- attemptNumber
- createdAt

SkillProgress
- child
- skillKey
- score
- confidence
- lastPracticedAt

Reward
- id
- type
- key
- metadata JSON

ChildReward
- child
- reward
- earnedAt

Az adatmodell módosítható, ha jobb megoldást találsz. Dokumentáld az eltérést.

A személyes adatok mennyiségét minimalizáld. Ne legyen szükség teljes névre, emailre vagy más szükségtelen gyermekadatra.

---

# 10. API

Tervezd meg legalább ezeket a képességeket:

GET /api/child/current
GET /api/world
GET /api/exercises/next?module=clouds
POST /api/attempts
POST /api/sessions
PATCH /api/sessions/{id}/finish
GET /api/progress
GET /api/rewards

A konkrét REST struktúra módosítható, ha indokolt.

Használj input validációt és megfelelő HTTP státuszkódokat.

---

# 11. PWA

Legyen:
- manifest.webmanifest
- service worker
- app ikon placeholder
- installálhatóság
- standalone display
- theme/background beállítás
- alapvető offline shell

Ha a backend nem érhető el, az alkalmazás ne omoljon össze. A fő UI és néhány előre cache-elt gyakorlófeladat lehetőleg legyen használható offline.

Később az offline próbálkozások szinkronizálhatók.

---

# 12. Accessibility

Bár gyermekeknek készül, törekedj hozzáférhetőségre:
- semantic HTML
- aria-label ahol indokolt
- megfelelő kontraszt
- reduced-motion támogatás
- fókuszállapotok desktop teszthez
- hang mellett vizuális instrukció
- ne csak szín jelezzen állapotot

---

# 13. Biztonság és adatvédelem

A rendszer gyermeket érint, ezért adatminimalizálást alkalmazz.

- ne legyen third-party tracking
- ne legyen reklám SDK
- ne küldj gyermekadatot külső szolgáltatásnak
- production logba ne kerüljön szükségtelen személyes adat
- CSRF/XSS/SQL injection elleni védelem
- Symfony/Doctrine standard biztonsági megoldások
- admin/szülői API-k ne legyenek nyilvánosan módosíthatók
- secret csak env változóban

---

# 14. Projekt állapotának tartós kezelése

HOZD LÉTRE ÉS FOLYAMATOSAN TARTSD KARBAN EZEKET:

## /PROJECT_STATE.md
Ez legyen a Codex elsődleges folytatási pontja.

Tartalmazza:
- aktuális milestone
- aktuális task
- legutóbb befejezett task
- mi működik jelenleg
- ismert hibák
- blokkolók
- következő konkrét lépés
- utolsó sikeres teszt/parancs
- fontos technikai döntések röviden

## /MILESTONES.md
Minden milestone és task checklisttel:

- [ ] nincs elkezdve
- [~] folyamatban
- [x] kész
- [!] blokkolt

## /CHANGELOG.md
Rövid fejlesztési napló dátummal/verzióval.

## /DECISIONS.md
Fontos architekturális döntések és indoklásuk.

## /README.md
Telepítés, futtatás, stack, fejlesztői parancsok.

## /docs/
Itt legyen legalább:
- architecture.md
- ux.md
- api.md
- database.md
- testing.md

MINDEN MUNKAMENET ELEJÉN:
1. olvasd el AGENTS.md-t, ha van
2. olvasd el PROJECT_STATE.md-t
3. olvasd el MILESTONES.md-t
4. nézd meg git status-t és git logot, ha git repository
5. vizsgáld meg a releváns forrásfájlokat
6. állapítsd meg az első befejezetlen vagy folyamatban lévő taskot
7. onnan folytasd

MINDEN ÉRDEMI MUNKAMENET VÉGÉN:
1. futtasd a releváns teszteket
2. javítsd a saját munkád által okozott hibákat
3. frissítsd PROJECT_STATE.md-t
4. frissítsd MILESTONES.md-t
5. frissítsd CHANGELOG.md-t
6. szükség esetén DECISIONS.md-t/docs fájlokat
7. írd le a következő konkrét lépést

Ha váratlanul megszakad a munka, a következő futásnak a fájlok és a git állapot alapján rekonstruálnia kell, mi történt. Soha ne feltételezd vakon, hogy a legutóbbi task elkészült.

---

# 15. Git stratégia

Ha git elérhető:
- ellenőrizd, van-e repository; ha nincs, inicializáld
- legyen értelmes .gitignore
- készíts kis, logikus commitokat, HA a környezet és a felhasználói beállítás ezt lehetővé teszi
- ne írj át idegen/korábbi változtatást indok nélkül
- destructive git parancsot ne használj automatikusan
- ne force pusholj

Javasolt commit prefixek:
feat:
fix:
docs:
test:
refactor:
chore:

---

# 16. Tesztelési stratégia

Minimum:

Frontend:
- kritikus JS logika unit tesztjei, ha a tooling létrejött
- responsive smoke test
- touch/pointer működés
- nincs console error normál használatkor

Backend:
- unit teszt adaptív algoritmusra
- API integration/functional tesztek
- validációs hibák tesztje
- persistence teszt

E2E:
Amint stabil az alap:
- főképernyő betölt
- Felhők megnyitható
- feladat teljesíthető
- eredmény menthető
- vissza lehet térni a világba
- szülői dashboard adatot mutat

Ha Playwright telepíthető, preferáld E2E-re.

---

# 17. Milestone-ok

## M0 — Repository bootstrap és specifikáció
Elfogadási feltételek:
- [ ] meglévő repository auditálva
- [ ] projektstruktúra létrehozva
- [ ] README
- [ ] PROJECT_STATE
- [ ] MILESTONES
- [ ] CHANGELOG
- [ ] DECISIONS
- [ ] docs alapok
- [ ] .gitignore
- [ ] lokális indítás dokumentálva

## M1 — Interaktív világ prototípus
- [ ] responsive HTML shell
- [ ] erdei főképernyő
- [ ] külön interaktív world objectek
- [ ] fa
- [ ] ház
- [ ] felhők
- [ ] kert
- [ ] madár
- [ ] hátizsák
- [ ] érintési feedback
- [ ] asszociatív vissza/home navigáció
- [ ] telefon/tablet landscape/portrait
- [ ] reduced motion

Elfogadás: backend nélkül megnyitható és Zorka végig tud navigálni az aktív helyszíneken.

## M2 — Felhős betűkereső
- [ ] játék engine alap
- [ ] randomizált feladat
- [ ] magyar betűkészlet kezelése
- [ ] helyes/hibás visszajelzés
- [ ] több próbálkozás
- [ ] eredmény objektum
- [ ] nehézségi szintek
- [ ] hang/fallback
- [ ] tesztek

Elfogadás: minimum 3 feladattípus játszható.

## M3 — Szóház
- [ ] kép->kezdőbetű
- [ ] kép->szó párosítás
- [ ] betűkből szókirakás
- [ ] virtuális betűbillentyűzet
- [ ] magyar ékezetes betűk
- [ ] asset/data struktúra új szavakhoz
- [ ] tesztek

Elfogadás: legalább 20 minta szóval működik.

## M4 — Íráskert
- [ ] touch canvas/SVG
- [ ] pointer events
- [ ] vezetővonal
- [ ] mintabetű
- [ ] törlés/újrapróbálás
- [ ] toleráns alak-összehasonlítás
- [ ] nagy/kisbetű alapok
- [ ] tesztek

Elfogadás: telefonon és tableten ujjal használható.

## M5 — Backend + adatbázis
- [ ] Symfony alkalmazás
- [ ] Doctrine
- [ ] MySQL/MariaDB
- [ ] migrations
- [ ] entities
- [ ] API
- [ ] validation
- [ ] demo child profil
- [ ] session mentés
- [ ] attempt mentés
- [ ] functional tests

Elfogadás: frontend eredmények ténylegesen DB-be mentődnek.

## M6 — Progress + adaptív feladatválasztás
- [ ] skill modell
- [ ] statisztika aggregáció
- [ ] betűnkénti eredmény
- [ ] tévesztések
- [ ] adaptív súlyozás
- [ ] ismétlés szabályok
- [ ] algoritmus unit teszt

Elfogadás: gyengébb készségek kontrolláltan gyakrabban jelennek meg.

## M7 — Szülői dashboard
- [ ] szülői kapu
- [ ] dashboard
- [ ] gyakorlási idő
- [ ] készségek
- [ ] betűk
- [ ] tévesztések
- [ ] válaszidő
- [ ] időbeli fejlődés
- [ ] mobil/desktop

Elfogadás: egy felnőtt érthetően látja a haladást.

## M8 — Jutalmak és világ fejlődése
- [ ] csillag/jutalom rendszer
- [ ] gyűjtemény
- [ ] jutalom feloldás
- [ ] világ dekoráció
- [ ] pozitív, nem büntető motiváció

## M9 — Olvasásfa / Mesekuckó
- [ ] szótagok
- [ ] rövid olvasás
- [ ] egyszerű mondatok
- [ ] mini történetek
- [ ] szövegértés

## M10 — PWA + offline
- [ ] manifest
- [ ] service worker
- [ ] installálható
- [ ] offline shell
- [ ] cache stratégia
- [ ] offline gyakorlás alap
- [ ] reconnect kezelés

## M11 — Hardening / v1.0
- [ ] accessibility audit
- [ ] security review
- [ ] responsive audit
- [ ] performance audit
- [ ] E2E tesztek
- [ ] hibakezelés
- [ ] production konfiguráció dokumentáció
- [ ] adatmentés/visszaállítás dokumentáció
- [ ] clean install teszt

---

# 18. Első tartalom

Kezdő betűkészlet:
A, E, I, O, Ö, U, Ü, B, D, F, K, L, M, N, P, R, S, T, V

A magyar többjegyű betűket (CS, DZ, DZS, GY, LY, NY, SZ, TY, ZS) az adatmodell tudja később egyetlen tanulási egységként kezelni. Ne feltételezd mindenhol, hogy egy betű = egy Unicode karakter.

Kezdő szavakhoz használj egyszerű példákat, például:
alma
apa
anya
baba
béka
cica
fa
fagyi
hal
ház
kacsa
kutya
labda
ló
maci
nap
óra
süni
tó
vonat

A tartalom legyen adatvezérelt, ne hardcode-old szétszórva a komponensekbe.

---

# 19. Kódminőség

- érthető angol technikai elnevezések a kódban
- magyar UI szöveg
- kis modulok
- ne legyen 1000+ soros app.js
- magic number helyett config
- játékok közös interfészt használjanak
- UI state és domain logika lehetőség szerint legyen szétválasztva
- adatvezérelt feladatok
- reusable komponensek
- megfelelő error handling

Javasolt játék interfész:

init(context)
start(exercise)
handleInput(input)
finish()
destroy()

A finish eredménye egységes objektum legyen, például:
{
  exerciseId,
  module,
  skill,
  expectedAnswer,
  givenAnswer,
  correct,
  attempts,
  responseTimeMs,
  difficulty
}

---

# 20. Definition of Done

Egy task csak akkor [x], ha:
- implementálva van
- normál használatkor működik
- nincs ismert regresszió
- releváns teszt lefutott, vagy dokumentálva van, miért nem futhatott
- dokumentáció frissült, ha szükséges
- PROJECT_STATE tükrözi a valós állapotot

Egy milestone csak akkor kész, ha minden kötelező acceptance criterion teljesült.

---

# 21. Most végrehajtandó feladat

KEZDD EL A FEJLESZTÉST MOST.

1. Auditáld a jelenlegi workspace/repository tartalmát.
2. Ha ez üres vagy nincs meglévő Zorka projekt, hozd létre az alap projektet.
3. Hozd létre a projekt állapot- és dokumentációs fájljait.
4. Készítsd el M0-t.
5. Ezután azonnal kezdd M1-et.
6. Ne állj meg pusztán terv készítésénél: írj tényleges működő kódot.
7. Ha M1 elkészül és nincs blokk, folytasd M2-vel, majd a következő milestone-nal.
8. Haladj a milestone-okon sorrendben mindaddig, amíg a környezet/idő/tool limit engedi.
9. Ha meg kell állnod, PROJECT_STATE.md-ben hagyj olyan pontos állapotot, hogy a következő Codex futás kérdés nélkül folytathassa.

A végső cél nem prototípus, hanem a teljes Zorka Tanulóvilág v1.0 elkészítése.
