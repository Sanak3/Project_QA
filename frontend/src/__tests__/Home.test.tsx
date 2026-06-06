import { render, screen } from '@testing-library/react'

describe('Configuração do Jest', () => {
    it('deve renderizar um texto simples no ecrã', () => {
        // Renderizamos um parágrafo virtualmente
        render(<p>O Jest está a funcionar!</p>)

        // Procuramos se o texto existe no nosso "ecrã" virtual
        const texto = screen.getByText('O Jest está a funcionar!')

        // Afirmamos que tem de estar no documento
        expect(texto).toBeInTheDocument()
    })
})