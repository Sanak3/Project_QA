import { api } from '@/services/api';

describe('Integração com API', () => {
    const mockToken = 'fake-jwt-token';
    const mockUser = { name: 'Lucas Teste', email: 'lucas@test.com', role: 'adopter' };

    beforeEach(() => {
        // Limpa mocks e armazenamento
        jest.clearAllMocks();
        localStorage.clear();
        
        // Mock do fetch global
        global.fetch = jest.fn();
    });

    it('deve buscar pets com sucesso', async () => {
        const mockPets = [{ id: 1, name: 'Thor' }];
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockPets,
        });

        const pets = await api.getPets();
        
        expect(pets).toEqual(mockPets);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/pets'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    it('deve incluir o token de autorização se estiver logado', async () => {
        localStorage.setItem('adotapet_token', mockToken);
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        await api.getPets();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': `Bearer ${mockToken}`
                })
            })
        );
    });

    it('deve realizar login e retornar o token', async () => {
        const loginData = { email: 'test@test.com', password: 'password' };
        const mockResponse = { access_token: mockToken, user: mockUser };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await api.login(loginData);

        expect(result).toEqual(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/login'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(loginData)
            })
        );
    });

    it('deve lançar erro amigável se a API falhar', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Credenciais inválidas' }),
        });

        await expect(api.login({ email: 'a@a.com', password: '123' }))
            .rejects.toThrow('Credenciais inválidas');
    });

    it('deve lancar erro generico quando a API falha sem corpo JSON', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => { throw new Error('not json'); },
        });

        await expect(api.getPets()).rejects.toThrow('Erro na requisição: 500');
    });

    it('deve buscar pet por id', async () => {
        const mockPet = { id: 42, name: 'Mel' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockPet,
        });

        const pet = await api.getPetById(42);

        expect(pet).toEqual(mockPet);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/pets/42'),
            expect.any(Object),
        );
    });

    it('deve registrar usuario mapeando name -> fullName e fixando role=ADOPTER', async () => {
        const newUser = { id: 'u1', email: 'a@a.com' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newUser,
        });

        await api.register({
            name: 'Joao Tester',
            email: 'a@a.com',
            password: 'Senha@1234',
            phone: '35999999999',
        });

        const [, options] = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(options.body as string);
        expect(body).toEqual({
            fullName: 'Joao Tester',
            email: 'a@a.com',
            password: 'Senha@1234',
            phone: '35999999999',
            role: 'ADOPTER',
        });
    });

    it('deve criar adocao para um pet', async () => {
        const adoption = { id: 'adopt-1', status: 'PENDING' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => adoption,
        });

        const result = await api.createAdoption(42);

        expect(result).toEqual(adoption);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/adoptions'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ petId: 42 }),
            }),
        );
    });

    it('deve fazer upload de foto via multipart e incluir o token', async () => {
        localStorage.setItem('adotapet_token', mockToken);
        const fileLike = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ photoUrl: '/uploads/foto.jpg' }),
        });

        const result = await api.uploadPetPhoto(42, fileLike);

        expect(result).toEqual({ photoUrl: '/uploads/foto.jpg' });

        const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
        expect(url).toContain('/pets/42/photo');
        expect(options.method).toBe('POST');
        expect(options.headers).toEqual(
            expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
        );
        // Em FormData, NAO deve mandar Content-Type (browser monta com boundary)
        expect(options.headers).not.toEqual(
            expect.objectContaining({ 'Content-Type': expect.any(String) }),
        );
    });

    it('deve lancar erro quando uploadPetPhoto falha', async () => {
        const fileLike = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 413,
            json: async () => ({}),
        });

        await expect(api.uploadPetPhoto(42, fileLike)).rejects.toThrow(
            'Erro ao fazer upload da foto',
        );
    });
});
