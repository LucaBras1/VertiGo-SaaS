# Debouncing v Admin Rozhraní

## Přehled

Debouncing je technika, která zpozduje provedení funkce až do doby, kdy uživatel přestane provádět danou akci po určitou dobu.

## Výhody

- Méně API volání - Místo 10 requestů při psaní "objednávka" jen 1
- Lepší výkon - Snížení zátěže serveru i browseru
- Lepší UX - Plynulejší rozhraní bez sekání
- Úspora nákladů - Méně DB dotazů = nižší náklady

## Použití

### 1. useDebounce Hook

```tsx
import { useDebounce } from '@/hooks/useDebounce'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)
```

### 2. SearchInput Komponenta

```tsx
import { SearchInput } from '@/components/admin/filters/SearchInput'

<SearchInput
  value={filters.search}
  onChange={(value) => updateFilter('search', value)}
  placeholder="Vyhledat zákazníka..."
  delay={500}
/>
```

## Konfigurace Delay

- Search - 500ms (výchozí)
- Autocomplete - 300ms
- Auto-save - 1000ms
- Filtry - 500ms

## Měření Výkonu

Před: 10 API requestů při psaní "objednávka"  
Po: 1 API request  
Zlepšení: 90% redukce API volání!
