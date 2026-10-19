# PostgreSQL kot podatkovna baza

* Status: sprejeto
* Datum: 2026-10-19

## Kontekst in problem

Podatkovni model BoxRank (uporabniki, klubi, boksarji, dvoboji, zgodovina
ratinga) ima jasno definirane relacije med entitetami (tuji ključi) in zahteva,
da je preračun ratinga ob potrditvi dvoboja izveden zanesljivo in dosledno, brez
tveganja neusklajenih podatkov. Treba je izbrati tip podatkovne baze, ki to
najbolje podpira.

## Obravnavane alternative

* Relacijska baza – PostgreSQL
* Dokumentna NoSQL baza – MongoDB

## Sprejeta odločitev

Izbrana alternativa: "PostgreSQL", ker podatkovni model ima jasne relacije med
entitetami in zahteva referenčno integriteto (npr. dvoboj mora vedno
referencirati obstoječa boksarja), kar relacijska baza naravno zagotavlja; prav
tako je preračun ratinga lažje in varneje izvesti znotraj ene SQL transakcije.

## Posledice

* Dobro, ker baza sama zagotavlja referenčno integriteto (tuje ključe) in s tem preprečuje nekonsistentne podatke (npr. dvoboj brez obstoječega boksarja).
* Dobro, ker ACID transakcije omogočajo, da se preračun ratinga obeh boksarjev in zapis v zgodovino ratinga izvedejo atomarno, brez delnih posodobitev.
* Dobro, ker je SQL standardiziran jezik za povpraševanje, kar poenostavi poročanje in analitiko nad lestvicami.
* Slabo, ker je sprememba podatkovne sheme (migracije) bolj toga kot pri dokumentnih NoSQL bazah, zato zahteva bolj premišljen podatkovni model vnaprej.
