# Vyfakturuj.cz Cleanup Guide

Po úspěšné migraci a ověření dat můžete odstranit závislost na Vyfakturuj.cz.

## Předpoklady

1. ✅ Migrace byla úspěšně dokončena
2. ✅ Ověření integrity dat proběhlo bez chyb
3. ✅ Paralelní provoz (1-2 týdny) proběhl bez problémů
4. ✅ Všechny nové faktury jsou vytvářeny v novém systému

## Kroky pro odstranění

### 1. Databázová migrace

Vytvořte Prisma migraci pro odstranění Vyfakturuj polí:

```sql
-- Odstranění VyfakturujSettings tabulky
DROP TABLE IF EXISTS "VyfakturujSettings";

-- Odstranění vyfakturuj polí z Customer
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "vyfakturujContactId";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "vyfakturujSyncedAt";

-- Odstranění vyfakturuj polí z Invoice (volitelné - můžete ponechat pro historii)
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujId";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujNumber";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujType";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujFlags";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujVS";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujSyncedAt";
-- ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "vyfakturujRawData";
```

### 2. Odstranění souborů

Smažte následující soubory a složky:

```
src/lib/vyfakturuj/              # Celá složka
  ├── client.ts
  ├── index.ts
  ├── customer-sync.ts
  └── invoice-sync.ts

src/types/vyfakturuj.ts          # Typy pro Vyfakturuj API

vyfakturujcz/                    # API dokumentace
  └── vyfakturujcz.apib
```

### 3. Aktualizace importů

Vyhledejte a odstraňte všechny importy z `@/lib/vyfakturuj`:

```bash
# Hledání importů
grep -r "from '@/lib/vyfakturuj'" src/
grep -r "from '@/types/vyfakturuj'" src/
```

Soubory k aktualizaci:
- `src/app/api/admin/customers/*/route.ts` - odstranit sync funkce
- `src/app/api/admin/invoices/*/route.ts` - odstranit Vyfakturuj integraci
- `src/lib/invoicing/migration/` - může zůstat pro reference

### 4. Odstranění environment variables

Odstraňte z `.env` a `.env.local`:

```
VYFAKTURUJ_API_EMAIL=
VYFAKTURUJ_API_KEY=
VYFAKTURUJ_ENCRYPTION_KEY=
VYFAKTURUJ_DEBUG=
```

### 5. Aktualizace Prisma schématu

Upravte `prisma/schema.prisma`:

```prisma
// Odstranit model VyfakturujSettings

// Z modelu Customer odstranit:
// vyfakturujContactId  Int?      @unique
// vyfakturujSyncedAt   DateTime?

// Z modelu Invoice můžete odstranit (nebo ponechat pro historii):
// vyfakturujId         Int?
// vyfakturujNumber     String?
// vyfakturujType       Int?
// vyfakturujFlags      Int?
// vyfakturujVS         Int?
// publicUrl            String?
// onlinePaymentUrl     String?
// vyfakturujSyncedAt   DateTime?
// vyfakturujRawData    Json?
```

### 6. Spuštění migrace

```bash
npx prisma migrate dev --name remove_vyfakturuj
```

### 7. Aktualizace UI

Odstraňte odkazy na Vyfakturuj z admin panelu:
- Nastavení synchronizace
- Tlačítka pro sync
- Status připojení k Vyfakturuj

### 8. Testování

Po odstranění závislostí otestujte:
- [ ] Vytvoření nové faktury
- [ ] Editace existující faktury
- [ ] Generování PDF
- [ ] Odeslání emailu
- [ ] Dashboard statistiky
- [ ] Export faktur

## Ponechání pro historii

Pokud chcete ponechat historická data o propojení s Vyfakturuj:

1. Ponechte `vyfakturujId` pole v Invoice modelu
2. Ponechte `vyfakturujContactId` v Customer modelu
3. Pouze odstraňte:
   - VyfakturujSettings model
   - Sync funkce a API routes
   - Environment variables

## Rollback

Pokud potřebujete obnovit integraci:

1. Obnovte soubory z git historie
2. Obnovte environment variables
3. Spusťte `npx prisma db push`
4. Restartujte aplikaci

## Kontakt

V případě problémů kontaktujte vývojový tým.
