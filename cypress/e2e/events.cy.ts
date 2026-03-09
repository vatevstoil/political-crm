describe('Events Page', () => {
  beforeEach(() => {
    cy.visit('/events')
  })

  it('should display events page heading', () => {
    cy.contains('Календар').should('be.visible')
  })

  it('should show create event button', () => {
    cy.contains('Ново Събитие').should('be.visible')
  })

  it('should render without errors', () => {
    cy.get('body').should('not.contain', 'Internal Server Error')
    cy.get('body').should('not.contain', 'Application error')
  })
})
