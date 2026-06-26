"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Calendar, TrendUp, Sparkle, ArrowRight, EnvelopeSimple, Sun, Moon } from '@phosphor-icons/react';

export default function HomePage() {
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-radial from-purple-500/5 dark:from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-radial from-purple-500/5 dark:from-purple-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header / Nav */}
      <header className="w-full max-w-7xl px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
            <EnvelopeSimple size={20} weight="duotone" />
          </div>
          <span className="font-bold tracking-tight text-zinc-950 dark:text-white text-lg">Lacre</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <Link 
            href="/login" 
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 dark:shadow-purple-900/20 hover:bg-purple-500 transition cursor-pointer"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Sparkle size={12} />
          Plataforma de Invitaciones Premium
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-6 leading-tight">
          Invitaciones que cautivan a tus invitados
        </h1>
        
        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mb-8 max-w-2xl leading-relaxed">
          Crea experiencias digitales únicas e inalterables para tus quinceañeras, bodas y eventos especiales. Controla los accesos mediante enlaces dinámicos seguros y sigue las confirmaciones de asistencia en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Link 
            href="/register" 
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 dark:shadow-purple-900/20 hover:bg-purple-500 active:scale-[0.98] transition cursor-pointer w-full sm:w-auto"
          >
            Comenzar Gratis
            <ArrowRight size={16} />
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 px-6 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white shadow-sm transition cursor-pointer w-full sm:w-auto"
          >
            Ver Demostración
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-5xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 border-t border-zinc-200 dark:border-white/5">
        <div className="rounded-2xl bg-white dark:bg-zinc-950/40 p-6 border border-zinc-200 dark:border-white/5 backdrop-blur shadow-sm dark:shadow-none">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 mb-4">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2">Enlaces Seguros (UUID)</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Elimina parámetros vulnerables en la URL. Cada invitado accede mediante un ID único cifrado en la base de datos, impidiendo alteración de nombres o cupos.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-950/40 p-6 border border-zinc-200 dark:border-white/5 backdrop-blur shadow-sm dark:shadow-none">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 mb-4">
            <TrendUp size={22} weight="duotone" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2">Confirmaciones en Tiempo Real</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Los invitados confirman directamente en la web. Tu panel Bento Grid recibe los datos de asistencia, pases y saludos instantáneamente sin recargar la página.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-950/40 p-6 border border-zinc-200 dark:border-white/5 backdrop-blur shadow-sm dark:shadow-none">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 mb-4">
            <Calendar size={22} weight="duotone" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-2">Diseño Premium Modular</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Controla las fechas, la ubicación con geolocalización, la música de fondo y los colores del tema de la invitación para adaptarla exactamente a tus clientes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-6 py-8 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-white/5 z-10">
        &copy; {new Date().getFullYear()} Lacre Platform. Diseñado para experiencias premium. Todos los derechos reservados.
      </footer>

    </main>
  );
}
