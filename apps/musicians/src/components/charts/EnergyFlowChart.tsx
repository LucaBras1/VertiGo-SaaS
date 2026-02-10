'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Activity } from 'lucide-react'
import {
  calculateEnergyFlow,
  calculateAverageEnergy,
  analyzeEnergyPattern,
  getEnergyLabel,
  getEnergyColor,
  type EnergyDataPoint,
} from '@/lib/utils/energy'
import { Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface Song {
  id: string
  title: string
  artist?: string
  duration: number
  bpm?: number
  mood?: string
  order: number
}

interface EnergyFlowChartProps {
  songs: Song[]
  title?: string
  showAnalysis?: boolean
  height?: number
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: EnergyDataPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const color = getEnergyColor(data.energy)

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{data.title}</p>
      {data.artist && <p className="text-sm text-gray-600">{data.artist}</p>}
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Energie:</span>
          <span className="font-medium" style={{ color }}>
            {data.energy}/10 ({getEnergyLabel(data.energy)})
          </span>
        </div>
        {data.bpm && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">BPM:</span>
            <span className="font-medium">{data.bpm}</span>
          </div>
        )}
        {data.mood && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Nálada:</span>
            <span className="font-medium capitalize">{data.mood}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Délka:</span>
          <span className="font-medium">{formatDuration(data.duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default function EnergyFlowChart({
  songs,
  title = 'Průběh energie',
  showAnalysis = true,
  height = 250,
}: EnergyFlowChartProps) {
  const energyData = useMemo(() => calculateEnergyFlow(songs), [songs])
  const averageEnergy = useMemo(() => calculateAverageEnergy(songs), [songs])
  const pattern = useMemo(() => analyzeEnergyPattern(energyData), [energyData])

  if (songs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Žádné písně pro zobrazení</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            {title}
          </CardTitle>
          <span className="text-sm text-gray-500">
            Průměr: <span className="font-medium">{averageEnergy}/10</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={energyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="order"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={averageEnergy}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{
                  value: 'Průměr',
                  position: 'right',
                  fill: '#9ca3af',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{
                  fill: '#8B5CF6',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  fill: '#7c3aed',
                  strokeWidth: 2,
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {showAnalysis && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Analýza průběhu: </span>
              <span className="text-gray-600">{pattern.description}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
