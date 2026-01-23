# Google Maps API - Průvodce nastavením

## 1. Vytvoření Google Cloud Projektu

1. Přejděte na [Google Cloud Console](https://console.cloud.google.com/)
2. Vytvořte nový projekt nebo vyberte existující
3. Zapněte **Billing** (účtování) - Google vyžaduje platební metodu, ale poskytuje $200 měsíčního kreditu zdarma

## 2. Povolení potřebných APIs

V Google Cloud Console:

1. Otevřete **APIs & Services** → **Library**
2. Vyhledejte a povolte následující APIs:
   - **Places API** (pro vyhledávání adres)
   - **Maps JavaScript API** (pro zobrazení mapy)
   - **Geocoding API** (pro převod adres na GPS souřadnice)

## 3. Vytvoření API klíče

1. Přejděte na **APIs & Services** → **Credentials**
2. Klikněte na **Create Credentials** → **API Key**
3. Klíč se vytvoří automaticky - zkopírujte ho

## 4. Omezení API klíče (doporučeno)

Pro zabezpečení klíče přidejte omezení:

### HTTP Referrer omezení:
1. Otevřete vytvořený API klíč
2. V sekci **Application restrictions** vyberte **HTTP referrers**
3. Přidejte:
   - `http://localhost:3001/*` (pro lokální development)
   - `https://vaše-doména.cz/*` (pro produkci)
   - `https://*.vaše-doména.cz/*` (pro subdomény)

### API omezení:
1. V sekci **API restrictions** vyberte **Restrict key**
2. Vyberte pouze potřebné APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API

## 5. Přidání klíče do projektu

Otevřete soubor `.env.local` a nahraďte:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

Vašim skutečným API klíčem:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...váš-skutečný-klíč
```

## 6. Restart vývojového serveru

Po přidání klíče restartujte Next.js server:

```bash
npm run dev
```

## Ceny a limity

- **$200 měsíčního kreditu zdarma** (platí každý měsíc)
- **Places Autocomplete**: $2.83 za 1000 požadavků
- **Geocoding**: $5.00 za 1000 požadavků
- **Maps JavaScript API**: $7.00 za 1000 načtení mapy

S běžným použitím by měl měsíční kredit $200 pokrýt veškeré náklady.

## Kontrola funkčnosti

Po nastavení API klíče by měly fungovat:

1. **Místo konání** v nové objednávce - našeptávač adres z Google Maps
2. Automatické doplnění GPS souřadnic, PSČ, města a ulice

## Řešení problémů

### "This API key is not authorized"
- Zkontrolujte HTTP referrer omezení
- Zkontrolujte, že jsou povolené správné APIs
- Může trvat 1-5 minut, než se změny projeví

### Autocomplete nefunguje
- Zkontrolujte konzoli prohlížeče na chybové hlášky
- Ověřte, že je **Places API** povolené
- Zkontrolujte platnost API klíče

### Billing upozornění
- Nastavte **budget alerts** v Google Cloud Console
- Doporučené nastavení: upozornění při 50%, 75%, 90% limitu
