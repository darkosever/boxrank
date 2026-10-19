# Ločena frontend in backend arhitektura

* Status: sprejeto
* Datum: 2026-10-19

## Kontekst in problem

Za BoxRank je treba izbrati osnovni arhitekturni pristop: ali aplikacijo zgraditi
kot monolitno, server-rendered spletno stran, ali kot ločen frontend (SPA), ki
preko REST API-ja komunicira z backendom. Odločitev vpliva na razvojni proces,
testiranje in prihodnjo razširljivost sistema (npr. dodatne odjemalce).

## Obravnavane alternative

* Monolitna server-rendered aplikacija (backend neposredno generira HTML strani)
* Ločen frontend (React SPA) + backend (REST API), ki komunicirata preko HTTPS/JSON

## Sprejeta odločitev

Izbrana alternativa: "Ločen frontend (React SPA) + backend (REST API)", ker
omogoča jasno ločitev odgovornosti med uporabniškim vmesnikom in poslovno logiko,
lažje neodvisno testiranje API-ja ter možnost, da se frontend v prihodnosti zamenja
ali dopolni (npr. z mobilno aplikacijo) brez spremembe backend logike.

## Posledice

* Dobro, ker je mogoče frontend in backend razvijati in uvajati neodvisno drug od drugega.
* Dobro, ker lahko isti REST API v prihodnosti uporabljajo tudi drugi odjemalci (mobilna aplikacija, javni API za medije).
* Dobro, ker je backend API mogoče avtomatizirano testirati (npr. Jest/Supertest) neodvisno od uporabniškega vmesnika.
* Slabo, ker ločena arhitektura prinaša dodatno kompleksnost (CORS, usklajevanje API pogodbe med frontendom in backendom, dva ločena deployment procesa).
