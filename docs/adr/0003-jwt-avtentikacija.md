# JWT avtentikacija namesto sejnih piškotkov

* Status: sprejeto
* Datum: 2026-10-19

## Kontekst in problem

BoxRank potrebuje mehanizem avtentikacije in avtorizacije po vlogah (admin,
promotor, boksar) za komunikacijo med React SPA frontendom in REST API
backendom. Treba je izbrati, ali se stanje prijave hrani na strežniku (seje) ali
na strani odjemalca (token).

## Obravnavane alternative

* Sejni piškotki (server-side session, stanje shranjeno na strežniku)
* JWT (stateless žeton, stanje shranjeno v samem žetonu na strani odjemalca)

## Sprejeta odločitev

Izbrana alternativa: "JWT", ker backend ostane brez stanja (stateless), kar je
standarden in preprost pristop pri REST API-jih, ki jih kliče SPA, ter poenostavi
morebitno kasnejše skaliranje backenda na več instanc brez potrebe po skupnem
shranjevanju sej.

## Posledice

* Dobro, ker backend ne hrani stanja seje, zato je skaliranje na več instanc backenda preprostejše (ni potrebe po deljenem session store-u).
* Dobro, ker žeton vsebuje identiteto in vlogo uporabnika, kar poenostavi avtorizacijsko preverjanje (middleware) na zaščitenih endpointih.
* Slabo, ker je predčasen preklic (revokacija) žetona pred iztekom veljavnosti zahtevnejši kot pri sejah na strežniku.
* Slabo, ker je treba žeton na strani odjemalca skrbno shraniti, da se zmanjša tveganje kraje preko XSS.
