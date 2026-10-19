# 02 – Funkcionalnosti in obseg

## Uporabniške vloge

### 1. Admin (zveza)

Predstavnik krovne boksarske zveze, ki skrbi za verodostojnost podatkov v sistemu.

Lahko:
- potrjuje ali zavrne prijavljene rezultate dvobojev,
- upravlja kategorije teže (weight classes),
- suspendira/deaktivira boksarja (npr. zaradi dopinga, poškodbe, disciplinskega
  prekrška), kar ga začasno izloči iz predlogov za nove dvoboje,
- upravlja uporabniške račune promotorjev in njihove klube,
- ročno sproži ponovni preračun lestvice, če pride do popravka napačno vnesenega
  rezultata.

Nima pravice:
- neposredno urejati rating boksarja (rating se vedno preračuna avtomatsko iz
  potrjenih dvobojev, ne ročno),
- vnašati dvobojev v imenu klubov (to je naloga promotorja).

### 2. Promotor / trener kluba

Predstavnik posameznega boksarskega kluba.

Lahko:
- doda/ureja boksarje svojega kluba in njihove osnovne podatke,
- predlaga in vnese dvoboj ter rezultat (status: "v potrjevanju"),
- pregleduje predloge primernih nasprotnikov za svoje boksarje,
- pregleduje zgodovino in trenutni rating svojih boksarjev.

Nima pravice:
- potrditi lastno vnesenega rezultata dvoboja (potrebna je potrditev admina – ločitev
  vnosa od verifikacije),
- urejati boksarjev drugih klubov,
- upravljati kategorij teže ali uporabniških pravic drugih uporabnikov.

### 3. Boksar (registriran uporabnik)

Boksar s svojim uporabniškim računom, povezanim z lastnim profilom.

Lahko:
- pregleduje svoj profil, zgodovino dvobojev in gibanje ratinga skozi čas,
- ureja svoj javni opis/biografijo in fotografijo profila,
- pregleduje predlagane primerne nasprotnike zase.

Nima pravice:
- sam vnašati ali potrjevati rezultatov dvobojev,
- urejati podatkov drugih boksarjev.

### 4. Javni obiskovalec (brez prijave)

Lahko:
- brska po javnih lestvicah po kategorijah teže,
- pregleduje javne profile boksarjev in zgodovino njihovih dvobojev.

Nima pravice:
- dostopati do katerekoli funkcionalnosti urejanja ali vnosa podatkov.

## Predvidene funkcionalnosti (10–15)

1. Vnos in urejanje profila boksarja (osebni podatki, klub, kategorija teže, fotografija)
2. Vnos predloga dvoboja z rezultatom s strani promotorja
3. Potrditev ali zavrnitev dvoboja s strani admina
4. **Avtomatski preračun ratinga boksarja po vsakem potrjenem dvoboju (Elo-podoben algoritem)**
5. **Lestvica (ranking) boksarjev po posameznih kategorijah teže**
6. **Predlog primernih bodočih nasprotnikov glede na rating in kategorijo teže**
7. Zgodovina gibanja ratinga boksarja skozi čas (grafični prikaz trenda)
8. Pregled podrobne zgodovine dvobojev posameznega boksarja
9. Upravljanje kategorij teže (weight classes) s strani admina
10. Suspenz/deaktivacija boksarja s strani admina (izločitev iz predlogov za dvoboje)
11. Upravljanje kluba in seznama njegovih boksarjev (promotor)
12. Prijava in registracija uporabnikov z dodelitvijo vloge (admin/promotor/boksar)
13. Javni pregled profila boksarja in lestvic brez prijave
14. Filtriranje in iskanje boksarjev po kategoriji teže, klubu ali imenu
15. Pregled dogodkov (fight card) z vsemi dvoboji posameznega dogodka

## MVP – ključne funkcionalnosti za prvo delujočo različico

Oznaka **(domensko)** pomeni funkcionalnost, ki je specifična za boksarsko domeno in
ni zgolj splošen CRUD.

1. Prijava/registracija uporabnikov z vlogami (admin, promotor, boksar)
2. Upravljanje profila boksarja (osnovni podatki, klub, kategorija teže)
3. Vnos predloga dvoboja z rezultatom (promotor)
4. Potrditev dvoboja s strani admina
5. **(domensko)** Avtomatski preračun ratinga boksarja po potrditvi dvoboja
6. **(domensko)** Lestvica boksarjev po kategorijah teže
7. **(domensko)** Predlog primernih nasprotnikov glede na rating in kategorijo teže

## Kasnejše nadgradnje

1. E-poštna/push obvestila o napovedanih dvobojih in novih predlogih nasprotnikov
2. Javni API za zunanje medije/strani za prikaz statistik in lestvic
3. Napredna analitika – primerjava head-to-head med dvema boksarjema, statistika po
   načinu zmage (nokavt, sodniška odločitev ...)
4. Podpora za več borilnih disciplin (kickboks, MMA) poleg boksa
5. Uvoz uradnih podatkov iz zunanjih baz nacionalnih/mednarodnih zvez
6. Komentarji in ocene dvobojev s strani navijačev (fan engagement)
7. Večjezična podpora vmesnika (slovenščina/angleščina)

## Out of scope

- Prenos dvobojev v živo (live streaming) ali video vsebine dvobojev
- Stavnice in napovedovanje izidov (betting/odds)
- Prodaja vstopnic in plačilni sistem za dogodke
- Native mobilna aplikacija (iOS/Android) – rešitev je zgolj spletna
- Avtomatsko generiranje uradnih sodniških/licenčnih dokumentov
