const getHeaders = (withAuth = true) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = localStorage.getItem('adotapet_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    getPets: async () => {
        const response = await fetch('/pets', { method: 'GET', headers: getHeaders(true) });
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
        return response.json();
    },
    getPetById: async (id: number) => {
        const response = await fetch(`/pets/${id}`, { method: 'GET', headers: getHeaders(false) });
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
        return response.json();
    },
    login: async (credentials: any) => {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Credenciais inválidas');
        return data;
    },
    register: async (userData: any) => {
        const response = await fetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: 'ADOPTER',
            }),
        });
        return response.json();
    },
    createAdoption: async (petId: number) => {
        const response = await fetch('/adoptions', {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ petId }),
        });
        return response.json();
    },
    uploadPetPhoto: async (petId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('adotapet_token');
        const response = await fetch(`/pets/${petId}/photo`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });
        if (!response.ok) throw new Error('Erro ao fazer upload da foto');
        return response.json();
    }
};