"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, LockKey, SignOut } from '@phosphor-icons/react';

function SinAccesoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const motivo = searchParams.get('motivo') ?? 'pendiente';
  const expirado = motivo === 'expirado';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-8">

        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-400">
          {expirado ? <LockKey size={40} weight="duotone" /> : <Clock size={40} weight="duotone" />}
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-sans">
            {expirado ? 'Acceso expirado' : 'Cuenta pendiente de activación'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {expirado
              ? 'Tu período de acceso a la plataforma ha finalizado. Comunícate con el administrador para renovar tu acceso.'
              : 'Tu registro fue exitoso. Un administrador debe activar tu cuenta antes de que puedas acceder al panel. Te notificaremos cuando esté lista.'}
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 text-sm text-zinc-600 dark:text-zinc-400 w-full">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">¿Necesitas ayuda?</p>
          <p>Escríbenos a{' '}
            <a href="mailto:rongnysierra@gmail.com" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              rongnysierra@gmail.com
            </a>
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <SignOut size={16} />
          Cerrar sesión
        </button>

      </div>
    </main>
  );
}

export default function SinAccesoPage() {
  return (
    <Suspense>
      <SinAccesoContent />
    </Suspense>
  );
}
