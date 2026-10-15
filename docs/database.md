# Adatmodell

Implementáció: backend/src/Entity, MySQL/Doctrine migráció Version20261011072322. Mind a fejlesztői, mind az elkülönített tesztadatbázison lefutott és a séma szinkronja ellenőrizve.

Child minimális displayName/optional birthYear/createdAt profilt tárol. LearningSession a gyermekhez tartozik, startedAt/endedAt/deviceType mezőkkel. Exercise a szerver által kiadott konkrét feladatot, sessiont, skillt, nehézséget, JSON payloadot és completed állapotot őrzi. Ez eltérés a tisztán globális feladatkatalógustól: a canonical katalógus a generált learning.json, a DB-feladat egy személyre kiadott példány.

ExerciseAttempt külön rekord minden válaszhoz: gyermek, session, feladat, expectedAnswer/givenAnswer JSON, correct, responseTimeMs, attemptNumber, createdAt. Az időtartam a kumulatív válaszidők különbsége. UNIQUE exercise/attemptNumber és tranzakciós completed-védelem akadályozza a duplikációt.

SkillProgress child/skillKey párosra egyedi; score a helyes válaszok aránya, confidence min(1, válaszszám/12). Reward és ChildReward fix küszöbös jutalmakat tárolnak; ChildReward child/reward párosra egyedi. A kapcsolt entitások technikai id-t kaptak, a természetes kulcsok UNIQUE megszorítások.

Minden tanulási egység string (pl. letter:DZS), a többjegyű magyar betű nem karakterekre bontott. Raw rajzpontok nem perzisztálódnak, csak geometriai lefedettség/pontosság. A backend időpontjai UTC; a dashboard napi bontása Europe/Budapest szerint készül.

A helyi zorka.practice.v1 localStorage lista legfeljebb 1000 eredményt őriz. Nem hiteles DB, böngészőadat-törlés eltávolítja. A szerveres eredmény synced állapotot kaphat; offline generált és raw rajz nélküli eredmény helyi marad. Szükségtelen gyermekadatot, emailt vagy teljes nevet nem gyűjtünk.
