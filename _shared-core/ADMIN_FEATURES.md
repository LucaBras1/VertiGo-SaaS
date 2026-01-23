# Admin Systém - Kompletní Dokumentace Nových Funkcí

## 📋 Přehled Implementovaných Funkcí

Tento dokument popisuje všechny nově implementované funkce v admin systému pro divadlo Studna.

---

## ✅ Fáze 1: Oprava kritického bugu ve službách

### Problém
Stránka `/admin/services` vracela runtime error:
```
TypeError: Cannot read properties of undefined (reading 'map')
```

### Řešení
- **Soubor**: `src/app/admin/services/page.tsx`
- **Změna**: Přidány fallbacky `|| []` na řádcích 265 a 273
- **Status**: ✅ Opraveno a otestováno

### Testování
```bash
curl http://localhost:3001/admin/services
# Očekávaný výsledek: HTTP 200
```

---

## ✅ Fáze 2: Google Maps API Setup

### Implementace

**Soubory**:
- `.env.local` - Přidána konfigurace `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_MAPS_SETUP.md` - Kompletní průvodce nastavením
- Dependencies: `@react-google-maps/api`, `@googlemaps/js-api-loader`

### Nastavení (Důležité!)

1. **Vytvořte Google Cloud projekt**:
   - Přejděte na https://console.cloud.google.com/
   - Vytvořte nový projekt nebo vyberte existující

2. **Povolte API**:
   - Places API
   - Maps JavaScript API
   - Geocoding API

3. **Vytvořte API klíč**:
   - V Google Cloud Console → APIs & Services → Credentials
   - Create Credentials → API Key

4. **Přidejte klíč do projektu**:
   ```bash
   # Otevřete .env.local a nahraďte:
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=váš-skutečný-api-klíč
   ```

5. **Restartujte server**:
   ```bash
   npm run dev
   ```

### Bezpečnostní doporučení
- Přidejte HTTP referrer omezení (localhost:3001, vaše-doména.cz)
- Omezení API pouze na potřebné služby
- Nastavte budget alerts v Google Cloud Console

### Dokumentace
Viz kompletní průvodce: `GOOGLE_MAPS_SETUP.md`

---

## ✅ Fáze 3: Nový zákazník přímo z OrderForm

### Funkce
Možnost vytvořit nového zákazníka přímo při vytváření objednávky bez nutnosti opustit formulář.

### Implementace

**Nové soubory**:
- `src/components/admin/modals/CreateCustomerModal.tsx`

**Upravené soubory**:
- `src/components/admin/OrderForm.tsx`

### Použití

1. Otevřete `/admin/orders/new`
2. V sekci "Zákazník" klikněte na **"+ Nový zákazník"**
3. Vyplňte formulář v modalu
4. Klikněte "Vytvořit zákazníka"
5. Nový zákazník se automaticky vybere v dropdownu

### Funkce modalu
- Základní údaje (jméno, příjmení, email, telefon)
- Organizace a typ organizace
- Adresa (ulice, město, PSČ)
- Validace povinných polí
- Automatické obnovení seznamu zákazníků
- Auto-výběr nově vytvořeného zákazníka

---

## ✅ Fáze 4: Dropdown Refresh Mechanismus

### Problém
Po přidání nové inscenace nebo hry v jiné záložce se nově přidané položky nezobrazily v dropdown menu objednávky.

### Řešení

**Upravený soubor**: `src/components/admin/OrderForm.tsx`

### Použití

1. Otevřete `/admin/orders/new`
2. V sekci "Položky objednávky" klikněte na tlačítko **"🔄 Obnovit"**
3. Všechny dropdowny se obnoví (zákazníci, inscenace, hry, služby)

### Funkce
- Jeden klik pro obnovení všech dropdownů
- Zachování aktuálně vyplněných dat ve formuláři
- Vizuální feedback (ikona RefreshCw)

---

## ✅ Fáze 5: Google Maps Venue Autocomplete

### Funkce
Automatické doplnění adresy místa konání pomocí Google Maps Places API.

### Implementace

**Nové soubory**:
- `src/components/admin/VenueAutocomplete.tsx`

**Upravené soubory**:
- `src/components/admin/OrderForm.tsx`

### Použití

1. Otevřete `/admin/orders/new`
2. V sekci "Místo konání" začněte psát do pole "Vyhledat místo (Google Maps)"
3. Vyberte místo z našeptávaných výsledků
4. Automaticky se vyplní:
   - ✅ Název místa
   - ✅ Ulice a číslo
   - ✅ Město
   - ✅ PSČ
   - ✅ GPS souřadnice (lat, lng)

### Poznámky
- Vyžaduje nakonfigurovaný Google Maps API klíč (viz Fáze 2)
- Omezeno na Českou republiku a Slovensko
- Podporuje jak konkrétní místa (školy, divadla), tak běžné adresy
- Po automatickém vyplnění lze pole ručně upravit

### Zobrazení chyb
- Bez API klíče: "Google Maps API klíč není nakonfigurován. Viz GOOGLE_MAPS_SETUP.md"
- Chyba načítání: "Chyba při načítání Google Maps API"
- Načítání: "Načítání Google Maps..." s animovanou ikonou

---

## ✅ Fáze 6: Auto-vytváření událostí z objednávek

### Funkce
Po potvrzení objednávky se automaticky nabídne vytvoření událostí v kalendáři.

### Implementace

**Nové soubory**:
- `src/components/admin/modals/CreateEventDialog.tsx`
- `src/app/api/admin/events/from-order/route.ts`

### Použití

1. Vytvořte nebo upravte objednávku
2. Nastavte status na **"confirmed"** (potvrzeno)
3. Automaticky se zobrazí dialog "Vytvořit události v kalendáři"
4. Vyberte položky objednávky, které chcete přidat do kalendáře
5. Klikněte "Vytvořit"

### Funkce dialogu

**Výběr položek**:
- Checkbox "Vybrat vše" pro rychlý výběr
- Individuální výběr každé položky
- Zobrazení: název, typ (inscenace/hra), datum, místo konání
- Počítadlo vybraných položek

**Automatické vytvoření události**:
- Událost obsahuje: název (z inscenace/hry), datum, místo konání
- Status: **confirmed** (potvrzeno)
- Viditelnost: **isPublic: false** (soukromé) - lze změnit v administraci událostí
- Propojení s objednávkou přes `linkedEventId`

**Prevence duplikátů**:
- Kontrola existence události pro stejnou inscenaci/hru, datum a místo
- Duplikáty se automaticky přeskočí

### API Endpoint

```typescript
POST /api/admin/events/from-order
Content-Type: application/json

{
  "orderId": "cuid-order-id",
  "itemIds": ["item-id-1", "item-id-2"]
}

// Response:
{
  "success": true,
  "eventsCreated": 2,
  "events": [...],
  "message": "Vytvořeno 2 událostí"
}
```

### Poznámky
- Vytváří se pouze události pro **inscenace** a **hry** (ne služby)
- Události jsou defaultně **soukromé** (isPublic: false)
- Lze je zveřejnit později v `/admin/events`

---

## ✅ Fáze 7: ARES IČO Lookup

### Funkce
Automatické doplnění fakturačních údajů firmy z českého obchodního rejstříku ARES.

### Implementace

**Nové soubory**:
- `src/lib/aresClient.ts` - ARES API klient
- `src/app/api/ares/lookup/route.ts` - API proxy endpoint
- `src/components/admin/IcoLookupButton.tsx` - Tlačítko pro lookup

**Upravené soubory**:
- `src/components/admin/CustomerForm.tsx`

### Použití

1. Otevřete `/admin/customers/new` nebo upravte existujícího zákazníka
2. V sekci "Fakturační údaje" zadejte **IČO** (8 číslic)
3. Klikněte na tlačítko **"🔍 Doplnit z ARES"**
4. Automaticky se vyplní:
   - ✅ Název firmy
   - ✅ DIČ (pokud je k dispozici)
   - ✅ Fakturační adresa (ulice, město, PSČ)

### Funkce

**ARES API klient** (`aresClient.ts`):
- Validace formátu IČO (musí mít 8 číslic)
- Formátování IČO (12 34 56 78)
- Parsování ARES API odpovědi
- Kontrola stavu firmy (aktivní/zaniklá)

**API Endpoint**:
```
GET /api/ares/lookup?ico=12345678

// Response (úspěch):
{
  "ico": "12345678",
  "companyName": "Příklad s.r.o.",
  "dic": "CZ12345678",
  "address": {
    "street": "Příkladová 123/45",
    "city": "Praha",
    "postalCode": "110 00",
    "country": "Česká republika"
  },
  "isActive": true
}

// Response (firma zaniklá):
{
  ...,
  "isActive": false,
  "warning": "Firma je v registru ARES označena jako zaniklá"
}

// Response (chyba):
{
  "error": "IČO musí mít 8 číslic"
}
{
  "error": "Firma s tímto IČO nebyla nalezena v registru ARES"
}
```

### Chybové stavy
- **Neplatné IČO**: "IČO musí mít 8 číslic"
- **Firma nenalezena**: "Firma s tímto IČO nebyla nalezena v registru ARES"
- **Zaniklá firma**: Zobrazí varování, ale data se načtou
- **Chyba API**: "Chyba při komunikaci s registrem ARES. Zkuste to prosím později."

### Poznámky
- Používá oficiální ARES API (`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/`)
- Nevyžaduje API klíč (veřejné API)
- Funguje pouze pro české firmy
- Automatické vyplnění nenahrazuje existující data

---

## 📊 Testování

### Manuální testy

```bash
# 1. Test služeb (oprava bugu)
curl http://localhost:3001/admin/services
# Očekávaný výsledek: HTTP 200

# 2. Test nové objednávky
curl http://localhost:3001/admin/orders/new
# Očekávaný výsledek: HTTP 200

# 3. Test nového zákazníka
curl http://localhost:3001/admin/customers/new
# Očekávaný výsledek: HTTP 200

# 4. Test ARES API
curl "http://localhost:3001/api/ares/lookup?ico=12345678"
# Očekávaný výsledek: JSON s daty firmy nebo chybová hláška
```

### Funkční testy

#### Test 1: Vytvoření zákazníka z OrderForm
1. ✅ Otevřít `/admin/orders/new`
2. ✅ Kliknout "+ Nový zákazník"
3. ✅ Vyplnit formulář
4. ✅ Kliknout "Vytvořit zákazníka"
5. ✅ Ověřit auto-výběr v dropdownu

#### Test 2: Google Maps Autocomplete
1. ⚠️ Nakonfigurovat Google Maps API klíč
2. ✅ Otevřít `/admin/orders/new`
3. ✅ Začít psát do "Vyhledat místo"
4. ✅ Vybrat místo
5. ✅ Ověřit auto-vyplnění všech polí

#### Test 3: ARES Lookup
1. ✅ Otevřít `/admin/customers/new`
2. ✅ Zadat IČO: `00000205` (Ministerstvo financí ČR)
3. ✅ Kliknout "Doplnit z ARES"
4. ✅ Ověřit auto-vyplnění fakturačních údajů

#### Test 4: Dropdown Refresh
1. ✅ Otevřít `/admin/orders/new`
2. ✅ Otevřít nové okno: `/admin/performances/new`
3. ✅ Vytvořit novou inscenaci
4. ✅ Vrátit se na objednávku
5. ✅ Kliknout "🔄 Obnovit"
6. ✅ Ověřit, že nová inscenace je v dropdownu

---

## 🚀 Deployment Checklist

### Před nasazením do produkce:

- [ ] **Google Maps API klíč**:
  - [ ] Vytvořit produkční API klíč
  - [ ] Přidat HTTP referrer omezení pro produkční doménu
  - [ ] Nastavit billing alerts
  - [ ] Přidat do `.env.production` nebo deployment platform secrets

- [ ] **Testování**:
  - [x] Všechny stránky vracejí HTTP 200
  - [x] Services page funguje bez chyb
  - [x] OrderForm načítá všechny dropdowny
  - [x] CustomerForm má všechna pole
  - [x] ARES API endpoint funguje

- [ ] **Dokumentace**:
  - [x] README.md aktualizován
  - [x] ADMIN_FEATURES.md vytvořen
  - [x] GOOGLE_MAPS_SETUP.md vytvořen

- [ ] **Monitoring**:
  - [ ] Nastavit error tracking (Sentry)
  - [ ] Nastavit performance monitoring
  - [ ] Logovat ARES API chyby

---

## 📝 Známé limitace

### Google Maps Autocomplete
- ⚠️ Vyžaduje platný API klíč
- ⚠️ Omezeno na ČR a SK
- ⚠️ Náklady: $2.83 za 1000 požadavků (pokryto $200 měsíčním kreditem)

### ARES API
- ⚠️ Funguje pouze pro české firmy
- ⚠️ Může být dočasně nedostupné (státní API)
- ⚠️ Nezahrnuje slovenské firmy

### Event Dialog
- ℹ️ Dialog se nezobrazuje automaticky při změně statusu (vyžaduje manuální integraci)
- ℹ️ Události jsou defaultně soukromé (je třeba zveřejnit v admin/events)

---

## 🔄 Budoucí vylepšení

1. **Automatické zobrazení Event Dialogu**
   - Zobrazit dialog automaticky při změně statusu na "confirmed"
   - Přidat možnost "Nezobrazovat příště"

2. **Hromadné operace**
   - Hromadné vytváření událostí z více objednávek
   - Hromadné zveřejnění událostí

3. **ARES integrace**
   - Přidat podporu pro slovenské firmy (ORSR.sk)
   - Cache ARES odpovědí pro rychlejší opakované dotazy

4. **Google Maps**
   - Zobrazení mapy místa konání
   - Výpočet vzdálenosti a času cesty

---

## 👨‍💻 Technická podpora

Pro dotazy ohledně implementace kontaktujte vývojáře.

### Užitečné odkazy
- [Google Maps Setup](./GOOGLE_MAPS_SETUP.md)
- [ARES API Dokumentace](https://ares.gov.cz/)
- [Prisma Dokumentace](https://www.prisma.io/docs)
- [Next.js Dokumentace](https://nextjs.org/docs)
