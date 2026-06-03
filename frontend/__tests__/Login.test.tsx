import "@testing-library/jest-dom"; 
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../src/app/login/page";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

// Mock do next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock do AuthContext
jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(),
}));

// Mock da API
jest.mock("@/services/api", () => ({
    api: {
        login: jest.fn(),
    },
}));

// Mock do next/link
jest.mock("next/link", () => {
    const MockedLink = ({ children, href }: { children: React.ReactNode; href?: string }) => {
        return <a href={href || "#"}>{children}</a>;
    };
    MockedLink.displayName = "MockedLink";
    return MockedLink;
});

describe("Página de Login", () => {
    const mockPush = jest.fn();
    const mockLogin = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (useAuth as jest.Mock).mockReturnValue({
            login: mockLogin,
        });
        jest.clearAllMocks();
    });

    it("deve mostrar mensagens de erro ao tentar enviar o formulário vazio", async () => {
        render(<Login />);

        const botaoEntrar = screen.getByRole("button", { name: /entrar/i });
        await userEvent.click(botaoEntrar);

        await waitFor(() => {
            expect(screen.getByText("O e-mail é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("A senha deve ter no mínimo 8 caracteres")).toBeInTheDocument();
        });
    });

    it("deve realizar login com sucesso e redirecionar", async () => {
        const mockUser = { name: "Test User", email: "test@example.com", role: "adopter" };
        (api.login as jest.Mock).mockResolvedValue({ 
            access_token: "fake-token",
            user: mockUser
        });
        
        render(<Login />);

        const inputEmail = screen.getByLabelText(/e-mail/i);
        const inputSenha = screen.getByLabelText(/senha/i);
        const botaoEntrar = screen.getByRole("button", { name: /entrar/i });

        await userEvent.type(inputEmail, "test@example.com");
        await userEvent.type(inputSenha, "password123");
        await userEvent.click(botaoEntrar);

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
            expect(mockLogin).toHaveBeenCalledWith("fake-token", mockUser);
            expect(mockPush).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("deve exibir mensagem de erro quando o login falha", async () => {
        (api.login as jest.Mock).mockRejectedValue(new Error("Credenciais inválidas"));
        
        render(<Login />);

        await userEvent.type(screen.getByLabelText(/e-mail/i), "wrong@example.com");
        await userEvent.type(screen.getByLabelText(/senha/i), "wrongpass");
        await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
        });
    });
});