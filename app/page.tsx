import { getDashboardStats } from './actions/dashboard'
import GlobalSearch from '@/components/dashboard/GlobalSearch'
import StatsCards from '@/components/dashboard/StatsCards'
import PeopleByCityChart from '@/components/dashboard/PeopleByCityChart'
import AgeStructureChart from '@/components/dashboard/AgeStructureChart'
import UpcomingBirthdays from '@/components/dashboard/UpcomingBirthdays'
import TaskStatsCards from '@/components/dashboard/TaskStatsCards'
import { OverdueTasks, UpcomingTasks } from '@/components/dashboard/TaskLists'
import MapVisualization from '@/components/dashboard/MapVisualization'
import UpcomingEvents from '@/components/dashboard/UpcomingEvents'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-purple-50">
      {/* Header with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6">Табло</h1>
          <div className="max-w-md">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <StatsCards
          totalMembers={stats.totalMembers}
          newThisMonth={stats.newThisMonth}
          activeMembers={stats.activeMembers}
        />
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MapVisualization geoData={stats.geoData} />
        
        {/* Cities without coordinates */}
        {stats.citiesWithoutCoords.length > 0 && (
          <div className="mt-4 glass-card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Допълнителни градове (без координати на картата):
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.citiesWithoutCoords.map((city) => (
                <a
                  key={city.city}
                  href={`/directory?city=${encodeURIComponent(city.city)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {city.city}
                  <span className="ml-1 text-slate-500">({city._count.id})</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

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

        {/* Charts Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* People by City Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <PeopleByCityChart data={stats.byCity} />
            </div>

            {/* Age Structure Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <AgeStructureChart data={stats.byAgeGroup} />
            </div>
          </div>

          {/* Upcoming Birthdays and Events */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingBirthdays birthdays={stats.upcomingBirthdays} />
            <UpcomingEvents events={stats.upcomingEvents} />
          </div>
        </div>
    </div>
  )
}
