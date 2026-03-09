describe('Groups Page', () => {
  beforeEach(() => {
    cy.visit('/groups')
  })

  it('should display groups page header', () => {
    cy.contains('Групи').should('be.visible')
  })

  it('should show create group button', () => {
    cy.contains('Нова Група').should('be.visible')
  })

  it('should open create group modal', () => {
    cy.contains('Нова Група').click()
    cy.get('input[placeholder*="Въведете"]').should('be.visible')
  })

  it('should render without errors', () => {
    cy.get('body').should('not.contain', 'Internal Server Error')
    cy.get('body').should('not.contain', 'Application error')
  })
})
