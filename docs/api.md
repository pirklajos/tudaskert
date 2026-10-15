# API

Az API ugyanazon origin `/api/` útvonalain fut. JSON, private/no-store, nosniff. A gyermekhez való hozzáférést a HttpOnly/SameSite=Strict ZORKASESSID cookie adja. Másik cookie másik minimális demo profilt kap.

| Metódus és útvonal | Működés |
| --- | --- |
| GET /api/health | Alkalmazás liveness, nem DB-health |
| GET /api/child/current | Aktuális profil vagy null, csrfToken |
| POST /api/sessions | Profil első létrehozása és session kezdete/folytatása; deviceType: phone/tablet/desktop/unknown |
| PATCH /api/sessions/{id}/finish | Saját session idempotens lezárása |
| GET /api/world | Aktív helyszínek és megszerzett dekorációk |
| GET /api/exercises/next | Szerver által kiadott, sessionhöz kötött feladat |
| POST /api/attempts | Kiadott feladat válaszainak szerveroldali értékelése, tranzakciós mentése |
| GET /api/rewards | Saját megszerzett jutalmak |
| GET /api/parent/challenge | 120 másodpercig érvényes felnőtt ellenőrző kérdés |
| POST /api/parent/unlock | Egész answer, szerveroldali ellenőrzés, 15 perces szülői jogosultság |
| POST /api/parent/lock | Szülői jogosultság visszavonása |
| GET /api/progress | Kizárólag feloldott szülői kapu mögött; készségek, tévesztések, modulok, idő és napi haladás |

Minden mutációhoz Content-Type: application/json és X-CSRF-Token kell, legfeljebb 256 KiB requesttel. Token: GET child/current. Más-origin mutációt a szerver elutasít. Létrehozás 201, ismételt mentés/lezárás 200, hibás JSON 400, jogosulatlan kérés 403, idegen/hiányzó erőforrás 404, lezárt gyakorlás 409, hibás domain input 422. Parent kapu öt tévesztés után 30 mp szünetet kér (429).

## Feladatok

Query mezők: module=clouds|words|writing|reading; mode a megfelelő modul módja; difficulty=1|2|3; writing esetén index=0..9.

- clouds: find, pop, match; a betűk adaptív súlyozással érkeznek, az utolsó kettőt kerülve.
- words: initial, pair, build, type; 20 magyar szó.
- writing: canonical trace a választott indexre.
- reading: syllables, word, sentence, story, comprehension.

A válasz id, module, mode, skill, difficulty, serverIssued és modul-specifikus payload. Az online motor ugyanazt a formátumot használja, mint a helyi fallback.

## Eredménymentés

```json
{
  "exerciseId": "123",
  "responseTimeMs": 350,
  "responses": [
    { "id": "2", "responseTimeMs": 100 },
    { "id": "0", "responseTimeMs": 300 }
  ]
}
```

Felhőnél választott choice id; szónál/olvasásnál value string; írásnál strokes koordinátalisták szerepelnek a responses elemeiben. Minden idő kumulatív az adott feladat kezdetéhez képest, monoton és a teljes időn belüli. A szerver a DB-be a külön válaszok időtartamát írja. Legfeljebb 100 válasz; rajz legfeljebb 30 stroke/válasz és 4000 koordináta összesen, 0..300 értéktartományban. Raw rajz helyett a DB csak pontosság/lefedettség értéket őriz.

A szerver nem fogadja el a kliens expectedAnswer/correct/module/skill állításait. Befejezetlen vagy duplikált célfelhőt tartalmazó sorozat 422. Kiadott feladat első befejezése után az újraküldés idempotens. A korábbi tévesztések saját rekordként megmaradnak, akkor is, ha a végső válasz helyes. Az eredmény ugyanabban a tranzakcióban frissíti a SkillProgress-t és a fix jutalomküszöböket.

Offline késleltetett szöveges eredmény később beküldhető a saját kiadott exerciseId-ra; a DB createdAt a szerver mentési ideje. Teljesen offline generált eredmény nem hiteles szerverfeladat, így helyben marad.

Szülői betűbeállítás: `GET /api/parent/letters` és `PUT /api/parent/letters` (`{"letters":["A","M","NY"]}`). Mindkettő szülői belépést, a PUT CSRF tokent kér. Üres/ismeretlen lista 422. A GET `letters: null` értéke a korábbi alapbeállítást jelenti. A lista a gyermekprofilban tárolódik. A next endpoint megfelelő tartalom hiányában `{module, unavailable: true}` választ küld, mentett exercise nélkül.

Tartós betűlista: a parent letters/current/next endpoint a practice_settings közös telepítési beállítását használja, nem az adott böngésző gyermekprofiljának listáját. A szülői módosítás minden eszköz következő betöltése/gyakorlásindítása során érvényesül.

Írásküszöb: PUT /api/parent/writing {"acceptancePercent":80}, szülői kapu + CSRF, 1–100 egész érték; válasz {"writingThreshold":80}. GET child/current és parent/letters tartalmazza a writingThreshold mezőt. Writing exercise traceConfig.acceptancePercent a kibocsátáskori határ, a szerver az eltárolt payload alapján ellenőriz. Kerekített precision*100 >= acceptancePercent sikeres; túl rövid vagy üres rajz 0%.

Frissített írásértékelés: percent = min(round(precision*100), round(coverage*100)). Elfogadás percent >= acceptancePercent, tehát a pontosság és a minta lefedettsége egyaránt szükséges. A korábbi csak precision alapú leírást ez felváltja.

GET /api/progress: szülői kapuval védett, a Zorka telepítés összes böngészőprofiljának DB eredményeit összesíti. recentActivity max 50 feladatot tartalmaz (module, skill, deviceType, practicedAt, attempts, correct, timeMs, writingPercent). Ez az egygyermekes telepítéshez tartozó közös nézet; a beküldés ownership-védelme továbbra is eszköz/session szerint érvényes.

PUT /api/parent/writing {"acceptancePercent":80,"coveragePercent":60}; válasz writingThreshold és writingCoverage. Két külön határ, mindkettő 1–100 egész. Elfogadás: round(precision*100) >= acceptancePercent ÉS round(coverage*100) >= coveragePercent. coveragePercent hiányában mentéskor a jelenlegi érték megmarad; régi exercise payloadban a közös acceptancePercent a fallback. traceConfig rögzíti mindkét kiadáskori határt.
