'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', city: '', state: '', terms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (form.name.length < 3) newErrors.name = "O nome deve ter no mínimo 3 caracteres";
    if (!form.email.includes('@')) newErrors.email = "Digite um e-mail válido";
    if (form.password.length < 8) newErrors.password = "A senha deve ter no mínimo 8 caracteres";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
    if (form.phone.length < 10) newErrors.phone = "Telefone inválido";
    if (!form.city) newErrors.city = "A cidade é obrigatória";
    if (!form.state) newErrors.state = "Selecione um estado";
    if (!form.terms) newErrors.terms = "Você precisa aceitar os termos de responsabilidade";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.register(form);
      alert("Conta criada com sucesso! Você já pode fazer login.");
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nome completo</label>
        <input id="name" name="name" onChange={(e) => setForm({...form, name: e.target.value})} />
        {errors.name && <span>{errors.name}</span>}

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" onChange={(e) => setForm({...form, email: e.target.value})} />
        {errors.email && <span>{errors.email}</span>}

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" onChange={(e) => setForm({...form, password: e.target.value})} />
        {errors.password && <span>{errors.password}</span>}

        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input id="confirmPassword" name="confirmPassword" type="password" onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
        {errors.confirmPassword && <span>{errors.confirmPassword}</span>}

        <label htmlFor="phone">Telefone</label>
        <input id="phone" name="phone" onChange={(e) => setForm({...form, phone: e.target.value})} />
        {errors.phone && <span>{errors.phone}</span>}

        <label htmlFor="city">Cidade</label>
        <input id="city" name="city" onChange={(e) => setForm({...form, city: e.target.value})} />
        {errors.city && <span>{errors.city}</span>}

        <label htmlFor="state">Estado</label>
        <select id="state" name="state" onChange={(e) => setForm({...form, state: e.target.value})}>
          <option value="">Selecione</option>
          <option value="MG">MG</option>
        </select>
        {errors.state && <span>{errors.state}</span>}

        <input type="checkbox" id="terms" name="terms" onChange={(e) => setForm({...form, terms: e.target.checked})} />
        <label htmlFor="terms">Aceito os termos</label>
        {errors.terms && <span>{errors.terms}</span>}

        <button type="submit">Criar conta</button>
      </form>
  );
}