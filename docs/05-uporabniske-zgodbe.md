# 05 – Uporabniške zgodbe

Uporabniške zgodbe so napisane za MVP in ključne funkcionalnosti rešitve **BoxRank**,
kot so bile definirane v nalogi 1 (`02-funkcionalnosti-in-obseg.md`). Vsaka zgodba
sledi obliki:

> Kot [uporabniška vloga] želim [dejanje/cilj], da [razlog/vrednost].

in vsebuje oznako, povezano funkcionalnost ter 3–5 konkretnih, preverljivih
acceptance criteria (INVEST).

---

## US-01 – Registracija in prijava uporabnika

**Povezana funkcionalnost:** Prijava in registracija uporabnikov z dodelitvijo vloge (12)
**Vloga:** Admin / Promotor / Boksar

Kot nov uporabnik želim ustvariti račun in se prijaviti z e-poštnim naslovom in
geslom, da lahko dostopam do funkcionalnosti glede na svojo vlogo.

**Acceptance criteria:**
- Registracija zahteva veljaven, še neuporabljen e-poštni naslov in geslo z vsaj 8 znaki.
- Geslo se v bazi shrani kot hash (bcrypt), nikoli v čistem besedilu.
- Ob registraciji uporabnik izbere vlogo (`promoter` ali `boxer`); vlogo `admin` lahko dodeli samo obstoječi admin.
- Ob uspešni prijavi sistem izda JWT žeton, ki vsebuje identiteto in vlogo uporabnika.
- Napačen e-poštni naslov ali geslo vrne sporočilo o napaki brez razkritja, kateri podatek je napačen.

---

## US-02 – Urejanje profila boksarja

**Povezana funkcionalnost:** Vnos in urejanje profila boksarja (1)
**Vloga:** Promotor

Kot promotor želim vnesti in urejati osnovne podatke boksarja (ime, datum rojstva,
klub, kategorija teže, fotografija), da je profil boksarja v sistemu točen in
aktualen.

**Acceptance criteria:**
- Obvezna polja (ime, priimek, datum rojstva, kategorija teže) morajo biti izpolnjena, preden se profil shrani.
- Boksar je lahko dodeljen samo eni kategoriji teže hkrati, izbrani iz obstoječega seznama `WeightClass`.
- Fotografija se naloži v formatu JPG/PNG do 5 MB; brez naložene fotografije se prikaže privzeta ikona.
- Promotor lahko ureja samo boksarje svojega kluba; poskus urejanja boksarja drugega kluba vrne napako 403.
- Po shranjevanju se spremembe takoj odrazijo na javnem profilu boksarja.

---

## US-03 – Vnos predloga dvoboja z rezultatom

**Povezana funkcionalnost:** Vnos predloga dvoboja z rezultatom s strani promotorja (2)
**Vloga:** Promotor

Kot promotor želim vnesti rezultat odigranega dvoboja (nasprotnik, datum, dogodek,
način zmage, zmagovalec), da se rezultat posreduje v potrjevanje in sčasoma vpliva na rating boksarja.

**Acceptance criteria:**
- Obvezna polja so oba boksarja, datum, dogodek, način zmage (KO/TKO/odločitev/neodločeno) in zmagovalec (razen pri neodločenem izidu).
- Oba boksarja v dvoboju morata biti v isti kategoriji teže, sicer sistem vnosa ne dovoli.
- Novo vnesen dvoboj dobi status `pending` ("v potrjevanju") in se ne upošteva pri ratingu, dokler ni potrjen.
- Promotor lahko vnese dvoboj le za boksarja svojega kluba.
- Po oddaji se predlog prikaže na seznamu "dvoboji v potrjevanju" pri adminu.

---

## US-04 – Potrditev ali zavrnitev dvoboja

**Povezana funkcionalnost:** Potrditev ali zavrnitev dvoboja s strani admina (3)
**Vloga:** Admin

Kot admin želim pregledati in potrditi ali zavrniti vnesen predlog dvoboja, da v
sistem pridejo le verodostojni, preverjeni rezultati.

**Acceptance criteria:**
- Admin vidi seznam vseh dvobojev s statusom `pending`, urejen po datumu vnosa.
- Admin ne more potrditi dvoboja, ki ga je vnesel sam (sistem to ne omejuje, ker potrditev vedno izvaja admin, ki ni promotor vpletenega kluba, kar se preveri po vlogi).
- Ob potrditvi se status dvoboja spremeni v `confirmed` in se sproži preračun ratinga obeh boksarjev.
- Ob zavrnitvi se status spremeni v `rejected`, rating se ne spremeni, promotor pa prejme razlog zavrnitve.
- Potrjenega dvoboja ni mogoče ponovno urejati, lahko pa ga admin kasneje prekliče in sproži ponovni preračun lestvice.

---

## US-05 – Avtomatski preračun ratinga po dvoboju

**Povezana funkcionalnost:** Avtomatski preračun ratinga boksarja (4)
**Vloga:** Admin / Boksar (posredno)

Kot admin želim, da se ob potrditvi dvoboja rating obeh boksarjev avtomatsko
preračuna po Elo-podobnem algoritmu, da je lestvica vedno odraz dejanskih rezultatov in ne ročnih popravkov.

**Acceptance criteria:**
- Preračun ratinga se izvede samo ob prehodu dvoboja v status `confirmed`, nikoli ročno.
- Zmagovalec pridobi točke, poraženec jih izgubi, glede na razliko ratingov pred dvobojem (večji presenečenje = večja sprememba).
- Pri neodločenem izidu se rating obeh boksarjev spremeni minimalno, glede na formulo za neodločen izid.
- Za vsak preračun se ustvari zapis v `RatingHistory` z ratingom pred in po dvoboju.
- Preračun in posodobitev lestvice se izvedeta znotraj ene baze-transakcije, da ne pride do neusklajenih podatkov.

---

## US-06 – Pregled lestvice po kategoriji teže

**Povezana funkcionalnost:** Lestvica (ranking) boksarjev po kategorijah teže (5)
**Vloga:** Javni obiskovalec

Kot obiskovalec želim pregledati lestvico boksarjev znotraj izbrane kategorije
teže, da vidim, kdo je trenutno najbolje uvrščen.

**Acceptance criteria:**
- Lestvica je dostopna brez prijave in privzeto prikaže vse obstoječe kategorije teže za izbor.
- Boksarji so znotraj izbrane kategorije razvrščeni padajoče po `current_rating`.
- Vsaka vrstica prikaže uvrstitev, ime, klub in trenutni rating boksarja.
- Suspendirani boksarji so na lestvici vidni, vendar jasno oznaceni kot "suspendiran".
- Lestvica podpira straničenje z največ 20 boksarji na stran.

---

## US-07 – Predlog primernih nasprotnikov

**Povezana funkcionalnost:** Predlog primernih bodočih nasprotnikov (6)
**Vloga:** Promotor / Boksar

Kot promotor želim za svojega boksarja prejeti predlog primernih nasprotnikov
glede na rating in kategorijo teže, da lahko organiziram izenačen in smiseln dvoboj.

**Acceptance criteria:**
- Predlagani nasprotniki so vedno iz enake kategorije teže kot izbrani boksar.
- Predlagani so samo boksarji s statusom `active` (suspendirani se ne predlagajo).
- Predlog prikaže do 10 nasprotnikov, razvrščenih po absolutni razliki ratinga (najbližji rating na vrhu).
- Boksar, ki je v zadnjih 30 dneh že nastopil, je v predlogu vseeno prikazan, vendar oznacen z datumom zadnjega dvoboja.
- Funkcionalnost je na voljo tako promotorju (za svoje boksarje) kot boksarju samemu (za svoj profil).

---

## US-08 – Zgodovina gibanja ratinga

**Povezana funkcionalnost:** Zgodovina gibanja ratinga boksarja skozi čas (7)
**Vloga:** Boksar / Javni obiskovalec

Kot boksar (ali obiskovalec, ki pregleduje profil) želim videti grafični prikaz
gibanja ratinga skozi čas, da razumem napredek boksarja skozi kariero.

**Acceptance criteria:**
- Graf prikaže rating na časovni osi, pri čemer vsaka točka ustreza enemu potrjenemu dvoboju.
- Vsaka točka na grafu ob kliku/hoverju prikaže datum, nasprotnika in spremembo ratinga.
- Če boksar še ni odigral nobenega potrjenega dvoboja, se namesto grafa prikaže sporočilo "Ni še podatkov o dvobojih".
- Graf je dostopen javno na profilu boksarja, brez prijave.
- Podatki na grafu se ujemajo s zapisi v `RatingHistory` za izbranega boksarja.

---

## US-09 – Pregled zgodovine dvobojev boksarja

**Povezana funkcionalnost:** Pregled podrobne zgodovine dvobojev posameznega boksarja (8)
**Vloga:** Javni obiskovalec

Kot obiskovalec želim na profilu boksarja videti seznam vseh njegovih odigranih
dvobojev, da lahko ocenim njegovo formo in izkušnje.

**Acceptance criteria:**
- Seznam vsebuje samo dvoboje s statusom `confirmed`, urejene od najnovejšega do najstarejšega.
- Za vsak dvoboj je prikazan nasprotnik, datum, dogodek, način zmage in izid (zmaga/poraz/neodločeno).
- Ob kliku na nasprotnika se odpre njegov profil.
- Seznam prikaže skupni rezultat kariere (npr. "12 Z – 2 P – 1 N") na vrhu.
- Če boksar nima potrjenih dvobojev, se prikaže sporočilo "Še ni odigranih dvobojev".

---

## US-10 – Upravljanje kategorij teže

**Povezana funkcionalnost:** Upravljanje kategorij teže s strani admina (9)
**Vloga:** Admin

Kot admin želim dodajati, urejati in brisati kategorije teže, da lestvica in
profili boksarjev vedno ustrezajo veljavnim uradnim kategorijam.

**Acceptance criteria:**
- Admin lahko doda novo kategorijo z imenom, minimalno in maksimalno težo (kg).
- Sistem ne dovoli prekrivajočih se razponov teže med dvema kategorijama.
- Kategorije, ki imajo vsaj enega dodeljenega boksarja, ni mogoče izbrisati, le preimenovati ali urediti razpon.
- Urejanje razpona obstoječe kategorije ne spremeni samodejno dodeljenih boksarjev.
- Vsaka sprememba kategorije je takoj vidna na javni lestvici (seznam razpoložljivih kategorij).

---

## US-11 – Suspenz boksarja

**Povezana funkcionalnost:** Suspenz/deaktivacija boksarja s strani admina (10)
**Vloga:** Admin

Kot admin želim suspendirati boksarja (npr. zaradi dopinga ali poškodbe), da se ga
začasno izloči iz predlogov za nove dvoboje, brez izgube njegove zgodovine.

**Acceptance criteria:**
- Admin ob suspenzu vnese razlog, ki se shrani ob statusu boksarja.
- Suspendiran boksar (status `suspended`) se ne pojavi v predlogih primernih nasprotnikov (US-07).
- Suspendiran boksar ostane viden na lestvici in ohrani celotno zgodovino dvobojev in ratinga.
- Promotor suspendiranega boksarja ne more zanj vnesti novega predloga dvoboja.
- Admin lahko kadarkoli prekliče suspenz in boksarja vrne v status `active`.

---

## US-12 – Upravljanje kluba in njegovih boksarjev

**Povezana funkcionalnost:** Upravljanje kluba in seznama njegovih boksarjev (11)
**Vloga:** Promotor

Kot promotor želim upravljati podatke svojega kluba in pregledati seznam vseh
boksarjev, ki mu pripadajo, da imam celosten pregled nad svojimi tekmovalci.

**Acceptance criteria:**
- Promotor lahko uredi ime in lokacijo svojega kluba.
- Seznam boksarjev kluba prikaže ime, kategorijo teže, trenutni rating in status (aktiven/suspendiran) vsakega boksarja.
- Promotor lahko iz tega seznama neposredno odpre profil posameznega boksarja za urejanje.
- Promotor vidi samo klub(e), ki jih upravlja; dostop do podatkov drugih klubov vrne napako 403.
- Dodajanje novega boksarja v klub je mogoče neposredno iz pregleda kluba.

---

## US-13 – Javni pregled profila in lestvic brez prijave

**Povezana funkcionalnost:** Javni pregled profila boksarja in lestvic brez prijave (13)
**Vloga:** Javni obiskovalec

Kot obiskovalec brez uporabniškega računa želim brskati po lestvicah in profilih
boksarjev, da lahko spremljam boksarsko sceno brez registracije.

**Acceptance criteria:**
- Dostop do strani z lestvicami in profili boksarjev ne zahteva prijave ali JWT žetona.
- Javni obiskovalec ne vidi nobenih gumbov ali povezav za urejanje, vnos ali potrditev podatkov.
- Poskus neposrednega klica zaščitenega API endpointa (npr. potrditev dvoboja) brez žetona vrne napako 401.
- Vse informacije, vidne javnemu obiskovalcu, so enake informacijam na javnem profilu, ki jih vidijo prijavljeni uporabniki.
- Stran se pravilno prikaže tudi, če uporabnik med brskanjem nikoli ne odpre prijavnega obrazca.

---

## US-14 – Filtriranje in iskanje boksarjev

**Povezana funkcionalnost:** Filtriranje in iskanje boksarjev po kategoriji, klubu ali imenu (14)
**Vloga:** Javni obiskovalec

Kot obiskovalec želim poiskati boksarja po imenu ali ga filtrirati po kategoriji
teže in klubu, da hitro najdem iskanega boksarja med vsemi profili.

**Acceptance criteria:**
- Iskanje po imenu vrne rezultate, ki vsebujejo vneseni niz, ko uporabnik vnese vsaj 3 znake.
- Filtre po kategoriji teže in klubu je mogoče kombinirati hkrati z iskanjem po imenu.
- Rezultati prikažejo ime, klub, kategorijo teže in trenutni rating, z največ 20 rezultati na stran.
- Če ni najdenih rezultatov, se prikaže sporočilo "Ni rezultatov" s predlogom za spremembo filtrov.
- Ponastavitev filtrov povrne celoten seznam boksarjev brez omejitev.

---

## US-15 – Pregled dogodka (fight card)

**Povezana funkcionalnost:** Pregled dogodkov (fight card) z vsemi dvoboji dogodka (15)
**Vloga:** Javni obiskovalec

Kot obiskovalec želim odpreti pregled posameznega dogodka in videti vse dvoboje,
ki so bili ali bodo odigrani na njem, da dobim celoten vpogled v fight card.

**Acceptance criteria:**
- Stran dogodka prikaže ime dogodka, datum in seznam vseh pripadajočih dvobojev.
- Vsak dvoboj na seznamu prikaže oba boksarja, kategorijo teže in (če je potrjen) izid.
- Dvoboji s statusom `pending` so na strani dogodka oznaceni kot "rezultat še ni potrjen".
- Klik na boksarja v okviru dogodka odpre njegov celoten profil.
- Dogodki so na pregledni strani razvrščeni od najnovejšega do najstarejšega.
