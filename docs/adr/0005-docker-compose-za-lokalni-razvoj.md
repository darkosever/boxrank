# Docker Compose za lokalni razvoj

* Status: sprejeto
* Datum: 2026-10-19

## Kontekst in problem

Sistem BoxRank sestavljajo tri komponente (PostgreSQL baza, backend, frontend),
ki jih morajo vsi člani ekipe znati zagnati lokalno na enak način, tudi pri
predstavitvi na vajah. Potreben je dogovor o načinu lokalnega zagona, ki je
ponovljiv in neodvisen od razvijalčevega operacijskega sistema.

## Obravnavane alternative

* Ročna namestitev vsake komponente neposredno na razvijalčev stroj (lokalna namestitev PostgreSQL, Node.js itd.)
* Docker Compose, ki orkestrira vse tri komponente (ali vsaj podatkovno bazo) v vsebnikih

## Sprejeta odločitev

Izbrana alternativa: "Docker Compose", ker zagotavlja, da je okolje (zlasti
podatkovna baza) enako na vseh razvojnih strojih, in poenostavi zagon celotnega
sistema na en ukaz (`docker-compose up`), kar je pomembno pri predstavitvi
projekta na vajah.

## Posledice

* Dobro, ker je okolje enako na vseh razvojnih strojih, kar zmanjšuje težave tipa "pri meni pa deluje".
* Dobro, ker je zagon celotnega sistema poenostavljen na en ukaz, kar olajša vključevanje novih članov ekipe.
* Slabo, ker projekt pridobi dodatno odvisnost od nameščenega Docker okolja na vsakem razvojnem stroju.
* Slabo, ker vsebniki ob zagonu porabijo nekaj več časa in sistemskih virov kot neposreden lokalen zagon komponent.
