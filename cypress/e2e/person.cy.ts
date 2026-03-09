// Person profile tests - uses seed person ID 1 (Иван Иванов)
describe('Person Profile Page', () => {
  beforeEach(() => {
    cy.visit('/directory/1')
  })

  it('should display the person profile without errors', () => {
    cy.get('body').should('not.contain', 'Internal Server Error')
    cy.get('body').should('not.contain', 'Application error')
  })

  it('should show back button on profile page', () => {
    cy.contains('Назад').should('be.visible')
    cy.contains('Назад').click()
    cy.url().should('include', '/directory')
  })

  it('should show contacts section', () => {
    cy.contains('Контакти').should('be.visible')
  })

  it('should show chronology section', () => {
    cy.contains('Хронология').should('be.visible')
  })

  it('should show edit link', () => {
    cy.contains('Редактирай').should('be.visible')
  })
})

describe('New Person Form', () => {
  it('should load the new person form', () => {
    cy.visit('/directory/new')
    cy.contains('Добавяне на Нов Човек').should('be.visible')
    cy.get('input[name="fullName"]').should('be.visible')
  })

  it('should show validation error for empty fullName', () => {
    cy.visit('/directory/new')
    cy.get('button[type="submit"]').click()
    cy.contains('Името').should('be.visible')
  })

  it('should render without errors', () => {
    cy.visit('/directory/new')
    cy.get('body').should('not.contain', 'Internal Server Error')
    cy.get('body').should('not.contain', 'Application error')
  })
})
