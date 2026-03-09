import { Suspense } from 'react'
import { getDashboardStats } from './actions/dashboard'
import { getUpcomingReminders } from './actions/reminders'
import GlobalSearch from '@/components/dashboard/GlobalSearch'
import StatsCards from '@/components/dashboard/StatsCards'
import UpcomingBirthdays from '@/components/dashboard/UpcomingBirthdays'
import TaskStatsCards from '@/components/dashboard/TaskStatsCards'
import { OverdueTasks, UpcomingTasks } from '@/components/dashboard/TaskLists'
import UpcomingEvents from '@/components/dashboard/UpcomingEvents'
import UpcomingReminders from '@/components/dashboard/UpcomingReminders'
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed'
import QuickActions from '@/components/dashboard/QuickActions'
import { MapSection, ChartsSection } from '@/components/dashboard/DashboardClientSection'

export default async function DashboardPage() {
  const [stats, upcomingReminders] = await Promise.all([
    getDashboardStats(),
    getUpcomingReminders(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.01em] mb-6 text-slate-800 dark:text-slate-100">Табло</h1>
        <div className="max-w-md">
          <GlobalSearch />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <QuickActions />
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsCards
          totalMembers={stats.totalMembers}
          newThisMonth={stats.newThisMonth}
          activeMembers={stats.activeMembers}
        />
      </div>

      {/* Map Section — client component (uses Leaflet which requires browser) */}
      <Suspense fallback={<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-80 animate-pulse"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" /><div className="h-full bg-slate-100 dark:bg-slate-700/50 rounded" /></div>}>
        <MapSection geoData={stats.geoData} citiesWithoutCoords={stats.citiesWithoutCoords} />
      </Suspense>

      {/* Task Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TaskStatsCards
          total={stats.taskStats.total}
          completed={stats.taskStats.completed}
          pending={stats.taskStats.pending}
          overdue={stats.taskStats.overdue}
          byPriority={stats.taskStats.byPriority}
        />
      </div>

      {/* Task Lists Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OverdueTasks tasks={stats.overdueTasks} />
          <UpcomingTasks tasks={stats.upcomingTasks} />
        </div>
      </div>

      {/* Charts Section — client component (uses Chart.js which requires browser) */}
      <Suspense fallback={<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 h-80 animate-pulse"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" /><div className="h-full bg-slate-100 dark:bg-slate-700/50 rounded" /></div>}>
        <ChartsSection byCity={stats.byCity} byAgeGroup={stats.byAgeGroup} statusDistribution={stats.statusDistribution} membershipGrowth={stats.membershipGrowth} />
      </Suspense>

      {/* Recent Activities + Upcoming Events + Reminders */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivityFeed activities={stats.recentActivities} />
          <UpcomingEvents events={stats.upcomingEvents} />
          <UpcomingReminders reminders={upcomingReminders} />
        </div>
      </div>

      {/* Upcoming Birthdays */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <UpcomingBirthdays birthdays={stats.upcomingBirthdays} />
      </div>
    </div>
  )
}
