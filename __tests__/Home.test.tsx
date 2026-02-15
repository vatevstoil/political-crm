import { render, screen } from '@testing-library/react'
import Page from '../app/page'
 
describe('Home', () => {
  it('renders the Political CRM heading', () => {
    render(<Page />)
 
    const heading = screen.getByRole('heading', { name: /Political CRM/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the hero section with description', () => {
    render(<Page />)
 
    const description = screen.getByText(/Управление на членове, симпатизанти и кампании на едно място/i)
    expect(description).toBeInTheDocument()
  })

  it('renders stats cards', () => {
    render(<Page />)
 
    expect(screen.getByText(/Общо членове/i)).toBeInTheDocument()
    expect(screen.getByText(/Активни членове/i)).toBeInTheDocument()
    expect(screen.getByText(/Нови този месец/i)).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    render(<Page />)
 
    const directoryLinks = screen.getAllByRole('link', { name: /Виж Картотеката/i })
    const addMemberLinks = screen.getAllByRole('link', { name: /Добави Член/i })
    
    expect(directoryLinks.length).toBeGreaterThanOrEqual(1)
    expect(addMemberLinks.length).toBeGreaterThanOrEqual(1)
    
    // Check at least one link has the correct href
    expect(directoryLinks.some(link => link.getAttribute('href') === '/directory')).toBe(true)
    expect(addMemberLinks.some(link => link.getAttribute('href') === '/directory/new')).toBe(true)
  })
})
