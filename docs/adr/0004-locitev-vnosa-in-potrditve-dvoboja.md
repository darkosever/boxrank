# Ločitev vloge vnosa (promotor) od vloge potrditve (admin)

* Status: sprejeto
* Datum: 2026-10-19

## Kontekst in problem

Rezultate dvobojev v sistem vnašajo promotorji klubov, ki so lahko (zavedno ali
nezavedno) zainteresirani za izid, ugoden za njihov klub. Ker rating boksarja
vpliva na njegovo uvrstitev in prihodnje predloge nasprotnikov, mora biti proces
potrjevanja rezultatov zaupanja vreden in odporen na konflikt interesov.

## Obravnavane alternative

* Promotor sam vnese in potrdi rezultat dvoboja (en korak, ena vloga)
* Promotor vnese predlog rezultata, nevtralni admin (zveza) ga pregleda in potrdi ali zavrne (dva ločena koraka, dve vlogi)

## Sprejeta odločitev

Izbrana alternativa: "Promotor vnese, admin potrdi", ker ločitev vnosa od
potrditve preprečuje, da bi klub sam potrdil lastne, morebiti neobjektivne
rezultate. To je ključno za zaupanje v avtomatsko izračunan rating in lestvico,
ki temelji nanj.

## Posledice

* Dobro, ker se zmanjša tveganje konflikta interesov in manipulacije rezultatov v korist lastnega kluba.
* Dobro, ker je lestvica in rating boksarjev bolj verodostojna, ker vsak potrjen rezultat preveri nevtralna stran.
* Slabo, ker proces potrjevanja dvoboja vnese dodaten korak in zamik, preden se rating in lestvica dejansko posodobita.
* Slabo, ker je potrebna dodatna administratorska vloga (zveza) in njena stalna razpoložljivost za pregledovanje predlogov.
