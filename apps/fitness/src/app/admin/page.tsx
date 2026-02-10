import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { TodayScheduleWithModal } from '@/components/dashboard/TodayScheduleWithModal'
import { AtRiskClients } from '@/components/dashboard/AtRiskClients'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { QuickActions } from '@/components/dashboard/QuickActions'

export const metadata = {
  title: 'Dashboard | FitAdmin',
}

export default function DashboardPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
              <p className="text-neutral-600 dark:text-neutral-400">Vítejte zpět! Zde je váš přehled na dnešek.</p>
            </div>
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <DashboardStats />

          {/* Two column layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Today's schedule */}
            <div className="lg:col-span-2 space-y-8">
              <TodayScheduleWithModal />
              <RevenueChart />
            </div>

            {/* Right column - At-risk clients */}
            <div>
              <AtRiskClients />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
