"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Spinner, ShieldPlus, Sun, Moon } from '@phosphor-icons/react';

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('clients')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'admin') {
          router.push('/admin');
        } else {
          const accessUntil = profile?.access_until ? new Date(profile.access_until) : null;
          router.push(accessUntil && accessUntil > new Date() ? '/dashboard' : '/sin-acceso?motivo=' + (accessUntil ? 'expirado' : 'pendiente'));
        }
      }
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation is required (session will be null on signup if required)
      if (data.user && !data.session && data.user.identities && data.user.identities.length > 0) {
        setSuccessMsg('Registro exitoso. Por favor, revisa tu correo electrónico para confirmar tu cuenta y poder iniciar sesión.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Registro exitoso. Tu cuenta está pendiente de activación.');
      // Sign in automatically so the session exists for future visits
      await supabase.auth.signInWithPassword({ email, password });

      setTimeout(() => {
        router.push('/sin-acceso?motivo=pendiente');
      }, 1200);
    } catch (err) {
      setSuccessMsg(''); // Clear success message if error occurs
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative font-sans">
      
      {/* Floating Theme Toggle (top right of screen) */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition duration-200 cursor-pointer shadow-sm z-30"
        aria-label="Alternar tema"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* LEFT SIDE: LUXURY BRAND SHOWCASE (Full screen height, hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 min-h-screen relative flex-col justify-between p-12 bg-gradient-to-br from-[#1a0826] via-[#0e0417] to-[#06020a] text-white overflow-hidden select-none">
        {/* Decorative background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] rounded-full bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Branding */}
        <div className="relative flex items-center gap-2.5 z-10">
          <img src="/logo-white.png" alt="Lacre Logo" className="h-8 w-auto" />
          <span className="font-bold tracking-wider uppercase text-xs text-zinc-400 font-sans">Lacre SaaS Platform</span>
        </div>

        {/* Centerpiece: SVG Wax Seal */}
        <div className="relative flex flex-col items-center text-center my-auto z-10 w-full">
          <div className="relative mb-6">
            <svg viewBox="0 0 400 300" className="w-full max-w-[280px] h-auto drop-shadow-2xl">
              <rect x="20" y="20" width="360" height="260" rx="16" fill="#180e29" stroke="#ffffff10" strokeWidth="2" />
              <circle cx="200" cy="150" r="80" fill="#7c3aed" opacity="0.15" filter="blur(30px)" />
              <g transform="translate(80, 55)">
                <rect x="0" y="0" width="240" height="150" rx="8" fill="#ffffff" />
                <rect x="6" y="6" width="228" height="138" rx="6" fill="none" stroke="#d4b26f" strokeWidth="1" opacity="0.6" />
                <text x="120" y="36" fontFamily="Georgia, serif" fontSize="16" fill="#4a2a6b" textAnchor="middle" fontStyle="italic">Mi Quinceañera</text>
                <line x1="90" y1="48" x2="150" y2="48" stroke="#d4b26f" strokeWidth="1" />
                <rect x="40" y="65" width="160" height="4" rx="2" fill="#e4e4e7" />
                <rect x="60" y="77" width="120" height="4" rx="2" fill="#e4e4e7" />
                <rect x="50" y="89" width="140" height="4" rx="2" fill="#e4e4e7" />
                <g transform="translate(120, 115)">
                  <circle cx="0" cy="0" r="16" fill="#a10015" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.3))" />
                  <circle cx="0" cy="0" r="13" fill="none" stroke="#ffcd00" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />
                  <text x="0" y="4" fontFamily="Georgia, serif" fontSize="12" fill="#ffcd00" textAnchor="middle">L</text>
                </g>
              </g>
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight font-sans">
            Plataforma <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">premium</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Crea y autoprovisiona tu primer evento de prueba de inmediato.
          </p>
        </div>

        {/* Footer Brand info */}
        <div className="relative text-xs text-zinc-500 font-mono z-10 border-t border-white/5 pt-4">
          &copy; {new Date().getFullYear()} Lacre Platform. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: REGISTER FORM (Full screen height, 50% split) */}
      <div className="w-full md:w-1/2 min-h-screen bg-white dark:bg-zinc-900 p-8 sm:p-16 lg:p-24 flex flex-col justify-center items-center relative transition-colors duration-300">
        
        <div className="w-full max-w-[460px] flex flex-col gap-10">
          
          {/* Header */}
          <div className="text-center">
            {/* Mobile Logo */}
            <div className="flex md:hidden justify-center mb-6">
              <img src="/logo.png" alt="Lacre Logo" className="h-12 w-auto dark:hidden" />
              <img src="/logo-white.png" alt="Lacre Logo" className="h-12 w-auto hidden dark:block" />
            </div>
            <h1 className="text-5xl font-black text-zinc-950 dark:text-white tracking-tight mb-3 font-sans">
              Crear Cuenta
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Crea tu cuenta para comenzar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            
            {/* Status alerts */}
            {errorMsg && (
              <div className="rounded-2xl bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400 text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 p-4 text-sm text-emerald-600 dark:text-emerald-400 text-center">
                {successMsg}
              </div>
            )}

            {/* Business Name Field - Pill styled, wide and 40px height */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                id="businessName"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Nombre de tu Negocio / Organizador"
                className="block w-full h-[40px] py-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-full px-8 text-base text-center border-0 focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:outline-none transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Email Field - Pill styled, wide and 40px height */}
            <div className="flex flex-col gap-1">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo Electrónico"
                className="block w-full h-[40px] py-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-full px-8 text-base text-center border-0 focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:outline-none transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Password Field - Pill styled, wide and 40px height */}
            <div className="flex flex-col gap-1">
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="block w-full h-[40px] py-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-full px-8 text-base text-center border-0 focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:outline-none transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start px-4">
              <label className="flex items-start gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  required
                  className="rounded border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500 bg-white dark:bg-zinc-900 h-4.5 w-4.5 mt-0.5" 
                />
                <span>Acepto los <a href="#" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Términos y Condiciones</a> y la <a href="#" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Política de Privacidad</a>.</span>
              </label>
            </div>

            {/* Centered Pill Submit Button - 40px height */}
            <div className="flex justify-center w-full mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-64 h-[40px] flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] py-0 text-sm font-bold text-white tracking-widest uppercase shadow-lg shadow-purple-500/25 dark:shadow-purple-950/20 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer select-none"
              >
                {loading ? (
                  <Spinner size={18} className="animate-spin mx-auto" />
                ) : (
                  "REGISTRARSE"
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:underline transition">
              Inicia sesión
            </Link>
          </div>

        </div>
      </div>

    </main>
  );
}
