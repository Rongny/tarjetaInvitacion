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
  theme_colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    gold?: string;
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
  
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App state
  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Guest list filters / form
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New guest form
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestSlots, setNewGuestSlots] = useState(2);
  const [newGuestGender, setNewGuestGender] = useState<'m' | 'f' | 'n'>('n');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [addingGuest, setAddingGuest] = useState(false);

  // Event editing state
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
  const [savingEvent, setSavingEvent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Base URL for guest invites
  const [originUrl, setOriginUrl] = useState('');

  // Load origin URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOriginUrl(window.location.origin);
    }
  }, []);

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

  // 1. Authenticate & fetch user session
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        // Fetch Client Profile
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (client) {
          setClientProfile(client);
        } else {
          // If public.clients doesn't have a record yet, create one
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

  // Keep guests ref updated for realtime callback without resubscribing
  const guestsRef = React.useRef(guests);
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  // 2. Fetch or auto-provision client's Event and load Guests (Memoized helper)
  const loadEventAndGuests = useCallback(async (showSkeleton = true) => {
    if (!session) return;
    if (showSkeleton) {
      setLoadingData(true);
    } else {
      setRefreshing(true);
    }
    try {
      // Find existing events for client
      const { data: eventsList, error: eventErr } = await supabase
        .from('events')
        .select('*')
        .eq('client_id', session.user.id);

      let activeEvent: EventData | null = null;

      if (eventErr || !eventsList || eventsList.length === 0) {
        // AUTO-PROVISION DEFAULT EVENT
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 2); // 2 months from now

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
        // Sync edit state values
        setEditHostName(activeEvent.host_name);
        // format ISO to local datetime-local value (YYYY-MM-DDThh:mm)
        const localDateStr = activeEvent.event_date ? new Date(activeEvent.event_date).toISOString().slice(0, 16) : '';
        setEditEventDate(localDateStr);
        setEditLocationName(activeEvent.location_name);
        setEditLocationAddress(activeEvent.location_address);
        setEditLocationMapUrl(activeEvent.location_map_url || '');
        setEditBackgroundMusicUrl(activeEvent.background_music_url || '');
        setEditPhotosFolderUrl(activeEvent.photos_folder_url || '');
        setEditColorPrimary(activeEvent.theme_colors?.primary || '#4a2a6b');
        setEditColorSecondary(activeEvent.theme_colors?.secondary || '#9964c4');
        setEditColorAccent(activeEvent.theme_colors?.accent || '#bf8ce0');
        setEditColorGold(activeEvent.theme_colors?.gold || '#d4b26f');

        // Load Guests for this event
        const { data: guestsList, error: guestErr } = await supabase
          .from('guests')
          .select('*')
          .eq('event_id', activeEvent.id)
          .order('name', { ascending: true });

        if (guestErr) throw guestErr;
        setGuests(guestsList || []);

        // Seed default mock activities or load recent updates
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

  // Initial load
  useEffect(() => {
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadEventAndGuests(true);
    }
  }, [session, loadEventAndGuests]);

  // 3. Realtime subscription to dynamic RSVP updates
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
            
            // Log confirmation updates specifically
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

  // Log out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Add guest action
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !event) return;

    setAddingGuest(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          event_id: event.id,
          name: newGuestName.trim(),
          max_slots: newGuestSlots,
          gender: newGuestGender,
          phone_number: newGuestPhone.trim() || null,
          rsvp_status: 'pending',
          attending_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewGuestName('');
      setNewGuestSlots(2);
      setNewGuestGender('n');
      setNewGuestPhone('');

      // Add to local state proactively so it appears instantly
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

  // Delete guest action
  const handleDeleteGuest = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este invitado?')) return;

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state proactively
      setGuests(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting guest:', err);
      alert('Error al eliminar el invitado');
    }
  };

  // Update event configuration
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSavingEvent(true);
    try {
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
          theme_colors: {
            primary: editColorPrimary,
            secondary: editColorSecondary,
            accent: editColorAccent,
            gold: editColorGold
          }
        })
        .eq('id', event.id)
        .select()
        .single();

      if (error) throw error;
      setEvent(data);
      setEditingEvent(false);
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Error al actualizar la configuración del evento');
    } finally {
      setSavingEvent(false);
    }
  };

  // Copy unique invite link
  const copyInviteLink = (id: string) => {
    const inviteUrl = `${originUrl}/invitado/${id}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Copy batch of all invite links
  const copyAllLinks = () => {
    const textList = filteredGuests.map(g => `${g.name}: ${originUrl}/invitado/${g.id}`).join('\n');
    navigator.clipboard.writeText(textList).then(() => {
      alert('Todos los enlaces filtrados han sido copiados al portapapeles.');
    });
  };

  // Stats Calculations
  const totalGuestsAllocated = guests.reduce((acc, g) => acc + g.max_slots, 0);
  const totalGuestsConfirmed = guests.reduce((acc, g) => acc + g.attending_count, 0);
  const totalConfirmedInvitees = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const totalDeclinedInvitees = guests.filter(g => g.rsvp_status === 'declined').length;
  const totalPendingInvitees = guests.filter(g => g.rsvp_status === 'pending').length;
  const totalInvitees = guests.length;

  const confirmRate = totalInvitees > 0 ? Math.round((totalConfirmedInvitees / totalInvitees) * 100) : 0;

  // Filter & Search guests
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

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside 
        className="hidden lg:flex flex-col justify-between w-72 h-screen sticky top-0 p-8 shrink-0 shadow-xl border-r border-black/5 dark:border-white/5 transition-all duration-300"
        style={{
          background: `linear-gradient(180deg, ${event?.theme_colors?.primary || '#6366f1'} 0%, ${event?.theme_colors?.secondary || '#a855f7'} 100%)`
        }}
      >
        <div className="flex flex-col gap-9">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shadow-inner">
              <Globe size={24} weight="fill" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-xl">Lacre</span>
              <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white font-bold uppercase tracking-wider">SaaS</span>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl bg-white/15 text-white font-bold text-sm shadow-sm transition">
              <UserList size={20} weight="fill" />
              <span>Dashboard</span>
            </div>
            <a 
              href="#guest-list" 
              className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-white/80 hover:bg-white/5 hover:text-white font-medium text-sm transition"
            >
              <Users size={20} />
              <span>Invitados</span>
            </a>
            
            {/* Quick Status Box */}
            <div className="flex items-center gap-3 px-4.5 py-4 mt-8 rounded-2xl bg-black/10 border border-white/5 text-xs text-white/95 backdrop-blur-sm">
              <MusicNotes size={20} className="text-white/70 shrink-0" />
              <div className="overflow-hidden">
                <p className="font-bold truncate">{event?.host_name || 'Anfitriona'}</p>
                <p className="opacity-80 truncate text-[10px] mt-0.5">{event?.background_music_url ? 'Música activa' : 'Sin música'}</p>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer (Client Profile & Logout) */}
        <div className="flex flex-col gap-4.5 border-t border-white/15 pt-6">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{clientProfile?.business_name || 'Mis Invitaciones'}</p>
            <p className="text-[10px] text-white/60 font-mono truncate mt-0.5">{clientProfile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 py-3 text-xs font-bold transition duration-150 cursor-pointer shadow-sm w-full"
          >
            <SignOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Right Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Mobile Header / Responsive Navbar */}
        <header className="lg:hidden sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/5 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors duration-300">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Globe size={18} weight="duotone" />
              </div>
              <span className="font-extrabold tracking-tight text-zinc-950 dark:text-white text-base">Lacre</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Actualizar Button */}
              <button
                onClick={() => loadEventAndGuests(false)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
              >
                <ArrowsClockwise size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
              >
                <SignOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Top bar for Desktop */}
        <div className="hidden lg:flex h-20 items-center justify-between px-10 border-b border-zinc-200/80 dark:border-white/5 bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-zinc-800 dark:text-white">Panel de Control</h1>
            <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-800" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Bienvenido al administrador de tus invitaciones</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync */}
            <button
              onClick={() => loadEventAndGuests(false)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 px-4.5 py-2 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition duration-150 cursor-pointer shadow-sm"
              title="Sincronizar datos"
            >
              <ArrowsClockwise size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Sincronizar</span>
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 cursor-pointer transition shadow-sm"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12">
          
          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6 lg:gap-8 max-w-[1280px] mx-auto w-full">

            {/* Bento Cell 1: Attendance Analytics */}
            <section className="col-span-12 lg:col-span-5 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[480px] transition-colors duration-300">
              <div>
                {/* Header */}
                <div className="flex items-center gap-3.5 mb-6 border-b border-zinc-200/80 dark:border-white/5 pb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Users size={22} weight="duotone" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Analíticas de Asistencia</h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans mt-0.5">Confirmaciones en tiempo real</p>
                  </div>
                </div>

                {/* Progress Donut Chart */}
                <div className="flex flex-col items-center justify-center my-6 py-2">
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        stroke={event?.theme_colors?.primary || '#6366f1'} 
                        strokeWidth="8" 
                        fill="transparent"
                        strokeDasharray={263.89} 
                        strokeDashoffset={263.89 - (263.89 * confirmRate) / 100}
                        strokeLinecap="round" 
                        className="transition-all duration-1000" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black font-mono text-zinc-950 dark:text-white leading-none">{confirmRate}%</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1.5">Confirmados</span>
                    </div>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-3.5 mt-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-3.5 text-center transition hover:scale-[1.02] duration-200">
                    <div className="flex justify-center text-emerald-500 dark:text-emerald-400 mb-1.5"><CheckCircle size={18} /></div>
                    <span className="block text-lg font-black font-mono text-zinc-900 dark:text-white leading-none">{totalConfirmedInvitees}</span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 uppercase">Asistirán</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-3.5 text-center transition hover:scale-[1.02] duration-200">
                    <div className="flex justify-center text-red-500 dark:text-red-400 mb-1.5"><XCircle size={18} /></div>
                    <span className="block text-lg font-black font-mono text-zinc-900 dark:text-white leading-none">{totalDeclinedInvitees}</span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 uppercase">Cancelaron</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-3.5 text-center transition hover:scale-[1.02] duration-200">
                    <div className="flex justify-center text-yellow-500 dark:text-yellow-400 mb-1.5"><Clock size={18} /></div>
                    <span className="block text-lg font-black font-mono text-zinc-900 dark:text-white leading-none">{totalPendingInvitees}</span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold block mt-1 uppercase">Pendientes</span>
                  </div>
                </div>
              </div>

              {/* Footer Progress */}
              <div className="border-t border-zinc-200 dark:border-white/5 pt-5 mt-6">
                <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>Pases Confirmados:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{totalGuestsConfirmed} / {totalGuestsAllocated}</span>
                </div>
                <div className="w-full bg-zinc-200/60 dark:bg-zinc-950 rounded-full h-2.5 mt-2.5 overflow-hidden border border-zinc-300/10 dark:border-white/5 p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ 
                      backgroundColor: event?.theme_colors?.primary || '#6366f1',
                      width: `${totalGuestsAllocated > 0 ? (totalGuestsConfirmed / totalGuestsAllocated) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Bento Cell 2: Event Details Config */}
            <section className="col-span-12 lg:col-span-7 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[480px] transition-colors duration-300">
              {!editingEvent ? (
                <>
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6 border-b border-zinc-200/80 dark:border-white/5 pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            <Calendar size={22} weight="duotone" />
                          </div>
                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Detalles del Evento</h2>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans mt-0.5">Ajustes generales y paleta de colores</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingEvent(true)}
                          className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 hover:border-purple-500/40 dark:hover:border-purple-500/40 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs px-4 py-2 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 transition cursor-pointer shadow-sm"
                        >
                          Configurar
                        </button>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                        <div className="flex items-start gap-3.5">
                          <div className="text-zinc-400 dark:text-zinc-500 mt-1 shrink-0"><Globe size={18} /></div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">Anfitriona</span>
                            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-semibold">{event?.host_name}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                          <div className="text-zinc-400 dark:text-zinc-500 mt-1 shrink-0"><Calendar size={18} /></div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">Fecha del Evento</span>
                            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-semibold font-mono">
                              {event?.event_date ? new Date(event.event_date).toLocaleString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'No configurada'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 sm:col-span-2">
                          <div className="text-zinc-400 dark:text-zinc-500 mt-1 shrink-0"><MapPin size={18} /></div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">Lugar & Dirección</span>
                            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-semibold block">{event?.location_name}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">{event?.location_address}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 sm:col-span-2">
                          <div className="text-zinc-400 dark:text-zinc-500 mt-1 shrink-0"><Palette size={18} /></div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">Colores del Tema (Diseño)</span>
                            <div className="flex flex-wrap gap-2.5 mt-0.5">
                              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 px-3 py-1.5 rounded-xl">
                                <span className="w-3 h-3 rounded-full border border-zinc-300 dark:border-white/10" style={{ backgroundColor: event?.theme_colors?.primary }} />
                                Principal
                              </span>
                              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 px-3 py-1.5 rounded-xl">
                                <span className="w-3 h-3 rounded-full border border-zinc-300 dark:border-white/10" style={{ backgroundColor: event?.theme_colors?.secondary }} />
                                Secundario
                              </span>
                              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 px-3 py-1.5 rounded-xl">
                                <span className="w-3 h-3 rounded-full border border-zinc-300 dark:border-white/10" style={{ backgroundColor: event?.theme_colors?.accent }} />
                                Acento
                              </span>
                              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 px-3 py-1.5 rounded-xl">
                                <span className="w-3 h-3 rounded-full border border-zinc-300 dark:border-white/10" style={{ backgroundColor: event?.theme_colors?.gold }} />
                                Oro
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Status */}
                    <div className="border-t border-zinc-200 dark:border-white/5 pt-5 mt-6 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                      <span className="flex items-center gap-1.5 font-mono">
                        <MusicNotes size={14} /> 
                        {event?.background_music_url ? 'Música activa' : 'Sin música'}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <LinkIcon size={14} /> 
                        {event?.photos_folder_url ? 'Fotos enlazadas' : 'Sin galería'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateEvent} className="h-full flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-5 border-b border-zinc-200/80 dark:border-white/5 pb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-white">Editar Evento</h3>
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditingEvent(false)}
                          className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-xs px-3.5 py-2 font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer shadow-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={savingEvent}
                          className="rounded-xl bg-purple-600 text-xs px-3.5 py-2 font-bold uppercase tracking-wider text-white hover:bg-purple-500 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-purple-500/20"
                        >
                          {savingEvent ? <Spinner className="animate-spin" size={14} /> : <FloppyDisk size={14} />}
                          Guardar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Nombre del Anfitrión/a</label>
                        <input
                          type="text"
                          required
                          value={editHostName}
                          onChange={(e) => setEditHostName(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Fecha y Hora</label>
                        <input
                          type="datetime-local"
                          required
                          value={editEventDate}
                          onChange={(e) => setEditEventDate(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Lugar (Nombre)</label>
                        <input
                          type="text"
                          required
                          value={editLocationName}
                          onChange={(e) => setEditLocationName(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Mapa (Google Maps URL)</label>
                        <input
                          type="url"
                          value={editLocationMapUrl}
                          onChange={(e) => setEditLocationMapUrl(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                          placeholder="https://maps.app.goo.gl/..."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Dirección Completa</label>
                        <input
                          type="text"
                          required
                          value={editLocationAddress}
                          onChange={(e) => setEditLocationAddress(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Música (URL MP3)</label>
                        <input
                          type="url"
                          value={editBackgroundMusicUrl}
                          onChange={(e) => setEditBackgroundMusicUrl(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                          placeholder="https://servidor.com/musica.mp3"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Galería de Fotos</label>
                        <input
                          type="url"
                          value={editPhotosFolderUrl}
                          onChange={(e) => setEditPhotosFolderUrl(e.target.value)}
                          className="w-full text-xs h-[42px] rounded-xl border-0 bg-zinc-50 dark:bg-zinc-950 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-white/5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Paleta de Colores</label>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <span className="text-[8px] text-zinc-400 font-semibold block mb-1">Principal</span>
                          <div className="flex gap-1.5">
                            <input type="color" value={editColorPrimary} onChange={(e) => setEditColorPrimary(e.target.value)} className="w-6 h-6 border-0 bg-transparent rounded cursor-pointer" />
                            <input type="text" value={editColorPrimary} onChange={(e) => setEditColorPrimary(e.target.value)} className="w-full text-[10px] h-[26px] bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-1.5 border border-zinc-200/80 dark:border-white/10 font-mono focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-400 font-semibold block mb-1">Secundario</span>
                          <div className="flex gap-1.5">
                            <input type="color" value={editColorSecondary} onChange={(e) => setEditColorSecondary(e.target.value)} className="w-6 h-6 border-0 bg-transparent rounded cursor-pointer" />
                            <input type="text" value={editColorSecondary} onChange={(e) => setEditColorSecondary(e.target.value)} className="w-full text-[10px] h-[26px] bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-1.5 border border-zinc-200/80 dark:border-white/10 font-mono focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-400 font-semibold block mb-1">Acento</span>
                          <div className="flex gap-1.5">
                            <input type="color" value={editColorAccent} onChange={(e) => setEditColorAccent(e.target.value)} className="w-6 h-6 border-0 bg-transparent rounded cursor-pointer" />
                            <input type="text" value={editColorAccent} onChange={(e) => setEditColorAccent(e.target.value)} className="w-full text-[10px] h-[26px] bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-1.5 border border-zinc-200/80 dark:border-white/10 font-mono focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-400 font-semibold block mb-1">Oro</span>
                          <div className="flex gap-1.5">
                            <input type="color" value={editColorGold} onChange={(e) => setEditColorGold(e.target.value)} className="w-6 h-6 border-0 bg-transparent rounded cursor-pointer" />
                            <input type="text" value={editColorGold} onChange={(e) => setEditColorGold(e.target.value)} className="w-full text-[10px] h-[26px] bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg px-1.5 border border-zinc-200/80 dark:border-white/10 font-mono focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </section>

          {/* Bento Cell 3: High Density Guest List */}
          <section id="guest-list" className="col-span-12 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300">
            
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-6 border-b border-zinc-200/80 dark:border-white/5 pb-6">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <UserList size={22} weight="duotone" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Lista de Invitados</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans mt-0.5">Administra los enlaces seguros y la asistencia</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:self-stretch xl:self-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="text-sm rounded-2xl border-0 bg-zinc-50 dark:bg-zinc-950 h-[42px] px-4.5 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full sm:w-64 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm"
                />
                
                <div className="flex rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-1.5 ring-1 ring-zinc-200/80 dark:ring-white/10 w-full sm:w-auto shadow-sm">
                  {(['all', 'pending', 'confirmed', 'declined'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer flex-1 text-center min-w-[65px] ${
                        statusFilter === st 
                          ? 'bg-purple-600 text-white shadow' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                      }`}
                    >
                      {st === 'all' ? 'Todos' : st === 'pending' ? 'Pend.' : st === 'confirmed' ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={copyAllLinks}
                  className="flex h-[42px] items-center justify-center gap-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-xs font-bold uppercase tracking-wider px-5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-sm transition cursor-pointer w-full sm:w-auto"
                >
                  <CopySimple size={16} />
                  Copiar Enlaces
                </button>
              </div>
            </div>

            {/* Inline Add Guest Form */}
            <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-12 gap-5 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl p-5 border border-zinc-200/60 dark:border-white/5 mb-6">
              <div className="sm:col-span-4">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Nombre del Invitado</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full text-xs h-[42px] rounded-xl border-0 bg-white dark:bg-zinc-900 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/5 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Pases</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={newGuestSlots}
                    onChange={(e) => setNewGuestSlots(parseInt(e.target.value) || 1)}
                    className="w-full text-xs h-[42px] rounded-xl border-0 bg-white dark:bg-zinc-900 py-0 pl-4 pr-12 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/5 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono shadow-sm"
                    placeholder="Pases"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Pases</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Género</label>
                <select
                  value={newGuestGender}
                  onChange={(e) => setNewGuestGender(e.target.value as 'm' | 'f' | 'n')}
                  className="w-full text-xs h-[42px] rounded-xl border-0 bg-white dark:bg-zinc-900 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="n">Familia / N</option>
                  <option value="f">Femenino</option>
                  <option value="m">Masculino</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">Celular (WhatsApp)</label>
                <input
                  type="tel"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="Celular (WhatsApp)"
                  className="w-full text-xs h-[42px] rounded-xl border-0 bg-white dark:bg-zinc-900 py-0 px-4 text-zinc-950 dark:text-white ring-1 ring-zinc-200/80 dark:ring-white/5 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono shadow-sm"
                />
              </div>
              <div className="sm:col-span-1 flex flex-col justify-end">
                <label className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-transparent mb-1.5">&nbsp;</label>
                <button
                  type="submit"
                  disabled={addingGuest}
                  className="w-full flex h-[42px] items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition py-0 cursor-pointer disabled:opacity-50 shadow-sm shadow-purple-500/20"
                >
                  {addingGuest ? <Spinner className="animate-spin" size={16} /> : <Plus size={16} />}
                </button>
              </div>
            </form>

            {/* Table / High Density List */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-zinc-600 dark:text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <th className="py-4.5 px-5">Nombre del Invitado</th>
                    <th className="py-4.5 px-5 text-center">Pases</th>
                    <th className="py-4.5 px-5 text-center">Género</th>
                    <th className="py-4.5 px-5">Contacto</th>
                    <th className="py-4.5 px-5 text-center">RSVP</th>
                    <th className="py-4.5 px-5 text-center">Asistirán</th>
                    <th className="py-4.5 px-5">Mensaje</th>
                    <th className="py-4.5 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-sans text-sm">
                        No se encontraron invitados en esta lista.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => (
                      <tr key={g.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 group transition-colors duration-150">
                        <td className="py-4 px-5 font-bold text-zinc-900 dark:text-white text-sm">
                          <span>{g.name}</span>
                        </td>
                        <td className="py-4 px-5 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300 text-xs">{g.max_slots}</td>
                        <td className="py-4 px-5 text-center">
                          <span className="text-[10px] font-bold bg-zinc-200/50 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-300/30 dark:border-white/5 text-zinc-700 dark:text-zinc-400">
                            {g.gender === 'm' ? 'H' : g.gender === 'f' ? 'M' : 'Fam'}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-zinc-500 text-xs">{g.phone_number || '-'}</td>
                        <td className="py-4 px-5 text-center">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block ${
                            g.rsvp_status === 'confirmed' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : g.rsvp_status === 'declined' 
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {g.rsvp_status === 'confirmed' ? 'Confirmado' : g.rsvp_status === 'declined' ? 'Declinó' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center font-mono font-bold text-zinc-900 dark:text-white text-xs">
                          {g.rsvp_status === 'confirmed' ? g.attending_count : '-'}
                        </td>
                        <td className="py-4 px-5 max-w-xs truncate text-zinc-500 dark:text-zinc-400 italic text-xs">
                          {g.guest_message || '-'}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => copyInviteLink(g.id)}
                              className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer shadow-sm ${
                                copiedId === g.id
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700'
                              }`}
                              title="Copiar enlace único"
                            >
                              {copiedId === g.id ? <Check size={14} /> : <LinkIcon size={14} />}
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(g.id)}
                              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 hover:border-red-500/40 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition flex items-center justify-center cursor-pointer"
                              title="Eliminar invitado"
                            >
                              <Trash size={14} />
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

          {/* Bento Cell 4: Live RSVP Activity Feed */}
          <section className="col-span-12 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-colors duration-300">
            
            <div className="flex items-center gap-3.5 mb-6 border-b border-zinc-200/80 dark:border-white/5 pb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Bell size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actividad en Vivo</h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans mt-0.5">Historial de respuestas e interacciones</p>
              </div>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {activities.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 italic py-6 text-center">Sin actividad registrada todavía.</p>
              ) : (
                activities.map((act) => (
                  <div 
                    key={`${act.id}-${act.time}`} 
                    className="flex items-center justify-between text-sm bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl p-4 border border-zinc-200/50 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 shadow-sm dark:shadow-none transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-2 h-2 rounded-full ${
                        act.type === 'confirm' ? 'bg-emerald-500' :
                        act.type === 'decline' ? 'bg-red-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white mr-1.5">{act.guestName}</span>{' '}
                        <span className="text-zinc-500 dark:text-zinc-400">{act.action}</span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{act.time}</span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

      </main>

    </div>
  );
}
