import { render, screen } from '@testing-library/react'
import Page from '../app/page'
import * as dashboardActions from '../app/actions/dashboard'

jest.mock('../app/actions/dashboard', () => ({
  getDashboardStats: jest.fn(),
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
    
    const searchInput = screen.getByPlaceholderText(/Търси по име, телефон или карта/i)
    expect(searchInput).toBeInTheDocument()
  })
})
