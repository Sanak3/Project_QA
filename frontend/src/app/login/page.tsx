'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) {
      setErrors({
        email: !email ? "O e-mail é obrigatório" : "",
        password: password.length < 8 ? "A senha deve ter no mínimo 8 caracteres" : ""
      });
      return;
    }
    try {
      const data = await api.login({ email, password });
      await login(data.access_token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({ general: "Credenciais inválidas" });
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <span>{errors.email}</span>}
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errors.password && <span>{errors.password}</span>}
        {errors.general && <p>{errors.general}</p>}
        <button type="submit">Entrar</button>
      </form>
  );
}