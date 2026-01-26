'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, X, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Song {
  id: string
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
}

interface SortableSongListProps {
  songs: Song[]
  onReorder: (songs: Song[]) => void
  onRemove: (songId: string) => void
}

export function SortableSongList({ songs, onReorder, onRemove }: SortableSongListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(songs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(items)
  }

  if (songs.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Přidejte písně ze seznamu vpravo
      </p>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="setlist">
        {(provided, snapshot) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {songs.map((song, index) => (
              <Draggable key={song.id} draggableId={song.id} index={index}>
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      snapshot.isDragging
                        ? 'shadow-lg border-primary-500 bg-white scale-105 rotate-1'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Přetáhnout píseň"
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <span className="text-sm text-gray-500 w-6 font-medium">{index + 1}.</span>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{song.title}</p>
                      {song.artist && (
                        <p className="text-sm text-gray-500">{song.artist}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(song.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      aria-label={`Odstranit ${song.title}`}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )
}
