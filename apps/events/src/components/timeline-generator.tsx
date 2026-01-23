'use client'

import { useState } from 'react'
import { Sparkles, Calendar, Users, Clock, Download, CheckCircle } from 'lucide-react'
import type { TimelineInput, Timeline } from '@/lib/ai/timeline-optimizer'

export function TimelineGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [timeline, setTimeline] = useState<Timeline | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Mock data for demo
    const input: TimelineInput = {
      event: {
        name: 'Corporate Gala 2024',
        type: 'gala',
        date: '2024-02-15',
        startTime: '18:00',
        endTime: '23:00',
        guestCount: 150,
      },
      venue: {
        name: 'Grand Ballroom',
        type: 'indoor',
        capacity: 200,
        setupAccessTime: '15:00',
        curfew: '00:00',
      },
      performers: [
        {
          id: '1',
          name: 'Fire Phoenix',
          type: 'fire',
          setupTime: 30,
          performanceTime: 20,
          breakdownTime: 20,
          requirements: {
            safetyDistance: 5,
            power: true,
          },
        },
        {
          id: '2',
          name: 'Alex Wonder',
          type: 'magic',
          setupTime: 15,
          performanceTime: 30,
          breakdownTime: 10,
        },
        {
          id: '3',
          name: 'Jazz Ensemble',
          type: 'music',
          setupTime: 45,
          performanceTime: 60,
          breakdownTime: 30,
        },
      ],
      milestones: [
        { name: 'Welcome Speech', time: '18:30', duration: 15, isFlexible: false },
        { name: 'Dinner Service', time: '19:00', duration: 60, isFlexible: false },
      ],
    }

    // Simulate API call
    setTimeout(() => {
      // Mock generated timeline
      const mockTimeline: Timeline = {
        schedule: [
          {
            time: '15:00',
            endTime: '18:00',
            type: 'setup',
            title: 'Venue Setup & Sound Check',
            guestFacing: false,
            staffNotes: 'All vendors arrive and set up',
          },
          {
            time: '18:00',
            endTime: '18:30',
            type: 'milestone',
            title: 'Guest Arrival',
            guestFacing: true,
          },
          {
            time: '18:30',
            endTime: '18:45',
            type: 'milestone',
            title: 'Welcome Speech',
            guestFacing: true,
          },
          {
            time: '19:00',
            endTime: '20:00',
            type: 'milestone',
            title: 'Dinner Service',
            guestFacing: true,
          },
          {
            time: '20:00',
            endTime: '21:00',
            type: 'performance',
            title: 'Jazz Ensemble',
            performerId: '3',
            guestFacing: true,
          },
          {
            time: '21:15',
            endTime: '21:45',
            type: 'performance',
            title: 'Alex Wonder - Magic Show',
            performerId: '2',
            guestFacing: true,
          },
          {
            time: '22:00',
            endTime: '22:20',
            type: 'performance',
            title: 'Fire Phoenix - Grand Finale',
            performerId: '1',
            guestFacing: true,
            staffNotes: 'Ensure 5m safety distance',
          },
        ],
        performerCallTimes: [
          {
            performerId: '3',
            performerName: 'Jazz Ensemble',
            callTime: '14:30',
            setupStart: '15:00',
            performanceStart: '20:00',
            performanceEnd: '21:00',
            loadOut: '21:30',
          },
          {
            performerId: '2',
            performerName: 'Alex Wonder',
            callTime: '20:00',
            setupStart: '21:00',
            performanceStart: '21:15',
            performanceEnd: '21:45',
            loadOut: '21:55',
          },
          {
            performerId: '1',
            performerName: 'Fire Phoenix',
            callTime: '21:00',
            setupStart: '21:30',
            performanceStart: '22:00',
            performanceEnd: '22:20',
            loadOut: '22:40',
            notes: 'Safety briefing at 21:45',
          },
        ],
        guestExperience: {
          peakMoments: [
            { time: '21:15', description: 'Magic show engagement' },
            { time: '22:00', description: 'Fire performance grand finale' },
          ],
          flowDescription: 'Welcome → Dinner → Entertainment → Spectacular finale',
          energyArc: 'Welcoming → Relaxed dining → Building excitement → Peak finale',
        },
        contingencyPlans: [
          {
            scenario: 'Performer no-show',
            trigger: 'Not present 30 min before call',
            plan: 'Extend jazz ensemble performance, add extra networking time',
            affectedItems: ['Schedule', 'Guest experience'],
          },
          {
            scenario: 'Fire safety concern',
            trigger: 'Indoor smoke detection issue',
            plan: 'Move to LED-only performance variant',
            affectedItems: ['Fire Phoenix performance'],
          },
        ],
        summary: {
          totalRuntime: 300,
          numberOfPerformances: 3,
          setupTimeRequired: 180,
          peakStaffNeeded: 4,
          potentialIssues: ['Fire act requires venue safety approval'],
        },
      }

      setTimeline(mockTimeline)
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Generator Card */}
      <div className="card">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">AI Timeline Optimizer</h2>
            <p className="text-gray-600">
              Generate an optimized event schedule considering all performers, setup times, and guest experience flow
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Generating Timeline...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Optimized Timeline
            </>
          )}
        </button>
      </div>

      {/* Timeline Display */}
      {timeline && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Total Runtime"
              value={`${Math.floor(timeline.summary.totalRuntime / 60)}h ${timeline.summary.totalRuntime % 60}m`}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Performances"
              value={timeline.summary.numberOfPerformances.toString()}
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="Setup Time"
              value={`${Math.floor(timeline.summary.setupTimeRequired / 60)}h`}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="Peak Staff"
              value={timeline.summary.peakStaffNeeded.toString()}
            />
          </div>

          {/* Schedule */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Event Schedule</h3>
              <button className="btn-secondary inline-flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>

            <div className="space-y-4">
              {timeline.schedule.map((item, idx) => (
                <ScheduleItem key={idx} item={item} />
              ))}
            </div>
          </div>

          {/* Performer Call Times */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Performer Call Times</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Performer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Call Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Setup</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Load Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.performerCallTimes.map((call, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{call.performerName}</td>
                      <td className="py-3 px-4">{call.callTime}</td>
                      <td className="py-3 px-4">{call.setupStart}</td>
                      <td className="py-3 px-4">
                        {call.performanceStart} - {call.performanceEnd}
                      </td>
                      <td className="py-3 px-4">{call.loadOut}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{call.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guest Experience */}
          <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
            <h3 className="text-xl font-semibold mb-4">Guest Experience Flow</h3>
            <p className="text-gray-700 mb-4">{timeline.guestExperience.flowDescription}</p>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold">Energy Arc:</span> {timeline.guestExperience.energyArc}
            </p>

            <div className="space-y-3">
              <p className="font-semibold text-gray-900">Peak Moments:</p>
              {timeline.guestExperience.peakMoments.map((moment, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent-500 rounded-full mt-2" />
                  <div>
                    <span className="font-medium">{moment.time}:</span>{' '}
                    <span className="text-gray-700">{moment.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contingency Plans */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Contingency Plans</h3>
            <div className="space-y-4">
              {timeline.contingencyPlans.map((plan, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{plan.scenario}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Trigger:</span> {plan.trigger}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">{plan.plan}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.affectedItems.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleItem({ item }: { item: Timeline['schedule'][0] }) {
  const typeColors = {
    setup: 'bg-gray-100 text-gray-700',
    performance: 'bg-primary-100 text-primary-700',
    milestone: 'bg-accent-100 text-accent-700',
    activity: 'bg-blue-100 text-blue-700',
    break: 'bg-green-100 text-green-700',
    transition: 'bg-yellow-100 text-yellow-700',
    backup: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 w-24 text-center">
        <p className="font-semibold text-gray-900">{item.time}</p>
        <p className="text-xs text-gray-500">{item.endTime}</p>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{item.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
            {item.type}
          </span>
        </div>

        {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}

        {item.staffNotes && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">Staff Note:</span> {item.staffNotes}
          </p>
        )}

        {item.location && (
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium">Location:</span> {item.location}
          </p>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-primary-600">{icon}</div>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
