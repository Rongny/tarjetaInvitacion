"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import {
  SignOut, Plus, Trash, Check, Calendar, MapPin, MusicNotes,
  Palette, Users, CheckCircle, XCircle, Clock, Bell, Spinner, CopySimple,
  Globe, Link as LinkIcon, UserList, FloppyDisk, Sun, Moon,
  ArrowsClockwise
} from '@phosphor-icons/react';

interface ClientProfile {
  id: string;
  email: string;
  business_name?: string | null;
  role?: string;
  access_until?: string | null;
}

interface EventData {
  id: string;
  client_id: string;
  host_name: string;
  event_type: string;
  event_date: string;
  location_name: string;
  location_address: string;
  location_map_url: string;
  photos_folder_url: string;
  background_music_url: string;
  hero_image_url?: string | null;
  theme_colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    gold?: string;
    reserved_color_name?: string;
  };
}

interface GuestData {
  id: string;
  event_id: string;
  name: string;
  max_slots: number;
  gender: string;
  phone_number: string;
  rsvp_status: string;
  attending_count: number;
  guest_message: string;
  updated_at: string;
  slug?: string | null;
}

interface ActivityLog {
  id: string;
  guestName: string;
  action: string;
  time: string;
  type: 'confirm' | 'decline' | 'add' | 'update';
}

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestSlots, setNewGuestSlots] = useState(2);
  const [newGuestGender, setNewGuestGender] = useState<'m' | 'f' | 'n'>('n');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);

  const [editingEvent, setEditingEvent] = useState(false);
  const [editHostName, setEditHostName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editLocationMapUrl, setEditLocationMapUrl] = useState('');
  const [editBackgroundMusicUrl, setEditBackgroundMusicUrl] = useState('');
  const [editPhotosFolderUrl, setEditPhotosFolderUrl] = useState('');
  const [editColorPrimary, setEditColorPrimary] = useState('#4a2a6b');
  const [editColorSecondary, setEditColorSecondary] = useState('#9964c4');
  const [editColorAccent, setEditColorAccent] = useState('#bf8ce0');
  const [editColorGold, setEditColorGold] = useState('#d4b26f');
  const [editReservedColorName, setEditReservedColorName] = useState('Lila');
  const [savingEvent, setSavingEvent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editHeroImageUrl, setEditHeroImageUrl] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
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

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (client) {
          if (client.role !== 'admin') {
            const accessUntil = client.access_until ? new Date(client.access_until) : null;
            if (!accessUntil || accessUntil <= new Date()) {
              router.push('/sin-acceso?motivo=' + (accessUntil ? 'expirado' : 'pendiente'));
              return;
            }
          }
          setClientProfile(client);
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              business_name: session.user.user_metadata?.business_name || 'Mi Empresa de Invitaciones'
            })
            .select()
            .single();
          if (newClient) setClientProfile(newClient);
        }
      }
      setLoadingAuth(false);
    };

    fetchSession();
  }, [router]);

  const guestsRef = React.useRef(guests);
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  const loadEventAndGuests = useCallback(async (showSkeleton = true) => {
    if (!session) return;
    if (showSkeleton) {
      setLoadingData(true);
    } else {
      setRefreshing(true);
    }
    try {
      const { data: eventsList, error: eventErr } = await supabase
        .from('events')
        .select('*')
        .eq('client_id', session.user.id);

      let activeEvent: EventData | null = null;

      if (eventErr || !eventsList || eventsList.length === 0) {
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 2);

        const { data: newEvent, error: createErr } = await supabase
          .from('events')
          .insert({
            client_id: session.user.id,
            host_name: 'Shaidy Ortiz',
            event_type: 'quinceanera',
            event_date: defaultDate.toISOString(),
            location_name: 'Hacienda Real Campanario',
            location_address: 'Av. del Campanario #500, Querétaro, Qro.',
            location_map_url: 'https://maps.app.goo.gl/r6m9p2N874P5c8z17',
            background_music_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            theme_colors: {
              primary: '#4a2a6b',
              secondary: '#9964c4',
              accent: '#bf8ce0',
              gold: '#d4b26f'
            }
          })
          .select()
          .single();

        if (createErr) throw createErr;
        activeEvent = newEvent;
      } else {
        activeEvent = eventsList[0];
      }

      if (activeEvent) {
        setEvent(activeEvent);
        setEditHostName(activeEvent.host_name);
        const localDateStr = activeEvent.event_date ? new Date(activeEvent.event_date).toISOString().slice(0, 16) : '';
        setEditEventDate(localDateStr);
        setEditLocationName(activeEvent.location_name);
        setEditLocationAddress(activeEvent.location_address);
        setEditLocationMapUrl(activeEvent.location_map_url || '');
        setEditBackgroundMusicUrl(activeEvent.background_music_url || '');
        setEditPhotosFolderUrl(activeEvent.photos_folder_url || '');
        setEditHeroImageUrl(activeEvent.hero_image_url || '');
        setHeroFile(null);
        setHeroPreview(null);
        setEditColorPrimary(activeEvent.theme_colors?.primary || '#4a2a6b');
        setEditColorSecondary(activeEvent.theme_colors?.secondary || '#9964c4');
        setEditColorAccent(activeEvent.theme_colors?.accent || '#bf8ce0');
        setEditColorGold(activeEvent.theme_colors?.gold || '#d4b26f');
        setEditReservedColorName(activeEvent.theme_colors?.reserved_color_name || 'Lila');

        const { data: guestsList, error: guestErr } = await supabase
          .from('guests')
          .select('*')
          .eq('event_id', activeEvent.id)
          .order('name', { ascending: true });

        if (guestErr) throw guestErr;
        setGuests(guestsList || []);

        const recentRSVPs = (guestsList || [])
          .filter(g => g.rsvp_status !== 'pending')
          .slice(0, 5)
          .map(g => ({
            id: g.id,
            guestName: g.name,
            action: g.rsvp_status === 'confirmed'
              ? `Confirmó asistencia para ${g.attending_count} personas`
              : 'Declinó la invitación',
            time: new Date(g.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: g.rsvp_status === 'confirmed' ? 'confirm' as const : 'decline' as const
          }));
        setActivities(recentRSVPs);
      }
    } catch (err) {
      console.error('Error loading event and guests:', err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadEventAndGuests(true);
    }
  }, [session, loadEventAndGuests]);

  useEffect(() => {
    if (!event) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `event_id=eq.${event.id}` },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            const guest = newRecord as GuestData;
            setGuests(prev => {
              if (prev.some(g => g.id === guest.id)) return prev;
              return [...prev, guest].sort((a, b) => a.name.localeCompare(b.name));
            });
            setActivities(prev => [
              {
                id: guest.id,
                guestName: guest.name,
                action: 'Fue agregado a la lista de invitados',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'add'
              },
              ...prev.slice(0, 9)
            ]);
          } else if (eventType === 'UPDATE') {
            const guest = newRecord as GuestData;
            setGuests(prev => prev.map(g => g.id === guest.id ? guest : g));

            const oldGuest = guestsRef.current.find(g => g.id === guest.id);
            if (oldGuest && oldGuest.rsvp_status !== guest.rsvp_status) {
              setActivities(prev => [
                {
                  id: guest.id,
                  guestName: guest.name,
                  action: guest.rsvp_status === 'confirmed'
                    ? `Confirmó asistencia para ${guest.attending_count} personas`
                    : 'Declinó la invitación',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: guest.rsvp_status === 'confirmed' ? 'confirm' : 'decline'
                },
                ...prev.slice(0, 9)
              ]);
            }
          } else if (eventType === 'DELETE') {
            const guestId = (oldRecord as { id: string }).id;
            setGuests(prev => prev.filter(g => g.id !== guestId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const generateSlug = (name: string): string => {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric chars
      .trim()
      .replace(/\s+/g, '-'); // replace spaces with hyphens
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSuffix}`;
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !event) return;

    setAddingGuest(true);
    try {
      const slug = generateSlug(newGuestName.trim());
      const { data, error } = await supabase
        .from('guests')
        .insert({
          event_id: event.id,
          name: newGuestName.trim(),
          max_slots: newGuestSlots,
          gender: newGuestGender,
          phone_number: newGuestPhone.trim() || null,
          rsvp_status: 'pending',
          attending_count: 0,
          slug
        })
        .select()
        .single();

      if (error) throw error;

      setNewGuestName('');
      setNewGuestSlots(2);
      setNewGuestGender('n');
      setNewGuestPhone('');

      if (data) {
        setGuests(prev => {
          if (prev.some(g => g.id === data.id)) return prev;
          return [...prev, data].sort((a, b) => a.name.localeCompare(b.name));
        });
      }
    } catch (err) {
      console.error('Error adding guest:', err);
      alert('Error al agregar el invitado');
    } finally {
      setAddingGuest(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este invitado?')) return;

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGuests(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting guest:', err);
      alert('Error al eliminar el invitado');
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSavingEvent(true);
    try {
      let finalHeroImageUrl = editHeroImageUrl;

      if (heroFile) {
        const fileExt = heroFile.name.split('.').pop();
        const fileName = `${event.id}/hero-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('event-images')
          .upload(fileName, heroFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        finalHeroImageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          host_name: editHostName,
          event_date: new Date(editEventDate).toISOString(),
          location_name: editLocationName,
          location_address: editLocationAddress,
          location_map_url: editLocationMapUrl || null,
          background_music_url: editBackgroundMusicUrl || null,
          photos_folder_url: editPhotosFolderUrl || null,
          hero_image_url: finalHeroImageUrl || null,
          theme_colors: {
            primary: editColorPrimary,
            secondary: editColorSecondary,
            accent: editColorAccent,
            gold: editColorGold,
            reserved_color_name: editReservedColorName
          }
        })
        .eq('id', event.id)
        .select()
        .single();

      if (error) throw error;
      setEvent(data);
      setEditHeroImageUrl(data.hero_image_url || '');
      setHeroFile(null);
      setHeroPreview(null);
      setEditingEvent(false);
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Error al actualizar la configuración del evento');
    } finally {
      setSavingEvent(false);
    }
  };

  const copyInviteLink = (slug: string | null | undefined, id: string) => {
    const inviteUrl = `${originUrl}/invitado/${slug || id}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyAllLinks = () => {
    const textList = filteredGuests.map(g => `${g.name}: ${originUrl}/invitado/${g.slug || g.id}`).join('\n');
    navigator.clipboard.writeText(textList).then(() => {
      alert('Todos los enlaces filtrados han sido copiados al portapapeles.');
    });
  };

  const totalGuestsAllocated = guests.reduce((acc, g) => acc + g.max_slots, 0);
  const totalGuestsConfirmed = guests.reduce((acc, g) => acc + g.attending_count, 0);
  const totalConfirmedInvitees = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const totalDeclinedInvitees = guests.filter(g => g.rsvp_status === 'declined').length;
  const totalPendingInvitees = guests.filter(g => g.rsvp_status === 'pending').length;
  const totalInvitees = guests.length;
  const confirmRate = totalInvitees > 0 ? Math.round((totalConfirmedInvitees / totalInvitees) * 100) : 0;

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (g.phone_number && g.phone_number.includes(searchQuery));
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && g.rsvp_status === statusFilter;
  });

  if (loadingAuth || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b] text-zinc-800 dark:text-zinc-100 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={36} className="animate-spin text-purple-600 dark:text-purple-500" />
          <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">Cargando plataforma Lacre...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────
  const SectionHeader = ({
    icon, title, subtitle, action
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between bg-slate-100/80 dark:bg-zinc-800/60 rounded-2xl px-6 py-4 mb-8">
      <div className="flex items-center gap-3.5">
        <div className="shrink-0">{icon}</div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 leading-none">{title}</h2>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
        </div>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#f4f5f8] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 dark:border-white/5 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-500/30">
                <Globe size={16} weight="fill" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold tracking-tight text-zinc-950 dark:text-white text-sm">Lacre</span>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                  {clientProfile?.business_name || 'Panel de control'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadEventAndGuests(false)}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition cursor-pointer active:scale-[0.97]"
                title="Sincronizar datos"
              >
                <ArrowsClockwise size={13} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-pointer transition active:scale-[0.97]"
                title="Cambiar tema"
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition cursor-pointer active:scale-[0.97]"
                title="Cerrar sesión"
              >
                <SignOut size={13} />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-7 lg:py-9">
        <div className="grid grid-cols-12 gap-5 lg:gap-6">

          {/* ── KPI Row ── */}
          {([
            { value: totalInvitees, label: 'Total Invitados', icon: <Users size={20} weight="duotone" />, bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/30' },
            { value: totalConfirmedInvitees, label: 'Confirmados', icon: <CheckCircle size={20} weight="duotone" />, bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/30' },
            { value: totalPendingInvitees, label: 'Pendientes', icon: <Clock size={20} weight="duotone" />, bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/30' },
            { value: totalDeclinedInvitees, label: 'Declinaron', icon: <XCircle size={20} weight="duotone" />, bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/30' },
          ]).map(kpi => (
            <div key={kpi.label} className="col-span-6 sm:col-span-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 px-7 py-6 shadow-sm flex items-center gap-5 transition-colors duration-300">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.text} border ${kpi.border} shrink-0`}>
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-black font-mono text-zinc-900 dark:text-white leading-none">{kpi.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mt-1.5 truncate">{kpi.label}</p>
              </div>
            </div>
          ))}

          {/* ── Analytics ── */}
          <section className="col-span-12 lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-9 shadow-sm flex flex-col transition-colors duration-300">
            <SectionHeader
              icon={<div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"><Users size={18} weight="duotone" /></div>}
              title="Analíticas de Asistencia"
              subtitle="Confirmaciones en tiempo real"
            />

            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke={event?.theme_colors?.primary || '#7c3aed'}
                    strokeWidth="7" fill="transparent"
                    strokeDasharray={263.9}
                    strokeDashoffset={263.9 - (263.9 * confirmRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black font-mono text-zinc-950 dark:text-white leading-none">{confirmRate}%</span>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-2">Confirmados</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/5 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden mt-2">
              <div className="text-center py-5 px-3">
                <span className="block text-2xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">{totalConfirmedInvitees}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block mt-2 uppercase tracking-wide">Asistirán</span>
              </div>
              <div className="text-center py-5 px-3">
                <span className="block text-2xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">{totalDeclinedInvitees}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block mt-2 uppercase tracking-wide">Cancelaron</span>
              </div>
              <div className="text-center py-5 px-3">
                <span className="block text-2xl font-extrabold font-mono text-zinc-900 dark:text-white leading-none">{totalPendingInvitees}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block mt-2 uppercase tracking-wide">Pendientes</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 font-mono">Cupos Confirmados</span>
                <span className="text-[11px] font-bold text-zinc-900 dark:text-white font-mono">{totalGuestsConfirmed} / {totalGuestsAllocated}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-950 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: event?.theme_colors?.primary || '#7c3aed',
                    width: `${totalGuestsAllocated > 0 ? (totalGuestsConfirmed / totalGuestsAllocated) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </section>

          {/* ── Event Details ── */}
          <section className="col-span-12 lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-9 shadow-sm flex flex-col transition-colors duration-300">
            {!editingEvent ? (
              <>
                <SectionHeader
                  icon={<div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30"><Calendar size={18} weight="duotone" /></div>}
                  title="Detalles del Evento"
                  subtitle="Ajustes generales y paleta de colores"
                  action={
                    <button
                      onClick={() => setEditingEvent(true)}
                      className="rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-600 border border-slate-200 dark:border-white/10 text-xs px-4 py-2 font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-200 transition cursor-pointer active:scale-[0.97] shadow-sm"
                    >
                      Configurar
                    </button>
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5"><Globe size={15} weight="duotone" /></div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1.5">Anfitriona</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-100 font-bold">{event?.host_name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5"><Calendar size={15} weight="duotone" /></div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1.5">Fecha del Evento</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-100 font-bold font-mono leading-snug">
                        {event?.event_date ? new Date(event.event_date).toLocaleString('es-ES', {
                          weekday: 'long', year: 'numeric', month: 'long',
                          day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'No configurada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 sm:col-span-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5"><MapPin size={15} weight="duotone" /></div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-1.5">Lugar & Dirección</span>
                      <span className="text-sm text-zinc-900 dark:text-zinc-100 font-bold block">{event?.location_name}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">{event?.location_address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 sm:col-span-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5"><Palette size={15} weight="duotone" /></div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2.5">Colores del Tema</span>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { label: 'Principal', color: event?.theme_colors?.primary },
                          { label: 'Secundario', color: event?.theme_colors?.secondary },
                          { label: 'Acento', color: event?.theme_colors?.accent },
                          { label: 'Oro', color: event?.theme_colors?.gold },
                        ].map(c => (
                          <span key={c.label} className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-xl">
                            <span className="w-3 h-3 rounded-full border border-zinc-200 dark:border-white/10 shrink-0" style={{ backgroundColor: c.color }} />
                            {c.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <span className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <MusicNotes size={14} />
                    {event?.background_music_url ? 'Música activa' : 'Sin música'}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <LinkIcon size={14} />
                    {event?.photos_folder_url ? 'Fotos enlazadas' : 'Sin galería'}
                  </span>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateEvent} className="flex flex-col gap-5">
                <div className="flex items-center justify-between bg-slate-100/80 dark:bg-zinc-800/60 rounded-2xl px-6 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Editar Evento</h3>
                  <div className="flex gap-2.5">
                    <button type="button" onClick={() => setEditingEvent(false)}
                      className="rounded-xl bg-white dark:bg-zinc-700 border border-slate-200 dark:border-white/10 text-xs px-4 py-2 font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-300 hover:bg-slate-50 transition cursor-pointer active:scale-[0.97]">
                      Cancelar
                    </button>
                    <button type="submit" disabled={savingEvent}
                      className="rounded-xl bg-violet-600 text-xs px-4 py-2 font-bold uppercase tracking-wider text-white hover:bg-violet-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-violet-500/20 active:scale-[0.97]">
                      {savingEvent ? <Spinner className="animate-spin" size={12} /> : <FloppyDisk size={12} />}
                      Guardar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nombre del Anfitrión/a</label>
                    <input type="text" required value={editHostName} onChange={(e) => setEditHostName(e.target.value)}
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Fecha y Hora</label>
                    <input type="datetime-local" required value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)}
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Lugar (Nombre)</label>
                    <input type="text" required value={editLocationName} onChange={(e) => setEditLocationName(e.target.value)}
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mapa (Google Maps URL)</label>
                    <input type="url" value={editLocationMapUrl} onChange={(e) => setEditLocationMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..."
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Dirección Completa</label>
                    <input type="text" required value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)}
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Música (URL MP3)</label>
                    <input type="url" value={editBackgroundMusicUrl} onChange={(e) => setEditBackgroundMusicUrl(e.target.value)} placeholder="https://servidor.com/musica.mp3"
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Galería de Fotos</label>
                    <input type="url" value={editPhotosFolderUrl} onChange={(e) => setEditPhotosFolderUrl(e.target.value)} placeholder="https://drive.google.com/..."
                      className="w-full text-sm h-10 rounded-xl border-0 bg-slate-50 dark:bg-zinc-950 px-4 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Foto de Portada (Invitación)</label>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl ring-1 ring-slate-200/80 dark:ring-white/5">
                      <div className="w-12 h-16 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {heroPreview || editHeroImageUrl ? (
                          <img src={heroPreview || editHeroImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-zinc-400">Sin foto</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setHeroFile(file);
                              setHeroPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 dark:file:bg-violet-950/30 dark:file:text-violet-400 hover:file:bg-violet-100 cursor-pointer w-full"
                        />
                        <p className="text-[9px] text-zinc-450 dark:text-zinc-500">Recomendado: Proporción vertical (3:4). Se guardará en Supabase Storage.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Paleta de Colores</label>
                  <div className="grid grid-cols-4 gap-3">
                    {([
                      { label: 'Principal', value: editColorPrimary, setter: setEditColorPrimary },
                      { label: 'Secundario', value: editColorSecondary, setter: setEditColorSecondary },
                      { label: 'Acento', value: editColorAccent, setter: setEditColorAccent },
                      { label: 'Oro', value: editColorGold, setter: setEditColorGold },
                    ] as const).map(c => (
                      <div key={c.label} className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">{c.label}</span>
                        <div className="flex gap-1.5 items-center">
                          <input type="color" value={c.value} onChange={(e) => c.setter(e.target.value)} className="w-8 h-8 border-0 bg-transparent rounded-lg cursor-pointer" />
                          <input type="text" value={c.value} onChange={(e) => c.setter(e.target.value)} className="w-full text-[10px] h-8 bg-slate-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-2 border border-slate-200 dark:border-white/10 font-mono focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Color reservado (nombre)</span>
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded-lg shrink-0 border border-slate-200 dark:border-white/10" style={{ backgroundColor: editColorPrimary }} />
                      <input
                        type="text"
                        value={editReservedColorName}
                        onChange={(e) => setEditReservedColorName(e.target.value)}
                        placeholder="Ej: Lila, Morado, Rosa..."
                        className="w-full text-xs h-8 bg-slate-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-3 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500">Este nombre aparece en la sección Dress Code de la invitación.</p>
                  </div>
                </div>
              </form>
            )}
          </section>

          {/* ── Guest List ── */}
          <section id="guest-list" className="col-span-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-9 shadow-sm transition-colors duration-300">
            <SectionHeader
              icon={<div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30"><UserList size={18} weight="duotone" /></div>}
              title="Lista de Invitados"
              subtitle="Administra los enlaces seguros y la asistencia"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="text-xs rounded-xl border-0 bg-white dark:bg-zinc-950 h-8 px-3.5 text-zinc-950 dark:text-white ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-violet-500 focus:outline-none w-44 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm"
                  />
                  <div className="flex rounded-xl bg-white dark:bg-zinc-950 p-0.5 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
                    {(['all', 'pending', 'confirmed', 'declined'] as const).map((st) => (
                      <button key={st} onClick={() => setStatusFilter(st)}
                        className={`text-[10px] font-bold uppercase px-3.5 py-1.5 rounded-lg transition cursor-pointer min-w-[48px] text-center ${
                          statusFilter === st ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                        }`}>
                        {st === 'all' ? 'Todos' : st === 'pending' ? 'Pend.' : st === 'confirmed' ? 'Sí' : 'No'}
                      </button>
                    ))}
                  </div>
                  <button onClick={copyAllLinks}
                    className="flex h-8 items-center gap-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wide px-3.5 text-zinc-600 dark:text-zinc-300 transition cursor-pointer active:scale-[0.97] shadow-sm">
                    <CopySimple size={12} />
                    Copiar Enlaces
                  </button>
                </div>
              }
            />

            {/* Add Guest Form */}
            <form onSubmit={handleAddGuest} className="grid grid-cols-12 gap-3 bg-slate-50/70 dark:bg-zinc-950/40 rounded-2xl p-5 border border-slate-200/60 dark:border-white/5 mb-6">
              <div className="col-span-12 sm:col-span-4 flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Nombre del Invitado</label>
                <input type="text" required value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} placeholder="Nombre completo"
                  className="w-full text-sm h-9 rounded-xl border-0 bg-white dark:bg-zinc-900 px-3.5 text-zinc-950 dark:text-white ring-1 ring-slate-200/80 dark:ring-white/5 focus:ring-2 focus:ring-violet-500 focus:outline-none" />
              </div>
              <div className="col-span-4 sm:col-span-2 flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Cupos</label>
                <input type="number" min={1} max={50} required value={newGuestSlots} onChange={(e) => setNewGuestSlots(parseInt(e.target.value) || 1)}
                  className="w-full text-sm h-9 rounded-xl border-0 bg-white dark:bg-zinc-900 px-3.5 text-zinc-950 dark:text-white ring-1 ring-slate-200/80 dark:ring-white/5 focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono" />
              </div>
              <div className="col-span-4 sm:col-span-2 flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Género</label>
                <select value={newGuestGender} onChange={(e) => setNewGuestGender(e.target.value as 'm' | 'f' | 'n')}
                  className="w-full text-sm h-9 rounded-xl border-0 bg-white dark:bg-zinc-900 px-3.5 text-zinc-950 dark:text-white ring-1 ring-slate-200/80 dark:ring-white/5 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer">
                  <option value="n">Familia / N</option>
                  <option value="f">Femenino</option>
                  <option value="m">Masculino</option>
                </select>
              </div>
              <div className="col-span-4 sm:col-span-3 flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Celular (WhatsApp)</label>
                <input type="tel" value={newGuestPhone} onChange={(e) => setNewGuestPhone(e.target.value)} placeholder="Celular (WhatsApp)"
                  className="w-full text-sm h-9 rounded-xl border-0 bg-white dark:bg-zinc-900 px-3.5 text-zinc-950 dark:text-white ring-1 ring-slate-200/80 dark:ring-white/5 focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono" />
              </div>
              <div className="col-span-12 sm:col-span-1 flex flex-col justify-end">
                <button type="submit" disabled={addingGuest}
                  className="w-full flex h-9 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition cursor-pointer disabled:opacity-50 shadow-sm shadow-violet-500/20 active:scale-[0.97]">
                  {addingGuest ? <Spinner className="animate-spin" size={14} /> : <Plus size={14} />}
                </button>
              </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-zinc-800/40">
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Nombre</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 text-center">Cupos</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 text-center">Género</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Contacto</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 text-center">RSVP</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 text-center">Asistirán</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Mensaje</th>
                    <th className="py-3.5 px-5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                        No se encontraron invitados en esta lista.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-950/30 group transition-colors duration-100">
                        <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-white text-xs">{g.name}</td>
                        <td className="py-4 px-5 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300 text-xs">{g.max_slots}</td>
                        <td className="py-4 px-5 text-center">
                          <span className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                            {g.gender === 'm' ? 'H' : g.gender === 'f' ? 'M' : 'Fam'}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-500 dark:text-zinc-400 text-xs">{g.phone_number || '-'}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block ${
                            g.rsvp_status === 'confirmed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              : g.rsvp_status === 'declined'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                          }`}>
                            {g.rsvp_status === 'confirmed' ? 'Confirmado' : g.rsvp_status === 'declined' ? 'Declinó' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center font-mono font-bold text-zinc-900 dark:text-white text-xs">
                          {g.rsvp_status === 'confirmed' ? g.attending_count : '-'}
                        </td>
                        <td className="py-4 px-5 max-w-[100px] truncate text-zinc-400 italic text-xs">
                          {g.guest_message || '-'}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => copyInviteLink(g.slug, g.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-[0.97] ${
                                copiedId === g.id
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                                  : 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/40 hover:bg-violet-600 hover:text-white hover:border-violet-600 shadow-sm'
                              }`} title="Copiar enlace único">
                              {copiedId === g.id ? <Check size={13} /> : <LinkIcon size={13} />}
                              {copiedId === g.id ? 'Copiado' : 'Enlace'}
                            </button>
                            <button onClick={() => handleDeleteGuest(g.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition cursor-pointer active:scale-[0.97] shadow-sm"
                              title="Eliminar invitado">
                              <Trash size={13} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Activity Feed ── */}
          <section className="col-span-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5 p-9 shadow-sm flex flex-col transition-colors duration-300">
            <SectionHeader
              icon={<div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/30"><Bell size={18} weight="duotone" /></div>}
              title="Actividad en Vivo"
              subtitle="Historial de respuestas RSVP en tiempo real"
            />

            {activities.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 italic py-10 text-center">Sin actividad registrada todavía.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activities.map((act) => (
                  <div key={`${act.id}-${act.time}`}
                    className="flex items-center gap-4 w-full bg-slate-50/60 dark:bg-zinc-950/30 rounded-2xl px-6 py-4 border border-slate-100 dark:border-white/[0.04] hover:bg-slate-100/60 dark:hover:bg-zinc-950/60 transition">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      act.type === 'confirm' ? 'bg-emerald-500' :
                      act.type === 'decline' ? 'bg-red-500' : 'bg-violet-500'
                    }`} />
                    <span className="text-sm font-bold text-zinc-900 dark:text-white shrink-0">{act.guestName}</span>
                    <span className="text-zinc-300 dark:text-zinc-600 shrink-0">·</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 flex-1 truncate">{act.action}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
