describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the dashboard heading', () => {
    cy.contains('h1', 'Табло').should('be.visible')
  })

  it('should display stats cards', () => {
    cy.contains('Общо').should('be.visible')
    cy.contains('Активни').should('be.visible')
  })

  it('should display the global search input', () => {
    cy.get('input[placeholder*="Търси"]').should('be.visible')
  })

  it('should show task sections', () => {
    cy.contains('Задачи').should('exist')
  })

  it('should render without errors', () => {
    cy.get('body').should('not.contain', 'Internal Server Error')
    cy.get('body').should('not.contain', 'Application error')
  })
})
