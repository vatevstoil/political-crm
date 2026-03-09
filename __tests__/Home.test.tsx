/// <reference types="jest" />
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'
import * as dashboardActions from '../app/actions/dashboard'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  }
}))

jest.mock('react-chartjs-2', () => ({
  Bar: () => null,
  Doughnut: () => null,
  Line: () => null,
  Pie: () => null,
}))

jest.mock('../app/actions/dashboard', () => ({
  getDashboardStats: jest.fn(),
}))

jest.mock('../app/actions/reminders', () => ({
  getUpcomingReminders: jest.fn().mockResolvedValue([]),
}))

const mockStats = {
  totalMembers: 100,
  newThisMonth: 10,
  activeMembers: 80,
  byCity: [
    { city: 'София', _count: { id: 50 } },
    { city: 'Пловдив', _count: { id: 30 } },
  ],
  byAgeGroup: [
    { group: '18-30', count: 20 },
    { group: '31-50', count: 50 },
    { group: '50+', count: 30 },
  ],
  upcomingBirthdays: [],
  citiesWithoutCoords: [],
  overdueTasks: [],
  pendingTasks: [],
  upcomingTasks: [],
  upcomingEvents: [],
  taskStats: { 
    total: 0, 
    completed: 0, 
    pending: 0, 
    overdue: 0,
    byPriority: { low: 0, medium: 0, high: 0 }
  },
  geoData: {
    type: 'FeatureCollection' as const,
    features: [],
  },
  recentActivities: [],
  statusDistribution: [
    { status: 'Активен', count: 80 },
    { status: 'Неактивен', count: 10 },
    { status: 'Изключен', count: 5 },
    { status: 'Потенциален', count: 3 },
    { status: 'Перспективен', count: 2 },
  ],
  membershipGrowth: [],
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(dashboardActions.getDashboardStats as jest.Mock).mockResolvedValue(mockStats)
  })

  it('renders the dashboard heading', async () => {
    render(await Page())
    
    const heading = screen.getByRole('heading', { name: /Табло/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders stats cards with data', async () => {
    render(await Page())
    
    expect(screen.getByText(/Общо членове/i)).toBeInTheDocument()
    expect(screen.getByText(/Активни членове/i)).toBeInTheDocument()
    expect(screen.getByText(/Нови този месец/i)).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    render(await Page())
    
    const searchInput = screen.getByPlaceholderText(/Търси по всяко поле/i)
    expect(searchInput).toBeInTheDocument()
  })
})
