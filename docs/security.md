# Biztonsági ellenőrzés — 2026-10-11

- A szerver adja a canonical feladatot és a várt választ; nem bízik a kliens correct, expectedAnswer, skill és module mezőjében.
- Minden mutáció Symfony CSRF tokent, JSON tartalmat és legfeljebb 256 KiB kérést igényel. Kereszt-origin mutációk tiltottak; session cookie SameSite=Strict és HttpOnly.
- A session és feladat csak a cookie-hoz tartozó gyermekhez érhető el. Más profil mentése és session-lezárása 404-et ad, automatizáltan tesztelve.
- Tranzakció és gyermek/feladat row lock, exercise/attemptNumber UNIQUE, completed állapot biztosítja az ismételt mentés idempotenciáját.
- Doctrine/paraméterezett SQL; korlátozott számú válasz, koordináta és időérték. Rajzpontok nem kerülnek a DB-be, csak lefedettség/pontosság. A lokális eredményből is eltávolítjuk a rajzot.
- A szülői kapu szerveroldali választ, lejáratot és próbálkozáskorlátot használ; haladás csak 15 percig elérhető. Kilépéskor lezárás. Ez véletlen belépés elleni kapu, nem account-hitelesítés.
- Dashboard dinamikus értékei textContent-tal kerülnek a DOM-ba; JSON válaszok nosniff és no-store. A service worker kizárólag a statikus allowlistet cache-eli, API-t nem.
- DB-kulcsok és APP_SECRET csak ignorált env vagy process env. SQL-logging tiltott. 500 válaszok nem tartalmaznak stack trace-t vagy infrastruktúraadatot.
- Hang csak helyi magyar Speech API voice-szal szól; nincs hangszolgáltatónak küldött adat. Magyar helyi voice hiányában vizuális instrukció marad.

A dependency audit, access-control, CSRF, hibás input és valódi DB perzisztencia automatizált ellenőrzése megtörtént. Nyilvános többcsaládos üzem nem lett tervezve vagy tesztelve; hozzá account-hitelesítés és további terhelés-/rate-limit vizsgálat kell. Éles HTTPS/webserver audit még hátravan.
