"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SignOut, Spinner, FloppyDisk, ShieldCheck, Sun, Moon } from '@phosphor-icons/react';

interface ClientRow {
  id: string;
  email: string;
  business_name: string | null;
  role: string;
  access_until: string | null;
  created_at: string;
  editingDate: string;
  saving: boolean;
}

function accessStatus(access_until: string | null): { label: string; color: string } {
  if (!access_until) return { label: 'Pendiente', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' };
  const d = new Date(access_until);
  if (d > new Date()) return { label: 'Activo', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400' };
  return { label: 'Expirado', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400' };
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.slice(0, 10);
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const active = saved || sys;
    setTheme(active);
    if (active === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: me } = await supabase
        .from('clients')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (me?.role !== 'admin') { router.push('/dashboard'); return; }

      const { data: rows } = await supabase
        .from('clients')
        .select('id, email, business_name, role, access_until, created_at')
        .order('created_at', { ascending: false });

      setClients(
        (rows ?? []).map((r) => ({
          ...r,
          editingDate: toDateInputValue(r.access_until),
          saving: false,
        }))
      );
      setLoading(false);
    };
    init();
  }, [router]);

  const updateDate = (id: string, value: string) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, editingDate: value } : c));
  };

  const saveAccess = async (id: string) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, saving: true } : c));
    const client = clients.find((c) => c.id === id);
    const access_until = client?.editingDate ? new Date(client.editingDate + 'T23:59:59').toISOString() : null;

    const { error } = await supabase
      .from('clients')
      .update({ access_until })
      .eq('id', id);

    setClients((prev) => prev.map((c) =>
      c.id === id ? { ...c, access_until, saving: false } : c
    ));

    if (error) console.error('Error saving access:', error);
  };

  const toggleAdmin = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    await supabase.from('clients').update({ role: newRole }).eq('id', id);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, role: newRole } : c));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-zinc-900 dark:text-white font-sans">Panel Administrador</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Lacre Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
          >
            <SignOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white font-sans tracking-tight">Clientes</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{clients.length} usuarios registrados</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Nombre / Email</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Registro</th>
                <th className="text-left px-5 py-3 font-semibold">Estado</th>
                <th className="text-left px-5 py-3 font-semibold">Acceso hasta</th>
                <th className="px-5 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {clients.map((client) => {
                const status = accessStatus(client.access_until);
                return (
                  <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">
                        {client.business_name || '(sin nombre)'}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]">{client.email}</p>
                      {client.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                          <ShieldCheck size={12} /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-zinc-500 dark:text-zinc-400 text-xs">
                      {new Date(client.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="date"
                        value={client.editingDate}
                        onChange={(e) => updateDate(client.id, e.target.value)}
                        className="h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0 text-zinc-900 dark:text-white text-sm px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition w-[150px]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => saveAccess(client.id)}
                          disabled={client.saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                        >
                          {client.saving ? <Spinner size={12} className="animate-spin" /> : <FloppyDisk size={14} />}
                          Guardar
                        </button>
                        <button
                          onClick={() => toggleAdmin(client.id, client.role)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer"
                          title={client.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                        >
                          {client.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
