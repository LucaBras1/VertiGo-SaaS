# Repertoire CSV Import Feature

## Overview

This feature allows musicians to bulk import their song repertoire from CSV files into the GigBook application. It includes robust CSV parsing, validation, error handling, and a user-friendly drag-and-drop interface.

## Architecture

### Files Created

1. **CSV Parser Utility** (`src/lib/utils/csv-parser.ts`)
   - Core parsing logic
   - Handles multiple CSV formats and encodings
   - Supports both English and Czech column headers
   - Validates data and provides detailed error reporting

2. **Import API Route** (`src/app/api/repertoire/import/route.ts`)
   - Handles file uploads
   - Authenticates users
   - Processes CSV and creates database records
   - Returns import results with error details

3. **Import UI Page** (`src/app/(dashboard)/dashboard/repertoire/import/page.tsx`)
   - User-friendly drag-and-drop interface
   - CSV preview before import
   - Real-time feedback and progress
   - Error reporting with row numbers
   - Download sample template functionality

4. **Unit Tests** (`src/lib/utils/__tests__/csv-parser.test.ts`)
   - Comprehensive test coverage for CSV parser
   - Tests for various CSV formats and edge cases

## CSV Format

### Required Column
- **title** (or Czech: "název", "píseň", "name", "song") - Song title

### Optional Columns
- **artist** (or Czech: "interpret", "autor", "author") - Artist/band name
- **genre** (or Czech: "žánr", "styl", "style") - Musical genre
- **duration** (or Czech: "délka", "trvání", "length") - Song duration
  - Formats supported:
    - Seconds: `180`
    - MM:SS: `3:45`
    - Minutes/seconds: `3m45s`
- **bpm** (or Czech: "tempo") - Beats per minute (number)
- **key** (or Czech: "tónina", "tonalita") - Musical key (e.g., "C", "Am", "Bb")
- **notes** (or Czech: "poznámky", "komentář", "comment") - Additional notes

### Sample CSV

```csv
title,artist,genre,duration,bpm,key,notes
Bohemian Rhapsody,Queen,Rock,355,72,Bb,Classic rock anthem
Imagine,John Lennon,Pop,183,76,C,Peace song
Sweet Child O' Mine,Guns N' Roses,Rock,356,125,D,Guitar solo heavy
```

### Czech Sample CSV

```csv
název,interpret,žánr,délka,tempo,tónina,poznámky
Bohemian Rhapsody,Queen,Rock,5:55,72,Bb,Klasická rocková hymna
Imagine,John Lennon,Pop,3:03,76,C,Píseň o míru
```

## Features

### 1. Flexible Column Mapping
- Supports both English and Czech column names
- Case-insensitive header matching
- Multiple acceptable names for each field

### 2. Robust CSV Parsing
- Handles quoted values with commas inside
- Skips empty lines
- Trims whitespace
- Supports various duration formats

### 3. Data Validation
- Ensures title is present (required field)
- Validates numeric fields (duration, bpm)
- Provides row-level error reporting

### 4. User-Friendly Interface
- Drag-and-drop file upload
- Click-to-browse alternative
- CSV preview before import
- Real-time file size display
- Sample template download

### 5. Error Handling
- Row-by-row error tracking
- Partial import support (import valid rows, report errors)
- Clear error messages with row numbers
- Skip duplicates automatically

### 6. Security
- Authentication required
- Tenant isolation (songs tied to user's organization)
- File type validation
- Size limits enforced

## API Endpoints

### POST `/api/repertoire/import`

**Authentication:** Required (NextAuth session)

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing CSV

**Response:**
```typescript
{
  imported: number,      // Number of successfully imported songs
  total: number,         // Total rows in CSV (excluding header)
  errors: Array<{        // Array of errors encountered
    row: number,         // Row number (1-indexed)
    message: string      // Error description
  }>
}
```

**Status Codes:**
- `200` - Import completed (may have partial errors)
- `400` - Invalid file or CSV format
- `401` - Unauthorized (no valid session)
- `500` - Server error

## Usage

### For Users

1. Navigate to **Repertoire** page
2. Click **Import CSV** button
3. Either drag-and-drop a CSV file or click to browse
4. Review the preview of first 5 rows
5. Click **Import Songs** to complete the import
6. Review results:
   - Green checkmark: All songs imported successfully
   - Yellow warning: Some songs imported with errors
   - Error list shows specific row numbers and issues

### Download Sample Template
Click the "Download Sample Template" button to get a pre-formatted CSV file with example data.

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "CSV must have header and at least one data row" | Empty or single-line CSV | Add data rows to CSV |
| "Title column is required" | Missing title column in header | Add a "title" column to CSV |
| "Missing title" | Empty title in data row | Ensure all rows have a title value |
| "Only CSV files are allowed" | Wrong file type | Upload a .csv file |
| "No file provided" | Empty upload | Select a file to upload |

## Database Schema

Songs are stored in the `RepertoireSong` model with the following fields:

```prisma
model RepertoireSong {
  id        String   @id @default(cuid())
  tenantId  String   // Multi-tenant isolation
  vertical  Vertical @default(MUSICIANS)

  title       String
  artist      String?
  genre       String?
  mood        String?
  duration    Int      // in seconds
  key         String?
  bpm         Int?

  // ... other fields
}
```

## Performance

- Bulk insert using Prisma's `createMany()` for efficiency
- `skipDuplicates: true` to avoid constraint violations
- Single transaction for entire import
- Handles files up to 10 MB

## Testing

Run unit tests:
```bash
npm test csv-parser
```

Test coverage includes:
- Basic CSV parsing (English/Czech headers)
- Quoted values with commas
- Multiple duration formats
- Missing optional fields
- Empty lines handling
- Error cases (missing title, no data)
- Mixed valid/invalid rows

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Column Mapping**
   - Allow users to manually map columns if auto-detection fails
   - Save mapping preferences per user

2. **Validation Preview**
   - Show validation errors before import
   - Highlight problematic rows in preview

3. **Duplicate Detection**
   - Check for existing songs by title + artist
   - Option to update or skip duplicates

4. **Batch Processing**
   - For very large CSV files (>1000 rows)
   - Progress bar showing % complete

5. **Import History**
   - Track import jobs
   - Allow rollback of recent imports

6. **Export Functionality**
   - Export existing repertoire to CSV
   - Customize export columns

## Troubleshooting

### Common Issues

**Problem:** Import fails with "Unauthorized"
**Solution:** Ensure user is logged in and has valid session

**Problem:** All rows show "Missing title" error
**Solution:** Check CSV encoding (should be UTF-8) and ensure title column is named correctly

**Problem:** Duration values not parsing correctly
**Solution:** Use supported formats: `180`, `3:45`, or `3m45s`

**Problem:** Czech characters not displaying correctly
**Solution:** Ensure CSV is saved with UTF-8 encoding

## Support

For issues or questions:
1. Check error messages in the import results
2. Verify CSV format matches sample template
3. Review this documentation
4. Contact support with specific error messages

---

**Last Updated:** 2026-01-23
**Version:** 1.0.0
