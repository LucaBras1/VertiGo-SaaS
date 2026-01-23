# Admin Panel - Rozšíření filtrování

## Přehled

Rozšíření filtrovacích možností v admin panelu pro lepší práci s daty.

**Datum**: 2025-01-05

---

## Existující infrastruktura

Již existují kvalitní znovupoužitelné komponenty:

- `FilterBar.tsx` - Kontejner pro filtry
- `MultiSelect.tsx` - Multi-select dropdown
- `DateRangePicker.tsx` - Výběr datumového rozsahu
- `ActiveFilters.tsx` - Zobrazení aktivních filtrů
- `SearchInput.tsx` - Debounced vyhledávání

Hoky:
- `useUrlFilters` - Persistence filtrů v URL
- `useBulkSelection` - Hromadný výběr
- `usePagination` - Stránkování

---

## Plán implementace

### Fáze 1: Zákazníci (Customers) - VYSOKÁ PRIORITA

**Aktuální stav**: Pouze filtr typu organizace

**Přidat**:
1. ✅ Text search (jméno, email, IČO, organizace)
2. ✅ Filtr města/lokace
3. ✅ Filtr štítků (tags)
4. ✅ Filtr datumu vytvoření

**Soubory**:
- `src/app/admin/customers/page.tsx`
- `src/app/api/admin/customers/route.ts`

---

### Fáze 2: Objednávky (Orders) - VYSOKÁ PRIORITA

**Aktuální stav**: Status + Date Range

**Přidat**:
1. ✅ Text search (zákazník, organizace, číslo objednávky)
2. ✅ Cenový rozsah (min/max)
3. ✅ Filtr místa konání (město)
4. ✅ Filtr "má fakturu" (boolean)

**Soubory**:
- `src/app/admin/orders/page.tsx`
- `src/app/api/admin/orders/route.ts`

---

### Fáze 3: Faktury (Invoices) - VYSOKÁ PRIORITA

**Aktuální stav**: Status + Due Date Range

**Přidat**:
1. ✅ Text search (zákazník, číslo faktury)
2. ✅ Částka rozsah (min/max)
3. ✅ Filtr datumu vystavení
4. ✅ Filtr Vyfakturuj sync status

**Soubory**:
- `src/app/admin/invoices/page.tsx`
- `src/app/api/admin/invoices/route.ts`

---

### Fáze 4: Akce/Události (Events) - STŘEDNÍ PRIORITA

**Aktuální stav**: Status + Visibility + Date Range

**Přidat**:
1. ✅ Text search (název představení/hry, místo)
2. ✅ Filtr typu (inscenace vs hra)
3. ✅ Filtr města/místa konání

**Soubory**:
- `src/app/admin/events/page.tsx`
- `src/app/api/admin/events/route.ts`

---

### Fáze 5: Inscenace (Performances) - STŘEDNÍ PRIORITA

**Aktuální stav**: Category + Status

**Přidat**:
1. ✅ Text search (název, slug)
2. ✅ Filtr doporučených (featured)
3. ✅ Filtr délky trvání (rozsah)

**Soubory**:
- `src/app/admin/performances/page.tsx`
- `src/app/api/admin/performances/route.ts`

---

### Fáze 6: Hry (Games) - STŘEDNÍ PRIORITA

**Aktuální stav**: Category + Status

**Přidat**:
1. ✅ Text search (název, slug)
2. ✅ Filtr doporučených (featured)
3. ✅ Filtr počtu hráčů (rozsah)
4. ✅ Filtr délky trvání (rozsah)

**Soubory**:
- `src/app/admin/games/page.tsx`
- `src/app/api/admin/games/route.ts`

---

### Fáze 7: Služby (Services) - STŘEDNÍ PRIORITA

**Aktuální stav**: Category + Status

**Přidat**:
1. ✅ Text search (název, slug)
2. ✅ Filtr doporučených (featured)
3. ✅ Cenový rozsah (min/max)

**Soubory**:
- `src/app/admin/services/page.tsx`
- `src/app/api/admin/services/route.ts`

---

### Fáze 8: Aktuality (Posts) - NÍZKÁ PRIORITA

**Aktuální stav**: Status + Publication Date

**Přidat**:
1. ✅ Text search (název, excerpt)
2. ✅ Filtr doporučených (featured)

**Soubory**:
- `src/app/admin/posts/page.tsx`
- `src/app/api/admin/posts/route.ts`

---

### Fáze 9: Tým (Team) - NÍZKÁ PRIORITA

**Aktuální stav**: Pouze Status

**Přidat**:
1. ✅ Text search (jméno, email, role)

**Soubory**:
- `src/app/admin/team/page.tsx`
- `src/app/api/admin/team/route.ts`

---

### Fáze 10: Stránky (Pages) - NÍZKÁ PRIORITA

**Aktuální stav**: Pouze Status

**Přidat**:
1. ✅ Text search (název, slug)

**Soubory**:
- `src/app/admin/pages/page.tsx`
- `src/app/api/admin/pages/route.ts`

---

## Nové komponenty k vytvoření

### 1. RangeInput.tsx
Komponenta pro zadání číselného rozsahu (min/max).
Použití: cena, částka, délka trvání, počet hráčů.

```tsx
interface RangeInputProps {
  label: string
  minValue?: number
  maxValue?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
  unit?: string // "Kč", "min", "hráčů"
  step?: number
}
```

### 2. BooleanFilter.tsx
Komponenta pro boolean filtr (Ano/Ne/Vše).
Použití: má fakturu, doporučené, aktivní.

```tsx
interface BooleanFilterProps {
  label: string
  value: boolean | undefined
  onChange: (value: boolean | undefined) => void
  trueLabel?: string  // "Ano"
  falseLabel?: string // "Ne"
}
```

---

## Pořadí implementace

1. **RangeInput komponenta** - potřeba pro více stránek
2. **BooleanFilter komponenta** - potřeba pro více stránek
3. **Zákazníci** - nejvíce potřebné (IČO, jméno)
4. **Faktury** - důležité pro účetnictví
5. **Objednávky** - důležité pro obchod
6. **Akce** - střední priorita
7. **Inscenace, Hry, Služby** - střední priorita
8. **Aktuality, Tým, Stránky** - nízká priorita

---

## Technické poznámky

### API rozšíření
Každé API route bude potřebovat rozšíření o podporu nových query parametrů:
- `search` - textové vyhledávání
- `minPrice`, `maxPrice` - cenový rozsah
- `minAmount`, `maxAmount` - částka rozsah
- `city` - filtr města
- `hasInvoice` - boolean filtr
- `featured` - boolean filtr
- `createdFrom`, `createdTo` - datumový rozsah vytvoření

### URL persistence
Všechny filtry budou automaticky ukládány do URL díky `useUrlFilters` hooku.

### Debouncing
Textové vyhledávání bude mít debounce 300ms pro optimalizaci.

---

## Odhad práce

| Fáze | Popis | Složitost |
|------|-------|-----------|
| Komponenty | RangeInput, BooleanFilter | Střední |
| Zákazníci | 4 nové filtry | Střední |
| Faktury | 4 nové filtry | Střední |
| Objednávky | 4 nové filtry | Střední |
| Akce | 3 nové filtry | Nízká |
| Inscenace | 3 nové filtry | Nízká |
| Hry | 4 nové filtry | Nízká |
| Služby | 3 nové filtry | Nízká |
| Aktuality | 2 nové filtry | Nízká |
| Tým | 1 nový filtr | Nízká |
| Stránky | 1 nový filtr | Nízká |

---

**Autor**: Claude
**Verze**: 1.0.0
