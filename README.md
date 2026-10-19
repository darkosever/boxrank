# BoxRank

BoxRank je spletna rešitev, ki centralizira podatke o boksarjih, klubih in dvobojih
ter po vsakem potrjenem dvoboju avtomatsko preračuna rating boksarja (po principu,
podobnem Elo sistemu). Na podlagi ratinga in kategorije teže sistem tudi predlaga
primerne naslednje nasprotnike, kar olajša pošteno organizacijo dvobojev.

Projekt je nastal v okviru predmeta RIRS.

## Ciljni uporabniki

- Lokalne boksarske zveze / krovne organizacije
- Trenerji in promotorji klubov
- Boksarji
- Navijači in širša javnost

## Tehnologije

| Del sistema       | Tehnologija                                   |
|--------------------|------------------------------------------------|
| Frontend           | React (Vite), React Router, Axios/Fetch        |
| Backend            | Node.js, Express.js (REST API)                 |
| Podatkovna baza    | PostgreSQL                                      |
| ORM / migracije    | Prisma                                          |
| Avtentikacija      | JWT, bcrypt                                     |
| Lokalni razvoj     | Docker / Docker Compose                         |

## Struktura repozitorija

```
projekt/
├── README.md
├── .gitignore
├── frontend/           # React SPA (frontend aplikacija)
├── backend/            # Node.js/Express REST API
└── docs/               # projektna dokumentacija
    ├── 01-zasnova-resitve.md
    ├── 02-funkcionalnosti-in-obseg.md
    ├── 03-podatkovni-model.md
    ├── 04-arhitektura-in-tehnoloski-sklad.md
    ├── 05-uporabniske-zgodbe.md
    ├── 06-wireframes.md
    ├── wireframes/      # slike wireframe-ov
    └── adr/             # arhitekturne odločitve (MADR)
```

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframes](docs/06-wireframes.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)

## Razvojni proces

Razvoj poteka po strategiji **GitHub Flow**: veja `main` je zaščitena, vse
spremembe se vanjo združujejo izključno preko pull requestov.
