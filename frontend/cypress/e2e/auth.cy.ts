describe('Fluxo de Autenticação e Proteção de Rotas', () => {
  beforeEach(() => {
    // Limpa estado antes de cada teste
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mocks da API
    cy.intercept('POST', '/api-backend/auth/login', {
      statusCode: 200,
      body: { 
        access_token: 'fake-jwt-token',
        user: { name: 'Lucas Teste', email: 'lucas@test.com', role: 'adopter' }
      },
    }).as('loginRequest');

    cy.intercept('POST', '/api-backend/users', {
      statusCode: 201,
      body: { id: 'user-123', email: 'novo@usuario.com' },
    }).as('registerRequest');
  });

  it('deve redirecionar para login ao tentar acessar dashboard sem estar logado', () => {
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  it('deve realizar login, salvar cookies e redirecionar para o dashboard', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('teste@cypress.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Agora redireciona para /dashboard
    cy.url().should('include', '/dashboard');
    
    // Verifica persistência tripla: Contexto (UI), LocalStorage e Cookies
    // Regex para aceitar Bom dia, Boa tarde ou Boa noite
    cy.contains(/Bom dia|Boa tarde|Boa noite, Lucas!/).should('be.visible');
    
    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.eq('fake-jwt-token');
      expect(win.localStorage.getItem('adotapet_user')).to.contain('Lucas Teste');
    });

    cy.getCookie('adotapet_token').should('have.property', 'value', 'fake-jwt-token');
  });

  it('deve permitir acesso ao dashboard se já possuir cookie/token', () => {
    // Simula usuário já logado
    cy.setCookie('adotapet_token', 'fake-jwt-token');
    cy.window().then((win) => {
      win.localStorage.setItem('adotapet_token', 'fake-jwt-token');
      win.localStorage.setItem('adotapet_user', JSON.stringify({ name: 'Lucas Teste', role: 'adopter' }));
    });

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains(/Bom dia|Boa tarde|Boa noite, Lucas!/).should('be.visible');
  });

  it('deve realizar logout completo e remover acessos', () => {
    // Login prévio
    cy.setCookie('adotapet_token', 'fake-jwt-token');
    cy.window().then((win) => {
      win.localStorage.setItem('adotapet_token', 'fake-jwt-token');
      win.localStorage.setItem('adotapet_user', JSON.stringify({ name: 'Lucas Teste', role: 'adopter' }));
    });
    cy.visit('/dashboard');

    // Abre o menu de conta usando o aria-label (mais preciso que o texto 'Lucas' que aparece na saudação)
    cy.get('button[aria-label="Abrir menu do usuário"]').click();
    
    // Garante que o menu abriu e o botão de sair está visível
    // Usamos regex i (case-insensitive) para ignorar o emoji e variações de maiúsculo/minúsculo
    cy.contains(/sair da conta/i).should('be.visible').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.getCookie('adotapet_token').should('not.exist');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('adotapet_token')).to.be.null;
    });
  });
});

