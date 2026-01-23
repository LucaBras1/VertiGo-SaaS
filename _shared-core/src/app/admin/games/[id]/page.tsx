/**
 * Edit Game Page
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GameForm } from '@/components/admin/GameForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getGame(id: string) {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
    })
    return game
  } catch (error) {
    console.error('Error fetching game:', error)
    return null
  }
}

export default async function EditGamePage({ params }: { params: { id: string } }) {
  const game = await getGame(params.id)

  if (!game) {
    notFound()
  }

  const gameData = {
    ...game,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={game.title} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit hru</h1>
        <p className="mt-2 text-sm text-gray-600">{game.title}</p>
      </div>

      <GameForm game={gameData} />
    </div>
  )
}
