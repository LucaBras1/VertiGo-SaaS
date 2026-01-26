# Setlist Components

This directory contains components related to setlist management in the GigBook musicians app.

## SortableSongList

A drag-and-drop component for reordering songs in a setlist.

### Features

- Drag & drop reordering using @hello-pangea/dnd
- Visual feedback during drag (scale, shadow, border highlight)
- Song position numbers that update in real-time
- Duration display with clock icon
- Remove button for each song
- Accessible with ARIA labels
- Responsive design
- Empty state handling

### Usage

```tsx
import { SortableSongList } from '@/components/setlist/SortableSongList'

interface Song {
  id: string
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
}

function MySetlistPage() {
  const [songs, setSongs] = useState<Song[]>([])

  const handleReorder = (reorderedSongs: Song[]) => {
    setSongs(reorderedSongs)
  }

  const handleRemove = (songId: string) => {
    setSongs(songs.filter(s => s.id !== songId))
  }

  return (
    <SortableSongList
      songs={songs}
      onReorder={handleReorder}
      onRemove={handleRemove}
    />
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `songs` | `Song[]` | Yes | Array of songs to display |
| `onReorder` | `(songs: Song[]) => void` | Yes | Callback when songs are reordered |
| `onRemove` | `(songId: string) => void` | Yes | Callback when a song is removed |

### Song Interface

```typescript
interface Song {
  id: string        // Unique identifier (required)
  title: string     // Song title (required)
  artist?: string   // Artist name (optional)
  duration: number  // Duration in seconds (required)
  key?: string      // Musical key (optional)
  bpm?: number      // Beats per minute (optional)
}
```

### Visual States

- **Default**: Gray background with subtle border
- **Hover**: Slightly darker border
- **Dragging**: White background, primary border, shadow, slight rotation
- **Empty**: Centered message prompting to add songs

### Accessibility

- Drag handle has `aria-label="Přetáhnout píseň"`
- Remove button has `aria-label="Odstranit [song title]"`
- Keyboard navigation supported (native browser support)

### Dependencies

- `@hello-pangea/dnd` - Drag and drop functionality
- `lucide-react` - Icons (GripVertical, Clock, X)
- `@/lib/utils` - formatDuration utility
- `@/components/ui/button` - Button component

### Implementation Notes

- Uses React strict mode compatible drag & drop library
- Automatically handles position numbers (1, 2, 3, etc.)
- Order is preserved through the `onReorder` callback
- Duration formatting handled by shared utility function
- Fully typed with TypeScript
