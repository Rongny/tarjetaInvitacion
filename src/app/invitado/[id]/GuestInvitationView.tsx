'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import CornerDecor from './CornerDecor';
import SideDecor from './SideDecor';

// ─── SVG Helper Components ───────────────────────────────────────────────────

const StarOrnament = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5">
    <path d="M12 2c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6z" fill="currentColor" opacity={0.5}></path>
    <path d="M12 22c-1.5-2-1.5-4 0-6 1.5 2 1.5 4 0 6z" fill="currentColor" opacity={0.5}></path>
    <path d="M2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0z" fill="currentColor" opacity={0.5}></path>
    <path d="M22 12c-2 1.5-4 1.5-6 0 2-1.5 4-1.5 6 0z" fill="currentColor" opacity={0.5}></path>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
  </svg>
);

const GoldDivider = () => (
  <div className="flex items-center justify-center gap-4 w-full" style={{ marginTop: '35px', marginBottom: '35px' }} aria-hidden="true">
    <span className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-primary/30"></span>
    <div className="flex items-center gap-2 text-primary/60">
      <StarOrnament />
      <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
      <StarOrnament />
    </div>
    <span className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-primary/30"></span>
  </div>
);

const ShimmerStars = () => (
  <svg viewBox="0 0 200 200" fill="none" className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-shimmer opacity-50" aria-hidden="true">
    <g transform="translate(20 30) scale(1)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(60 80) scale(0.7)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(120 40) scale(1.2)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(170 90) scale(0.8)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(90 130) scale(1)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(150 160) scale(0.9)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
    <g transform="translate(30 170) scale(1.1)"><path d="M0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="oklch(0.78 0.10 85)" opacity="0.7"></path></g>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <rect x="3" y="5" width="18" height="16" rx="2"></rect>
    <path d="M8 3v4M16 3v4M3 10h18"></path>
    <circle cx="12" cy="15" r="1.5" fill="currentColor"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 7v5l3 2"></path>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
    <path d="M12 22s7-7.58 7-13a7 7 0 0 0-14 0c0 5.42 7 13 7 13z"></path>
    <circle cx="12" cy="9" r="2.5"></circle>
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
    <line x1="5" y1="5" x2="19" y2="19"></line>
    <line x1="19" y1="5" x2="5" y2="19"></line>
  </svg>
);

const TuxedoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-9 w-9 text-primary sm:h-11 sm:w-11" aria-hidden="true">
    <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
  </svg>
);

const EnvelopeGiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-11 w-11 text-primary" aria-hidden="true">
    <rect x="3" y="6" width="18" height="13" rx="1.5"></rect>
    <path d="M3 7l9 7 9-7"></path>
    <path d="M12 14l-2 3M12 14l2 3" opacity={0.5}></path>
  </svg>
);

const QrCodeOutlineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    <path d="M14 14h3v3M21 14v3M14 21h3M21 19v2h-2"></path>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path d="M14 3h7v7M21 3l-9 9M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.555-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l.241.383-1 3.65 3.733-.992zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path>
  </svg>
);

// ─── Type Definitions ─────────────────────────────────────────────────────────

interface EventDetails {
  host_name: string;
  event_type: string;
  event_date: string;
  location_name: string;
  location_address: string;
  location_map_url: string;
  photos_folder_url: string;
  background_music_url: string;
  theme_colors: Record<string, string>;
}

interface Guest {
  id: string;
  name: string;
  max_slots: number;
  gender: string;
  rsvp_status: string;
  attending_count: number;
  guest_message: string;
  events: EventDetails;
}

interface GuestInvitationViewProps {
  guest: Guest;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GuestInvitationView({ guest }: GuestInvitationViewProps) {
  const event = guest.events;

  // Interactive States
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // RSVP Modal States
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined'>(
    guest.rsvp_status === 'declined' ? 'declined' : 'confirmed'
  );
  const [attendingCount, setAttendingCount] = useState<number>(
    guest.attending_count > 0 ? guest.attending_count : guest.max_slots
  );
  const [guestMessage, setGuestMessage] = useState<string>(guest.guest_message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Local state mirror for instant UI updates
  const [currentRsvpStatus, setCurrentRsvpStatus] = useState(guest.rsvp_status);
  const [currentAttendingCount, setCurrentAttendingCount] = useState(guest.attending_count);

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // Client-side date strings (avoid SSR hydration mismatch with toLocaleString)
  const [formattedDay, setFormattedDay] = useState('');
  const [capitalizedDay, setCapitalizedDay] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedYear, setFormattedYear] = useState('');
  const [formattedTime, setFormattedTime] = useState('');

  // Audio & DOM Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const petalsContainerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Theme Configuration
  const themeColors = event.theme_colors || {};
  const themeStyles = {
    '--primary': themeColors.primary || '#4a2a6b',
    '--primary-rgb': themeColors.primary_rgb || '74, 42, 107',
    '--secondary': themeColors.secondary || '#9964c4',
    '--secondary-rgb': themeColors.secondary_rgb || '153, 100, 196',
    '--accent': themeColors.accent || '#bf8ce0',
    '--accent-rgb': themeColors.accent_rgb || '191, 140, 224',
    '--accent-soft': themeColors.accent_soft || '#f4e8f9',
    '--bg-main': themeColors.bg_main || '#fbf7fb',
    '--text-main': themeColors.text_main || '#2c1a3f',
    '--text-muted': themeColors.text_muted || '#6b5883',
    '--gold': themeColors.gold || '#d4b26f',
    '--seal-base': themeColors.seal_base || '#a10015',
    '--seal-medium': themeColors.seal_medium || '#fa5d36',
    '--seal-highlight': themeColors.seal_highlight || '#ffc9a0',
    '--seal-text': themeColors.seal_text || '#fff0da',
  } as React.CSSProperties;

  // Gender agreement texts
  const isFemale = guest.gender === 'f';
  const salutation = isFemale ? 'Querida' : 'Querido';
  const guestAdjective = isFemale ? 'invitada' : 'invitado';

  // Initialize Audio
  useEffect(() => {
    const audioUrl = event.background_music_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [event.background_music_url]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Audio playback blocked:', err));
    }
  };

  // Open Envelope
  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Autoplay blocked:', err));
    }
    setTimeout(() => setIsRevealed(true), 2350);
  };

  // Countdown Timer
  useEffect(() => {
    const targetTime = new Date(event.event_date).getTime();
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;
      if (difference <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
      });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.event_date]);

  // Dynamic Petal Generator
  useEffect(() => {
    const container = petalsContainerRef.current;
    if (!container) return;
    const petalColors = [
      'var(--accent)', 'var(--secondary)',
      'rgba(191, 140, 224, 0.5)', 'rgba(153, 100, 196, 0.35)',
      '#ffccd5', '#fff3f5',
    ];
    const createPetal = () => {
      if (!petalsContainerRef.current) return;
      const petal = document.createElement('span');
      petal.classList.add('petal');
      const size = Math.random() * 12 + 6;
      const duration = Math.random() * 6 + 7;
      const delay = Math.random() * 5;
      const left = Math.random() * 100;
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];
      const svgIndex = Math.floor(Math.random() * 3);
      let svgPath = '';
      if (svgIndex === 0) {
        svgPath = `<ellipse cx="10" cy="10" rx="9" ry="5" fill="${color}" transform="rotate(${Math.random() * 90} 10 10)"></ellipse>`;
      } else if (svgIndex === 1) {
        svgPath = `<path d="M0,10 C5,0 15,0 20,10 C15,20 5,20 0,10 Z" fill="${color}"></path>`;
      } else {
        svgPath = `<path d="M10,0 C15,6 20,8 20,12 C20,17 15,20 10,20 C5,20 0,17 0,12 C0,8 5,6 10,0 Z" fill="${color}"></path>`;
      }
      petal.style.left = `${left}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.innerHTML = `<svg viewBox="0 0 20 20" style="width: 100%; height: 100%">${svgPath}</svg>`;
      petalsContainerRef.current.appendChild(petal);
      setTimeout(() => petal.remove(), (duration + delay) * 1000);
    };
    for (let i = 0; i < 20; i++) createPetal();
    const interval = setInterval(createPetal, 450);
    return () => clearInterval(interval);
  }, []);

  // RSVP Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const finalCount = rsvpStatus === 'confirmed' ? attendingCount : 0;
      const { error } = await supabase
        .from('guests')
        .update({ rsvp_status: rsvpStatus, attending_count: finalCount, guest_message: guestMessage })
        .eq('id', guest.id);
      if (error) throw error;
      setCurrentRsvpStatus(rsvpStatus);
      setCurrentAttendingCount(finalCount);
      setIsSubmitted(true);
      setTimeout(() => {
        setShowRsvpModal(false);
        setIsSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date Formatting — computed client-side to avoid SSR hydration mismatch
  useEffect(() => {
    const eventDateObj = new Date(event.event_date);
    const day = eventDateObj.toLocaleDateString('es-ES', { weekday: 'long' });
    setFormattedDay(day);
    setCapitalizedDay(day.charAt(0).toUpperCase() + day.slice(1));
    setFormattedDate(eventDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }));
    setFormattedYear(String(eventDateObj.getFullYear()));
    setFormattedTime(eventDateObj.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true }));
  }, [event.event_date]);

  const whatsappNumber = '573015181018';
  const rsvpMessage = rsvpStatus === 'confirmed'
    ? `¡Hola ${event.host_name}!\n\nSoy *${guest.name}* y confirmo con mucha alegría mi asistencia a tu fiesta de XV Años. Reservé *${attendingCount}* cupo(s).\n\n¡Ahí estaré sin falta!`
    : `¡Hola ${event.host_name}!\n\nSoy *${guest.name}*. Con mucha pena te escribo para contarte que no podré asistir a tu fiesta de XV Años. Te deseo una noche espectacular y te envío un fuerte abrazo.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rsvpMessage)}`;

  return (
    <div style={themeStyles} className="lacre-invitation min-h-screen">

      {/* ── Floating Music Button ──────────────────────────────────────────── */}
      <button
        type="button"
        className={`audio-control-btn ${isOpen ? 'show' : ''} ${isPlaying ? 'playing' : ''}`}
        onClick={toggleMusic}
        aria-label="Control de Música"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* ── Falling Petals ─────────────────────────────────────────────────── */}
      <div ref={petalsContainerRef} className="petals-container" aria-hidden="true"></div>

      {/* ══════════════════════════════════════════════════════════════════════
           INTRO GATE — ENVELOPE SCREEN
          ══════════════════════════════════════════════════════════════════════ */}
      {!isRevealed && (
        <div className={`intro-gate ${isOpen ? 'fade-out' : ''}`}>
          <div className="intro-radial-glow"></div>

          {/* Decorative leaf corner SVG */}
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="intro-svg-decor" aria-hidden="true">
            <path d="M0 0 Q 60 30 90 80 Q 110 130 90 180" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"></path>
            <path d="M0 0 Q 40 60 80 90 Q 130 110 180 90" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"></path>
            <g transform="translate(50 45) rotate(20) scale(1.1)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
            <g transform="translate(75 75) rotate(50)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
          </svg>

          <div className="intro-content">
            <div className="intro-header">
              <p className="intro-welcome-text">{toTitleCase(guest.name)}, tienes una invitación especial</p>
              <h1 className="intro-host-name">{event.host_name}</h1>
            </div>

            <button type="button" aria-label="Abrir invitación" onClick={handleOpenEnvelope} className="envelope-stage group">
              <div className={`envelope ${isOpen ? 'is-open' : 'envelope-idle'}`}>
                <div className="envelope-body" aria-hidden="true"></div>
                <div className="envelope-letter" aria-hidden="true">
                  <div className="envelope-letter-content">
                    <p className="letter-title">Estás {guestAdjective} a</p>
                    <h2 className="letter-main">Mis XV</h2>
                    <div className="letter-divider"></div>
                    <p className="letter-date">21 • Noviembre • 2026</p>
                  </div>
                </div>
                <div className="envelope-pocket" aria-hidden="true"></div>
                <div className="envelope-flap" aria-hidden="true">
                  <div className="envelope-flap-bg"></div>
                  <div className="envelope-flap-inner"></div>
                  <div className="wax-seal">
                    <span className="wax-seal-letter">S</span>
                  </div>
                </div>
              </div>

              <span className="intro-instruction">
                <span className="intro-instruction-line" aria-hidden="true"></span>
                Toca para abrir
                <span className="intro-instruction-line" aria-hidden="true"></span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           MAIN CONTENT — INVITATION CARD SECTIONS
          ══════════════════════════════════════════════════════════════════════ */}
      <div className={`main-content ${isRevealed ? 'reveal' : ''}`}>

        {/* ── Section 1: HERO / PORTADA ───────────────────────────────────── */}
        <section className="hero-section">
          {/* Hero gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background/60 to-background" aria-hidden="true"></div>

          {/* Corner flowers */}
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(1, 1)' }} />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, 1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 sm:h-44 sm:w-44" style={{ transform: 'scale(1, -1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 sm:h-44 sm:w-44" style={{ transform: 'scale(-1, -1)' }} />

          {/* Floating butterflies */}
          <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-[10%] top-[28%] h-8 w-10 animate-butterfly opacity-75 sm:h-10 sm:w-12" aria-hidden="true">
            <path d="M30 18 C30 18 20 5 12 5 C4 5 1 12 8 20 C1 28 4 35 12 35 C20 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <path d="M30 18 C30 18 40 5 48 5 C56 5 59 12 52 20 C59 28 56 35 48 35 C40 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <ellipse cx="30" cy="18" rx="1.6" ry="11" fill="oklch(0.30 0.05 305)"></ellipse>
            <path d="M30 18 Q 27 10 23 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
            <path d="M30 18 Q 33 10 37 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
          </svg>
          <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-[12%] top-[52%] h-7 w-9 animate-butterfly opacity-65 sm:h-9 sm:w-11" style={{ animationDelay: '1.5s' }} aria-hidden="true">
            <path d="M30 18 C30 18 20 5 12 5 C4 5 1 12 8 20 C1 28 4 35 12 35 C20 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <path d="M30 18 C30 18 40 5 48 5 C56 5 59 12 52 20 C59 28 56 35 48 35 C40 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <ellipse cx="30" cy="18" rx="1.6" ry="11" fill="oklch(0.30 0.05 305)"></ellipse>
          </svg>

          {/* Hero Content */}
          <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 text-center">
            {/* Eyebrow label */}
            <p className="hero-greeting">
              Mis Quince Años
            </p>

            {/* Main script name */}
            <h1 className="hero-main-title">
              {event.host_name}
            </h1>

            {/* Italic quote */}
            <p className="hero-description">
              &ldquo;Hay momentos en la vida que merecen celebrarse en grande, y este es uno de ellos.&rdquo;
            </p>

            {/* Ornament divider */}
            <GoldDivider />

            {/* Photo frame */}
            <div className="relative w-full max-w-[260px] sm:max-w-[300px]" style={{ marginTop: '45px', marginBottom: '45px' }}>
              <div className="absolute -inset-3 rounded-[2rem] border border-primary/25" aria-hidden="true"></div>
              <div className="absolute -inset-1 rounded-[1.6rem] border border-accent/35" aria-hidden="true"></div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] shadow-2xl shadow-primary/20">
                <img
                  alt={`Vestido de XV años de ${event.host_name}`}
                  decoding="async"
                  className="object-cover"
                  style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent' }}
                  src="/hero-optimized.webp"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" aria-hidden="true"></div>
              </div>
            </div>

            {/* Date label below photo */}
            <div className="hero-date-block" style={{ marginTop: '15px' }}>
              <span>{capitalizedDay}</span>
              <span className="hero-date-divider" aria-hidden="true"></span>
              <span>{formattedDate}</span>
              <span className="hero-date-divider" aria-hidden="true"></span>
              <span>{formattedYear}</span>
            </div>
          </div>
        </section>

        {/* ── Section 2: CARTA DE INVITACIÓN ─────────────────────────────── */}
        <section className="letter-section">
          {/* Side flower decorations (visible on desktop only) */}
          <SideDecor className="pointer-events-none absolute left-4 top-0 h-full w-24 hidden lg:block" />
          <SideDecor className="pointer-events-none absolute right-4 top-0 h-full w-24 hidden lg:block" style={{ transform: 'scaleX(-1)' }} />

          <div className="relative mx-auto max-w-3xl px-6 w-full">
            
            {/* Letter card container wraps everything */}
            <div className="letter-box">
              {/* Corner decorations inside the card */}
              <CornerDecor className="pointer-events-none absolute top-3 left-3 h-16 w-16 sm:h-20 sm:w-20" />
              <CornerDecor className="pointer-events-none absolute top-3 right-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scaleX(-1)' }} />
              <CornerDecor className="pointer-events-none absolute bottom-3 left-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scaleY(-1)' }} />
              <CornerDecor className="pointer-events-none absolute bottom-3 right-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scale(-1, -1)' }} />

              {/* Section heading */}
              <div className="text-center">
                <p className="section-tag">
                  Carta de Invitación
                </p>
                <h2 className="section-title">
                  Para ti, <span className="text-primary font-bold">{toTitleCase(guest.name)}</span>, que
                  <br />
                  eres parte de mi historia
                </h2>
              </div>

              <GoldDivider />

              {/* Letter content */}
              <div className="mt-8 text-left">
                <div className="letter-salutation">
                  {salutation} {toTitleCase(guest.name)},
                </div>

                <div className="letter-body">
                  <p className="mb-4">
                    Hoy quiero invitarte a uno de los días más especiales de mi vida: la celebración de mis Quince Años, ese momento en el que dejo atrás la niñez para abrirle la puerta a una nueva etapa llena de sueños, ilusiones y promesas.
                  </p>

                  <p className="mb-4">
                    Quiero que este recuerdo sea inolvidable, y por eso no podía imaginarlo sin ti. Tu presencia es el regalo más bonito que podría pedir, porque las personas importantes de mi vida son las que hacen que esta noche tenga sentido.
                  </p>

                  <p>
                    Te espero con el corazón lleno de alegría, lista para bailar, reír y escribir juntos un capítulo que recordaremos para siempre.
                  </p>
                </div>

                <p className="text-right" style={{ paddingRight: '40px' }}>
                  <span className="letter-signature">Con cariño, {event.host_name}</span>
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 3: CUENTA REGRESIVA ────────────────────────────────── */}
        <section className="relative overflow-hidden bg-secondary/35">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />
          <ShimmerStars />

          <div className="relative mx-auto max-w-lg text-center">
            <p className="section-tag">
              Falta poco
            </p>
            <h2 className="section-title">
              Cuenta regresiva para mi gran noche
            </h2>
            <p className="font-serif italic text-sm text-muted-foreground mb-12">
              {capitalizedDay} {formattedDate} · {formattedTime}
            </p>

            {/* Countdown cards */}
            <div className="countdown-container">
              {[
                { value: timeLeft.days, label: 'Días' },
                { value: timeLeft.hours, label: 'Horas' },
                { value: timeLeft.minutes, label: 'Min' },
                { value: timeLeft.seconds, label: 'Seg' },
              ].map(({ value, label }) => (
                <div key={label} className="countdown-card">
                  <span className="countdown-number">
                    {value}
                  </span>
                  <span className="countdown-label">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: DETALLES ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl">
            <div className="text-center">
              <p className="section-tag">
                Detalles del Evento
              </p>
              <h2 className="section-title">
                ¿Cuándo y dónde?
              </h2>
            </div>

            <GoldDivider />

            <div className="details-grid">
              {/* Fecha */}
              <div className="details-card">
                <div className="details-card-icon">
                  <CalendarIcon />
                </div>
                <p className="details-card-title">Fecha</p>
                <p className="details-card-val">{formattedDate}</p>
                <p className="details-card-sub">{capitalizedDay} · {formattedYear}</p>
              </div>

              {/* Hora */}
              <div className="details-card">
                <div className="details-card-icon">
                  <ClockIcon />
                </div>
                <p className="details-card-title">Hora</p>
                <p className="details-card-val">{formattedTime}</p>
                <p className="details-card-sub">Recepción a las 7:30 PM</p>
              </div>

              {/* Lugar */}
              <div className="details-card full-width">
                <div className="details-card-icon">
                  <MapPinIcon />
                </div>
                <p className="details-card-title">Lugar</p>
                <p className="details-card-val">{event.location_name}</p>
                <p className="details-card-sub mb-3">{event.location_address}</p>
                {event.location_map_url && (
                  <a
                    href={event.location_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Ver en Google Maps
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: DRESS CODE ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-secondary/30">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-xl text-center">
            <p className="section-tag">
              Código de Vestimenta
            </p>
            <h2 className="section-title">
              Dress Code
            </h2>

            <GoldDivider />

            {/* Color swatches */}
            <div className="flex items-center justify-center gap-12 sm:gap-16 mb-10">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/15 flex items-center justify-center text-white/90"
                  style={{ backgroundColor: 'oklch(0.72 0.13 305)' }}
                  aria-label="Color lila reservado"
                >
                  <CrossIcon />
                </div>
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-primary font-bold">Lila</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-bold mt-0.5">Reservado</p>
                </div>
              </div>

              <div className="h-16 w-px bg-primary/20" aria-hidden="true"></div>

              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-full border-2 border-primary/25 bg-primary/5 shadow-lg shadow-primary/10"
                  aria-label="Vestimenta Formal"
                >
                  <TuxedoIcon />
                </div>
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-primary font-bold">Formal</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-0.5">Traje / Vestido</p>
                </div>
              </div>
            </div>

            {/* Dress code description */}
            <div className="dress-code-alert">
              <h3 className="dress-code-alert-title">Traje Formal Obligatorio</h3>
              <p className="dress-code-alert-desc">
                El color <span className="font-semibold text-primary">lila</span> está reservado únicamente para la quinceañera. Te pedimos con cariño elegir cualquier otro tono para acompañarme en esta noche especial.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 6: LLUVIA DE SOBRES ─────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-lg text-center">
            <p className="section-tag">
              Acerca del Regalo
            </p>

            {/* Floating envelope icon */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 animate-shimmer rounded-full bg-primary/15 blur-2xl" aria-hidden="true"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/25 bg-card shadow-xl shadow-primary/10 animate-float-slow">
                  <EnvelopeGiftIcon />
                </div>
              </div>
            </div>

            <h2 className="section-title">
              Lluvia de Sobres
            </h2>

            <div className="letter-box mb-8" style={{ paddingBottom: '45px' }}>
              <p className="font-serif text-base leading-relaxed text-foreground/80 text-pretty mb-10">
                Si deseas regalarme algo, lo mejor es un sobre con tu cariño dentro. Será de gran ayuda para seguir construyendo mis sueños, y atesoraré cada gesto con muchísimo amor.
              </p>
              <p className="font-script text-3xl text-primary" style={{ marginTop: '16px' }}>¡Gracias de corazón!</p>
            </div>
          </div>
        </section>

        {/* ── Section 7: COMPARTE EL RECUERDO ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-secondary/35">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-44 w-44 sm:h-56 sm:w-56" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-lg text-center">
            <p className="section-tag">
              Comparte el Recuerdo
            </p>
            <h2 className="section-title">
              Sube tus fotos a la carpeta
            </h2>

            <GoldDivider />

            <p className="mx-auto max-w-sm font-serif text-base leading-relaxed text-foreground/75 text-pretty mb-12">
              Quiero conservar cada instante de esta noche desde tu mirada. Escanea el código QR y sube las fotos y videos que tomes durante la fiesta a la carpeta compartida.
            </p>

            {/* QR code with elegant frame */}
            <div className="flex justify-center mb-8">
              <div className="qr-container">
                <img
                  alt="Código QR para subir fotos a la carpeta compartida"
                  loading="lazy"
                  width="220"
                  height="220"
                  decoding="async"
                  className="qr-code-img"
                  style={{ color: 'transparent' }}
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&color=4A2A6B&bgcolor=FBF7FB&data=${encodeURIComponent(event.photos_folder_url || 'https://photos.app.goo.gl/WNkq2bs2K4JbYF4o6')}`}
                />
              </div>
            </div>

            {event.photos_folder_url && (
              <a
                href={event.photos_folder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                Abrir carpeta de fotos
                <ExternalLinkIcon />
              </a>
            )}

            <p className="mt-5 font-serif italic text-xs text-muted-foreground">Fotos · Videos · Cada recuerdo cuenta</p>
          </div>
        </section>

        {/* ── Section 8: CONFIRMACIÓN RSVP ────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ paddingBottom: '130px' }}>
          {/* Side flower decorations (visible on desktop only) */}
          <SideDecor className="pointer-events-none absolute left-4 top-0 h-full w-24 hidden lg:block" />
          <SideDecor className="pointer-events-none absolute right-4 top-0 h-full w-24 hidden lg:block" style={{ transform: 'scaleX(-1)' }} />

          <div className="relative mx-auto max-w-3xl px-6 w-full">
            <div className="rsvp-card text-center">
              {/* Corner decorations inside the card */}
              <CornerDecor className="pointer-events-none absolute top-3 left-3 h-16 w-16 sm:h-20 sm:w-20" />
              <CornerDecor className="pointer-events-none absolute top-3 right-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scaleX(-1)' }} />
              <CornerDecor className="pointer-events-none absolute bottom-3 left-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scaleY(-1)' }} />
              <CornerDecor className="pointer-events-none absolute bottom-3 right-3 h-16 w-16 sm:h-20 sm:w-20" style={{ transform: 'scale(-1, -1)' }} />
              <p className="section-tag">
                Confirma tu Asistencia
              </p>
              <h2 className="section-title">
                Hazme saber que estarás ahí
              </h2>
              <p className="font-serif italic text-sm text-muted-foreground max-w-xs mx-auto text-balance leading-relaxed">
                Por favor, confirma tu asistencia para coordinar los lugares en el salón.
              </p>

              <GoldDivider />

              <div className="w-full max-w-sm mx-auto flex flex-col gap-5">
                {/* Guest name */}
                <p className="rsvp-guest-name">{toTitleCase(guest.name)}</p>

                {/* RSVP status card / Ticket container */}
                <div className="ticket-container">
                  <p className="ticket-title">
                    Tus cupos disponibles
                  </p>

                  {currentRsvpStatus === 'pending' ? (
                    <>
                      <span className="ticket-val">{guest.max_slots}</span>
                      <p className="ticket-sub mt-1">
                        {guest.max_slots === 1 ? 'Cupo Personal Reservado' : 'Cupos Reservados'}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {guest.max_slots === 1 ? '(Pase individual, sin acompañantes)' : `(Para ti y hasta ${guest.max_slots - 1} acompañantes)`}
                      </p>
                    </>
                  ) : currentRsvpStatus === 'confirmed' ? (
                    <>
                      <span className="ticket-val text-green-600">{currentAttendingCount}</span>
                      <p className="ticket-sub text-green-600 font-bold mt-1">Asistencia Confirmada</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {currentAttendingCount === 1 ? '1 cupo reservado' : `${currentAttendingCount} cupos reservados`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="ticket-val text-red-500">0</span>
                      <p className="text-xs uppercase tracking-[0.15em] text-red-500 font-bold mt-1">No podrás asistir</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">Has cancelado tu asistencia</p>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setShowRsvpModal(true);
                  }}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all outline-none px-6 h-14 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-xl shadow-primary/25 text-base tracking-wide"
                >
                  <WhatsAppIcon />
                  {currentRsvpStatus === 'pending' ? 'Confirmar Asistencia' : 'Modificar Confirmación'}
                </button>

                <p className="text-[11px] text-muted-foreground/75 text-center text-balance leading-relaxed">
                  {currentRsvpStatus === 'pending'
                    ? 'Al confirmar, tu pase quedará registrado de forma oficial en el sistema.'
                    : 'Puedes modificar tu confirmación en cualquier momento si cambian tus planes.'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 9: FINAL FOOTER SECTION ───────────────────────────────── */}
        <section className="relative overflow-hidden bg-secondary/30" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 sm:h-56 sm:w-56" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-xl text-center px-6">
            <GoldDivider />
            
            <p className="font-script text-5xl text-primary" style={{ marginTop: '30px', marginBottom: '24px' }}>Te espero</p>

            <p className="text-[11px] font-display uppercase tracking-[0.45em] text-primary/70 font-semibold" style={{ marginBottom: '18px' }}>
              {event.host_name} · XV AÑOS
            </p>

            <p className="text-xs font-serif italic text-muted-foreground" style={{ marginTop: '18px' }}>
              {event.event_date ? event.event_date.split('T')[0].split('-').reverse().join(' - ') : ''}
            </p>
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           RSVP MODAL — GLASSMORPHISM
          ══════════════════════════════════════════════════════════════════════ */}
      {showRsvpModal && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full sm:max-w-md bg-zinc-950/90 text-white rounded-t-[2rem] sm:rounded-[2rem] p-2.5 ring-1 ring-white/10 shadow-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-zinc-900/40 p-6 sm:p-8 flex flex-col relative">

              {/* Drag handle (mobile) */}
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5 sm:hidden" aria-hidden="true"></div>

              {/* Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
                onClick={() => setShowRsvpModal(false)}
                aria-label="Cerrar modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {!isSubmitted ? (
                <form onSubmit={handleRsvpSubmit} className="flex flex-col gap-5">
                  <div className="text-center mb-1">
                    <h4 className="font-display text-xl font-medium tracking-tight">Confirmar Asistencia</h4>
                    <p className="text-zinc-400 text-sm mt-1.5">{toTitleCase(guest.name)}</p>
                  </div>

                  {submitError && (
                    <div className="bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-xl p-3.5">
                      {submitError}
                    </div>
                  )}

                  {/* ¿Asistirás? */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">¿Asistirás al evento?</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        className={`py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          rsvpStatus === 'confirmed'
                            ? 'bg-purple-900/30 border-purple-500 text-purple-200 shadow-md'
                            : 'bg-zinc-800/30 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
                        }`}
                        onClick={() => setRsvpStatus('confirmed')}
                      >
                        Sí, asistiré
                      </button>
                      <button
                        type="button"
                        className={`py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          rsvpStatus === 'declined'
                            ? 'bg-red-950/30 border-red-500 text-red-200 shadow-md'
                            : 'bg-zinc-800/30 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
                        }`}
                        onClick={() => setRsvpStatus('declined')}
                      >
                        No podré asistir
                      </button>
                    </div>
                  </div>

                  {/* Cupos */}
                  {rsvpStatus === 'confirmed' && guest.max_slots > 1 && (
                    <div className="flex flex-col gap-2 transition-all duration-300">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Cantidad de cupos (Máx. {guest.max_slots}):
                      </label>
                      <div className="flex items-center justify-between bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-2.5 mt-1">
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-zinc-700/40 hover:bg-zinc-700 text-white rounded-lg transition-colors font-bold text-lg disabled:opacity-40"
                          onClick={() => setAttendingCount(prev => Math.max(1, prev - 1))}
                          disabled={attendingCount <= 1}
                        >
                          −
                        </button>
                        <span className="font-mono text-2xl font-bold">{attendingCount}</span>
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-zinc-700/40 hover:bg-zinc-700 text-white rounded-lg transition-colors font-bold text-lg disabled:opacity-40"
                          onClick={() => setAttendingCount(prev => Math.min(guest.max_slots, prev + 1))}
                          disabled={attendingCount >= guest.max_slots}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mensaje */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Mensaje para {event.host_name} <span className="normal-case tracking-normal text-zinc-500">(Opcional)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-colors placeholder:text-zinc-600 resize-none mt-1"
                      placeholder="Deja un mensaje especial..."
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white py-4 rounded-xl font-semibold transition-all duration-200 mt-2 shadow-lg shadow-purple-500/15 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Guardar Confirmación'
                    )}
                  </button>
                </form>
              ) : (
                /* Success Screen */
                <div className="flex flex-col items-center justify-center py-8 text-center gap-5">
                  <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center animate-bounce">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display text-2xl font-semibold text-green-400">¡Confirmación Guardada!</h4>
                    <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                      Tu respuesta ha sido registrada en el sistema de {event.host_name}.
                    </p>
                  </div>

                  <div className="h-px w-full bg-zinc-800 my-1"></div>

                  <p className="text-xs text-zinc-500 px-4">
                    También puedes enviarle un WhatsApp para notificarle personalmente:
                  </p>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25d366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-green-500/10"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.177-1.356A9.896 9.896 0 0 0 12.01 22c5.507 0 9.991-4.478 9.992-9.984C22.002 6.537 17.518 2 12.012 2zm5.72 14.331c-.247.696-1.424 1.357-1.954 1.446-.481.08-1.107.135-3.238-.752-2.729-1.134-4.492-3.903-4.629-4.087-.137-.182-1.11-1.472-1.11-2.81 0-1.337.702-1.996.951-2.259.248-.263.546-.329.728-.329l.522.004c.166.002.392-.064.614.472.227.549.778 1.9.847 2.037.069.137.115.297.023.48-.092.183-.138.297-.275.457-.137.16-.289.356-.413.48-.137.137-.282.286-.12.563.163.277.725 1.196 1.553 1.93.125.112.24.218.347.312.98.868 1.705 1.138 2.037 1.272.331.135.525.112.72-.112.196-.226.847-.986.974-1.327.127-.341.253-.29.426-.226.173.064 1.101.517 1.288.61.187.093.312.137.358.218.046.08.046.467-.2.163z"/>
                    </svg>
                    Avisar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
