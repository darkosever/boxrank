# 04 – Arhitektura in tehnološki sklad

## Arhitektura

### Glavni deli sistema

- **Frontend (SPA)** – spletna aplikacija, s katero uporabniki (admin, promotor,
  boksar, javnost) dostopajo do funkcionalnosti glede na svojo vlogo.
- **Backend (REST API)** – strežnik, ki izvaja poslovno logiko: avtentikacijo,
  preverjanje pravic po vlogah, workflow potrjevanja dvobojev in preračun ratinga.
- **Podatkovna baza (PostgreSQL)** – trajno hranjenje podatkov o uporabnikih,
  klubih, boksarjih, dvobojih in zgodovini ratinga.

### Komunikacija med deli sistema

Frontend komunicira z backendom izključno preko **REST API** klicev (JSON preko
HTTPS). Backend je edina komponenta, ki dostopa do podatkovne baze (preko ORM-ja),
frontend nima neposrednega dostopa do baze. Avtentikacija med frontendom in
backendom poteka preko **JWT** žetona, ki se po prijavi shrani na strani odjemalca
in pošilja v `Authorization` glavi vsake nadaljnje zahteve.

```
┌─────────────┐        HTTPS / JSON (REST)        ┌──────────────┐        SQL        ┌──────────────┐
│  Frontend   │  ───────────────────────────────▶ │   Backend    │ ─────────────────▶│  PostgreSQL  │
│  (React)    │ ◀─────────────────────────────── │  (Node/Express)│ ◀─────────────────│   baza       │
└─────────────┘        JSON odgovor + JWT          └──────────────┘    rezultat        └──────────────┘
```

### Podatkovna baza

PostgreSQL – relacijska baza, primerna za podatkovni model z jasnimi povezavami
(boksar – klub – dvoboj – zgodovina ratinga), ki zahteva referenčno integriteto
(tuje ključe) in transakcijsko varen preračun ratinga ob potrditvi dvoboja.

### Avtentikacija / upravljanje uporabnikov

- Registracija in prijava z e-poštnim naslovom in geslom (geslo shranjeno kot hash,
  npr. bcrypt).
- Po prijavi backend izda **JWT** žeton, ki vsebuje identiteto uporabnika in njegovo
  vlogo (`admin`, `promoter`, `boxer`).
- Backend na vsakem zaščitenem endpointu preveri žeton in vlogo (middleware za
  avtorizacijo) – npr. le `admin` lahko pokliče endpoint za potrditev dvoboja.
- Javni (nezaščiteni) endpointi (pregled lestvic, profilov) ne zahtevajo prijave.

### Način lokalnega zagona

- Podatkovna baza PostgreSQL teče v Docker vsebniku (`docker-compose up db`).
- Backend (Node/Express) se zažene lokalno s `npm run dev`, povezuje se na lokalno
  bazo preko `DATABASE_URL` v `.env` datoteki, migracije sheme preko Prisma
  (`npx prisma migrate dev`).
- Frontend (React + Vite) se zažene z `npm run dev` in kliče backend API na
  lokalnem naslovu (npr. `http://localhost:3000`).
- Celoten sistem (baza + backend + frontend) je mogoče zagnati z enim ukazom preko
  `docker-compose up`, kar poenostavi zagon pri vajah.

## Tehnološki sklad

| Del sistema         | Tehnologija / orodje                              |
|----------------------|----------------------------------------------------|
| Frontend             | React (Vite), React Router, Axios/Fetch za API klice |
| Backend              | Node.js, Express.js (REST API)                    |
| Podatkovna baza      | PostgreSQL                                         |
| ORM / migracije      | Prisma                                             |
| Avtentikacija        | JWT (jsonwebtoken), bcrypt za hashiranje gesel     |
| Lokalni razvoj       | Docker / Docker Compose, `.env` konfiguracija      |
| Testiranje (okvirno) | Jest / Supertest za backend teste                 |
| Verzioniranje        | Git / GitHub                                       |

## Arhitekturne odločitve

- **Ločen frontend in backend (ne monolitni server-rendered pristop):** omogoča
  jasno ločitev odgovornosti, lažje testiranje API-ja neodvisno od uporabniškega
  vmesnika, ter možnost kasnejše zamenjave frontenda (npr. mobilna aplikacija) brez
  spremembe backend logike.
- **PostgreSQL namesto NoSQL baze:** podatkovni model ima jasne relacije in
  zahteva referenčno integriteto (npr. dvoboj mora vedno referencirati obstoječa
  boksarja), kar relacijska baza naravno podpira; prav tako je preračun ratinga
  lažje izvesti znotraj ene transakcije.
- **JWT avtentikacija namesto sejnih piškotkov na strežniku:** backend ostane brez
  stanja (stateless), kar poenostavi skaliranje in je standarden pristop pri REST
  API-jih.
- **Ločitev vloge vnosa (promotor) od vloge potrditve (admin):** preprečuje, da bi
  klub sam potrdil lastne (morebiti neobjektivne) rezultate, kar je ključno za
  zaupanje v avtomatsko izračunan rating.
- **Docker Compose za lokalni zagon:** zagotavlja, da je okolje (zlasti baza)
  enako na vseh razvojnih strojih in poenostavi zagon pri predstavitvi vaj.
