Ija projekt: RobotSimulation

Autori:
    - Jakub Pogádl (xpogad00)
    - Boris Semanco (xseman06)

Táto aplikácia simuluje pohyb robotov v prostredí. 
Používatelia môžu interagovať so simuláciou pridávaním prekážok a robotov, ovládaním rýchlosti a uhla robotov a spúšťaním/zastavením simulácie.

Ovládanie robota
- Používatelia môžu pridať do prostredia autonómne aj ovládané roboty.
- Autonómne roboty sa pohybujú náhodne v miestnosti.
- Ovládané roboty je možné manuálne ovládať používateľom klávesami W, A, D

Interakcia
- Používatelia môžu pridávať prekážky do miestnosti na špecifické súradnice.
- Simulačné prostredie je možné ukladať do a načítavať z JSON súborov.
- Používatelia môžu spúšťať, zastavovať.
- Funkcionalita nahrávania umožňuje používateľom nahrávať pohyby robota.

Užívateľské rozhranie
- Aplikácia ponúka posuvníky na ovládanie rýchlosti a uhla robotov.
- Textové polia umožňujú používateľom zadať špecifické súradnice pre pridanie prekážok a robotov.
- Tlačidlá poskytujú pohodlné ovládanie pre pridávanie prvkov, ovládanie simulácie a správu nahrávok.

Spustenie aplikácie
    mvn javafx:run