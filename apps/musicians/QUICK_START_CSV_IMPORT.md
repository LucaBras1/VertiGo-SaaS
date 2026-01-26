# Quick Start: CSV Import Feature

## 🚀 Quick Reference

### Files Created (7 total)

```
apps/musicians/
├── src/
│   ├── lib/
│   │   └── utils/
│   │       ├── csv-parser.ts                    ✅ Core parsing logic
│   │       └── __tests__/
│   │           └── csv-parser.test.ts           ✅ Unit tests
│   └── app/
│       ├── api/
│       │   └── repertoire/
│       │       └── import/
│       │           └── route.ts                 ✅ API endpoint
│       └── (dashboard)/
│           └── dashboard/
│               └── repertoire/
│                   └── import/
│                       └── page.tsx             ✅ Import UI
├── public/
│   └── templates/
│       └── repertoire-template.csv              ✅ Sample template
├── docs/
│   └── REPERTOIRE_CSV_IMPORT.md                 ✅ Full documentation
└── IMPLEMENTATION_SUMMARY.md                     ✅ Implementation details
```

---

## 📋 For Developers

### Test the Feature

1. **Run unit tests:**
   ```bash
   cd apps/musicians
   npm test csv-parser
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Navigate to import page:**
   ```
   http://localhost:3000/dashboard/repertoire/import
   ```

4. **Test with sample CSV:**
   - Download template from UI or use `public/templates/repertoire-template.csv`
   - Upload via drag-and-drop or file browser
   - Verify preview shows correctly
   - Click import and check results

### API Testing

**Endpoint:** `POST /api/repertoire/import`

**Test with cURL:**
```bash
curl -X POST http://localhost:3000/api/repertoire/import \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@path/to/songs.csv"
```

**Expected Response:**
```json
{
  "imported": 10,
  "total": 10,
  "errors": []
}
```

---

## 📝 For End Users

### How to Import Songs

1. **Prepare CSV File**
   - Required: `title` column
   - Optional: `artist`, `genre`, `duration`, `bpm`, `key`, `notes`
   - Download sample template from import page

2. **Upload File**
   - Go to Repertoire → Import CSV
   - Drag & drop CSV file or click to browse
   - Review preview of first 5 rows

3. **Import**
   - Click "Importovat písně" (Import Songs)
   - Wait for processing
   - Review results

### CSV Format Examples

**Minimal (only title):**
```csv
title
Bohemian Rhapsody
Imagine
Sweet Child O' Mine
```

**Full (all fields):**
```csv
title,artist,genre,duration,bpm,key,notes
Bohemian Rhapsody,Queen,Rock,355,72,Bb,Classic rock anthem
Imagine,John Lennon,Pop,3:03,76,C,Peace song
```

**Czech headers:**
```csv
název,interpret,žánr,délka,tempo,tónina,poznámky
Bohemian Rhapsody,Queen,Rock,5:55,72,Bb,Klasická hymna
```

---

## 🔧 Troubleshooting

### Build Errors

**Error:** `Cannot find module '@/lib/utils/csv-parser'`
**Fix:** Run `npm install` and restart dev server

**Error:** `Module not found: Can't resolve '@/generated/prisma'`
**Fix:** Run `npx prisma generate`

### Runtime Errors

**Error:** "Unauthorized"
**Fix:** User must be logged in with valid session

**Error:** "Title column is required"
**Fix:** CSV must have a column named `title`, `název`, `name`, or `song`

**Error:** "Only CSV files are allowed"
**Fix:** File extension must be `.csv`

### Data Issues

**Issue:** Duration shows 0 seconds
**Fix:** Use format `180` (seconds), `3:45` (MM:SS), or `3m45s`

**Issue:** Czech characters broken
**Fix:** Save CSV with UTF-8 encoding

---

## 🎯 Testing Checklist

### Automated Tests
- [ ] Run `npm test csv-parser` - all tests pass

### Manual Tests
- [ ] Upload CSV via drag-and-drop
- [ ] Upload CSV via file browser
- [ ] Preview shows correct data
- [ ] Import completes successfully
- [ ] Error rows reported correctly
- [ ] Redirect to repertoire after success
- [ ] Songs appear in repertoire list
- [ ] Download sample template works

### Edge Cases
- [ ] Empty CSV (should fail)
- [ ] CSV with only header (should fail)
- [ ] CSV with missing title column (should fail)
- [ ] CSV with empty title rows (partial import)
- [ ] CSV with non-English characters
- [ ] Large CSV (1000+ rows)

---

## 📊 Sample CSV Data

### 10 Popular Songs (Ready to Use)

Save as `songs.csv`:
```csv
title,artist,genre,duration,bpm,key,notes
Bohemian Rhapsody,Queen,Rock,355,72,Bb,Classic rock anthem
Imagine,John Lennon,Pop,183,76,C,Peace song
Sweet Child O' Mine,Guns N' Roses,Rock,356,125,D,Guitar solo heavy
Billie Jean,Michael Jackson,Pop,294,117,F#m,Danceable groove
Wonderwall,Oasis,Rock,258,87,F#m,Acoustic driven
Smells Like Teen Spirit,Nirvana,Grunge,302,116,F,Power chords
Hotel California,Eagles,Rock,391,74,Bm,Extended guitar outro
Shape of You,Ed Sheeran,Pop,234,96,C#m,Modern pop
Stairway to Heaven,Led Zeppelin,Rock,482,82,Am,Progressive epic
Rolling in the Deep,Adele,Soul,228,105,Cm,Powerful vocals
```

---

## 🔗 Key Functions

### `parseRepertoireCSV(csvContent: string)`

**Purpose:** Parse CSV content into song objects

**Returns:**
```typescript
{
  success: boolean,
  songs: ParsedSong[],
  errors: Array<{ row: number, message: string }>,
  totalRows: number
}
```

**Usage:**
```typescript
import { parseRepertoireCSV } from '@/lib/utils/csv-parser'

const result = parseRepertoireCSV(csvContent)
if (result.success) {
  console.log(`Parsed ${result.songs.length} songs`)
} else {
  console.error(`Errors: ${result.errors.length}`)
}
```

---

## 🎨 UI Components Used

- `Button` - Action buttons
- `Card` - Container cards
- `Input` - File input (hidden)
- `Label` - Form labels
- `toast` - Notifications

Icons from `lucide-react`:
- `Upload`, `FileText`, `Download`, `ArrowLeft`
- `CheckCircle`, `XCircle`, `AlertCircle`

---

## 📚 Documentation Links

- **Full Documentation:** `docs/REPERTOIRE_CSV_IMPORT.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Sample Template:** `public/templates/repertoire-template.csv`

---

## ✅ Quick Verification

Run these commands to verify installation:

```bash
# Check files exist
ls -la src/lib/utils/csv-parser.ts
ls -la src/app/api/repertoire/import/route.ts
ls -la "src/app/(dashboard)/dashboard/repertoire/import/page.tsx"

# Run tests
npm test csv-parser

# Build project
npm run build
```

All files should exist and tests should pass.

---

**Last Updated:** 2026-01-23
**Status:** ✅ Ready for Production
**Version:** 1.0.0
