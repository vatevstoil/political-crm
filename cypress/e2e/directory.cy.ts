describe('Directory Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/directory')
  })

  it('should display the directory page header', () => {
    cy.contains('h1', 'Картотека').should('be.visible')
    cy.contains('Нов Човек').should('be.visible')
  })

  it('should display seeded people', () => {
    // Check for Seeded Person 1
    cy.contains('Иван Иванов').should('be.visible')
    cy.contains('IT Специалист').should('be.visible')
    cy.contains('Координатор').should('be.visible')

    // Check for Seeded Person 2
    cy.contains('Мария Петрова').should('be.visible')
    cy.contains('Лекар').should('be.visible')
  })

  it('should filter by search query', () => {
    cy.get('input[placeholder*="Търсене"]').type('Иван')
    // Wait for debounce
    cy.wait(1000)
    
    cy.contains('Иван Иванов').should('be.visible')
    cy.contains('Мария Петрова').should('not.exist')
  })

  it('should filter by city', () => {
    cy.contains('Всички Градове').parent().select('Пловдив')
    // Wait for debounce/navigation
    cy.wait(1000)

    cy.contains('Мария Петрова').should('be.visible')
    cy.contains('Иван Иванов').should('not.exist')
  })
})
