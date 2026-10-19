# 01 – Zasnova rešitve

Ime rešitve **BoxRank**

## Namen rešitve in problem, ki ga naslavlja

Amaterski in manjši profesionalni boksarski klubi ter lokalne boksarske zveze danes
pogosto nimajo enotnega digitalnega orodja za sledenje dvobojem, rezultatom in
razvrstitvi (ranking) boksarjev. Podatki o dvobojih se vodijo ročno (Excel, papir,
Facebook objave), rezultati se med klubi ne poenotijo, lestvice pa se posodabljajo
neredno in subjektivno (po občutku organizatorja, ne po dejanskih rezultatih).

Posledica je, da:

- boksarji in trenerji težko preverijo trenutno formo in rating posameznega tekmeca,
- organizacija primernih (izenačenih) dvobojev je odvisna od osebnega poznavanja
  tekmecev, ne od objektivnih podatkov,
- zgodovina dvobojev in napredek boksarja skozi čas nista pregledno dostopna
  javnosti, sponzorjem ali drugim klubom.

**BoxRank** je spletna rešitev, ki centralizira podatke o boksarjih, dvobojih in
klubih, ter po vsakem potrjenem dvoboju **avtomatsko preračuna rating boksarja**
(po principu, podobnem Elo sistemu). Na podlagi ratinga in kategorije teže sistem
tudi **predlaga primerne naslednje nasprotnike**, kar olajša pošteno in smiselno
organizacijo dvobojev.

## Ciljni uporabniki

- **Lokalne boksarske zveze / krovne organizacije** – potrebujejo pregled in nadzor
  nad uradnimi rezultati ter enotno, preverjeno lestvico boksarjev po kategorijah.
- **Trenerji in promotorji klubov** – želijo enostavno vnašati dvoboje svojih
  boksarjev, spremljati njihov razvoj in iskati primerne nasprotnike za naslednji
  nastop.
- **Boksarji** – želijo imeti pregleden javni profil, zgodovino dvobojev in trenutni
  rating/uvrstitev.
- **Navijači in širša javnost** – želijo brskati po lestvicah, profilih boksarjev in
  zgodovini dvobojev, brez možnosti urejanja podatkov.

## Kratek opis delovanja rešitve

1. Trener/promotor prijavi svoje boksarje v sistem in jih uvrsti v ustrezno
   kategorijo teže.
2. Po odigranem dvoboju promotor v sistem vnese rezultat (zmagovalec, način zmage,
   datum, dogodek).
3. Admin (predstavnik zveze) pregleda in **potrdi** rezultat dvoboja.
4. Ob potrditvi sistem **avtomatsko preračuna rating** obeh udeleženih boksarjev in
   posodobi lestvico v njuni kategoriji teže.
5. Sistem na podlagi ratinga in kategorije teže boksarjem/trenerjem **predlaga
   primerne bodoče nasprotnike**.
6. Javnost lahko kadarkoli brska po javnih lestvicah, profilih boksarjev in
   zgodovini dvobojev brez prijave.