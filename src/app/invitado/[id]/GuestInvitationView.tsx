'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import CornerDecor from './CornerDecor';

// SVG Helper Components to match the original design
const StarOrnament = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5">
    <path d="M12 2c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6z" fill="currentColor" opacity={0.5}></path>
    <path d="M12 22c-1.5-2-1.5-4 0-6 1.5 2 1.5 4 0 6z" fill="currentColor" opacity={0.5}></path>
    <path d="M2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0z" fill="currentColor" opacity={0.5}></path>
    <path d="M22 12c-2 1.5-4 1.5-6 0 2-1.5 4-1.5 6 0z" fill="currentColor" opacity={0.5}></path>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
  </svg>
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

export default function GuestInvitationView({ guest }: GuestInvitationViewProps) {
  const event = guest.events;
  
  // 1. Interactive States
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 2. RSVP Modal States
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
  
  // Local state mirror to update the UI instantly after submission
  const [currentRsvpStatus, setCurrentRsvpStatus] = useState(guest.rsvp_status);
  const [currentAttendingCount, setCurrentAttendingCount] = useState(guest.attending_count);

  // 3. Countdown States
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  // 4. Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 5. DOM Container Refs
  const petalsContainerRef = useRef<HTMLDivElement | null>(null);

  // 6. Dynamic Theme Configuration
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

  // 7. Initialize Audio Player
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

  // Toggle Audio Playback
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

  // 8. Open Envelope handler
  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Try playing background music automatically on user interaction
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Autoplay blocked on envelope click:', err));
    }

    // Wait for wax-break + flap-open + letter-rise animations to finish (2.3s)
    setTimeout(() => {
      setIsRevealed(true);
    }, 2350);
  };

  // 9. Countdown Timer Calculation
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
        seconds: s.toString().padStart(2, '0')
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.event_date]);

  // 10. Dynamic Petal Generator (Raw DOM implementation for GPU performance)
  useEffect(() => {
    const container = petalsContainerRef.current;
    if (!container) return;

    const petalColors = [
      'var(--accent)',
      'var(--secondary)',
      'rgba(191, 140, 224, 0.5)',
      'rgba(153, 100, 196, 0.35)',
      '#ffccd5',
      '#fff3f5'
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

      setTimeout(() => {
        petal.remove();
      }, (duration + delay) * 1000);
    };

    // Spawn initial petals
    for (let i = 0; i < 20; i++) {
      createPetal();
    }

    const interval = setInterval(createPetal, 450);
    return () => clearInterval(interval);
  }, []);

  // 11. RSVP Form submission handler
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const finalCount = rsvpStatus === 'confirmed' ? attendingCount : 0;
      const { error } = await supabase
        .from('guests')
        .update({
          rsvp_status: rsvpStatus,
          attending_count: finalCount,
          guest_message: guestMessage
        })
        .eq('id', guest.id);

      if (error) throw error;

      // Update local mirror state to reflect changes instantly on the cards
      setCurrentRsvpStatus(rsvpStatus);
      setCurrentAttendingCount(finalCount);

      setIsSubmitted(true);
      
      // Close modal automatically after showing success for 1.8 seconds
      setTimeout(() => {
        setShowRsvpModal(false);
        setIsSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar la confirmación. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate date formats for presentation
  const eventDateObj = new Date(event.event_date);
  const formattedDay = eventDateObj.toLocaleDateString('es-ES', { weekday: 'long' });
  const capitalizedDay = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1);
  const formattedDate = eventDateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  const formattedYear = eventDateObj.getFullYear();
  const formattedTime = eventDateObj.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Generate dynamic WhatsApp link for manual RSVP check/backup
  const whatsappNumber = '573015181018'; // Melany/Shaidy's number
  const rsvpMessage = rsvpStatus === 'confirmed'
    ? `¡Hola ${event.host_name}!\n\nSoy *${guest.name}* y confirmo con mucha alegría mi asistencia a tu fiesta de XV Años. Reservé *${attendingCount}* cupo(s).\n\n¡Ahí estaré sin falta!`
    : `¡Hola ${event.host_name}!\n\nSoy *${guest.name}*. Con mucha pena te escribo para contarte que no podré asistir a tu fiesta de XV Años. Te deseo una noche espectacular y te envío un fuerte abrazo.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rsvpMessage)}`;

  return (
    <div style={themeStyles} className="lacre-invitation min-h-screen">
      {/* Background Music Button (Revealed after envelope opens) */}
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

      {/* Flower Petals falling background container */}
      <div ref={petalsContainerRef} className="petals-container" aria-hidden="true"></div>

      {/* ==========================================================================
           INTRO GATE (ENVELOPE SCREEN)
           ========================================================================== */}
      {!isRevealed && (
        <div className={`intro-gate ${isOpen ? 'fade-out' : ''}`}>
          <div className="intro-radial-glow"></div>
          
          {/* Top Decorative Leafy SVG */}
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="intro-svg-decor" aria-hidden="true">
            <path d="M0 0 Q 60 30 90 80 Q 110 130 90 180" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"></path>
            <path d="M0 0 Q 40 60 80 90 Q 130 110 180 90" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"></path>
            <g transform="translate(50 45) rotate(20) scale(1.1)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
            <g transform="translate(75 75) rotate(50)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
            <g transform="translate(45 90) rotate(-10)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
            <g transform="translate(95 120) rotate(70)">
              <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="var(--accent)" opacity="0.6"></path>
            </g>
          </svg>

          <div className="intro-content">
            <div className="intro-header">
              <p className="intro-welcome-text">{guest.name}, tienes una invitación especial</p>
              <h1 className="intro-host-name">{event.host_name}</h1>
            </div>

            <button type="button" aria-label="Abrir invitación" onClick={handleOpenEnvelope} className="envelope-stage group">
              <div className={`envelope ${isOpen ? 'is-open' : 'envelope-idle'}`}>
                <div className="envelope-body" aria-hidden="true"></div>
                
                {/* Inside card preview */}
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

      {/* ==========================================================================
           MAIN CONTENT SECTIONS
           ========================================================================== */}
      <div className={`main-content ${isRevealed ? 'reveal' : ''}`}>
        
        {/* SECTION 1: HERO / PORTADA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" aria-hidden="true"></div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"></div>
          
          {/* Corner Flowers */}
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(1, 1)' }} />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, 1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 sm:h-40 sm:w-40" style={{ transform: 'scale(1, -1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 sm:h-40 sm:w-40" style={{ transform: 'scale(-1, -1)' }} />

          {/* Butterflies */}
          <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-[12%] top-[30%] h-8 w-10 animate-butterfly opacity-80 sm:h-10 sm:w-12" aria-hidden="true">
            <path d="M30 18 C30 18 20 5 12 5 C4 5 1 12 8 20 C1 28 4 35 12 35 C20 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <path d="M30 18 C30 18 40 5 48 5 C56 5 59 12 52 20 C59 28 56 35 48 35 C40 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <ellipse cx="30" cy="18" rx="1.6" ry="11" fill="oklch(0.30 0.05 305)"></ellipse>
            <path d="M30 18 Q 27 10 23 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
            <path d="M30 18 Q 33 10 37 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
          </svg>
          <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute right-[14%] top-[55%] h-7 w-9 animate-butterfly opacity-70 sm:h-9 sm:w-11" style={{ animationDelay: '1.5s' }} aria-hidden="true">
            <path d="M30 18 C30 18 20 5 12 5 C4 5 1 12 8 20 C1 28 4 35 12 35 C20 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <path d="M30 18 C30 18 40 5 48 5 C56 5 59 12 52 20 C59 28 56 35 48 35 C40 35 30 18 30 18 Z" fill="oklch(0.78 0.10 305)" opacity="0.88"></path>
            <ellipse cx="30" cy="18" rx="1.6" ry="11" fill="oklch(0.30 0.05 305)"></ellipse>
            <path d="M30 18 Q 27 10 23 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
            <path d="M30 18 Q 33 10 37 8" stroke="oklch(0.30 0.05 305)" strokeWidth="0.8" fill="none" strokeLinecap="round"></path>
          </svg>

          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-36 pb-20 text-center sm:pt-40">
            <p className="font-display text-xs sm:text-sm tracking-[0.5em] uppercase text-primary/80">Mis Quince Años</p>
            <div className="mt-6 mb-4">
              <span className="font-script text-7xl sm:text-9xl text-primary leading-none">{event.host_name}</span>
            </div>
            <p className="font-serif italic text-base sm:text-lg text-muted-foreground max-w-md text-balance leading-relaxed">
              &ldquo;Hay momentos en la vida que merecen celebrarse en grande, y este es uno de ellos.&rdquo;
            </p>
            
            <div className="flex items-center justify-center gap-3 text-primary/70 mt-8" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
              <StarOrnament />
              <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
              <StarOrnament />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
            </div>

            <div className="relative mt-10 w-full max-w-sm">
              <div className="absolute -inset-3 rounded-[2rem] border border-primary/30" aria-hidden="true"></div>
              <div className="absolute -inset-1 rounded-[1.6rem] border border-accent/40" aria-hidden="true"></div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] shadow-xl shadow-primary/20">
                <img 
                  alt={`Vestido de XV años de ${event.host_name}`} 
                  decoding="async" 
                  className="object-cover" 
                  style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent' }} 
                  src="/hero-optimized.webp"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" aria-hidden="true"></div>
              </div>
            </div>

            <p className="mt-10 font-display text-2xl sm:text-3xl text-foreground tracking-wide">
              {capitalizedDay} <span className="text-primary">·</span> {formattedDate}
            </p>
          </div>
        </section>

        {/* SECTION 2: CARTA DE INVITACIÓN */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl">
            <div className="relative rounded-2xl border border-primary/20 bg-card/85 px-6 py-12 sm:px-12 sm:py-16 shadow-lg shadow-primary/5 backdrop-blur-sm">
              <p className="text-center text-xs uppercase tracking-[0.4em] text-primary/80">Carta de Invitación</p>
              <h2 className="mt-4 text-center font-display text-3xl sm:text-4xl text-foreground text-balance">
                Para ti, <span className="text-primary font-bold">{guest.name}</span>, que eres parte de mi historia
              </h2>
              
              <div className="flex items-center justify-center gap-3 text-primary/70 my-8" aria-hidden="true">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
                <StarOrnament />
                <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
                <StarOrnament />
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
              </div>

              <div className="space-y-5 font-serif text-lg leading-relaxed text-foreground/90">
                <p className="text-center font-script text-3xl sm:text-4xl text-primary mb-2">{salutation} {guest.name},</p>
                <p className="first-letter:font-display first-letter:text-5xl first-letter:text-primary first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                  Hoy quiero invitarte a uno de los días más especiales de mi vida: la celebración de mis Quince Años, ese momento en el que dejo atrás la niñez para abrirle la puerta a una nueva etapa llena de sueños, ilusiones y promesas.
                </p>
                <p>
                  Quiero que este recuerdo sea inolvidable, y por eso no podía imaginarlo sin ti. Tu presencia es el regalo más bonito que podría pedir, porque las personas importantes de mi vida son las que hacen que esta noche tenga sentido.
                </p>
                <p>
                  Te espero con el corazón lleno de alegría, lista para bailar, reír y escribir juntos un capítulo que recordaremos para siempre.
                </p>
                <p className="text-right pt-4">
                  <span className="font-script text-4xl text-primary">Con cariño, {event.host_name}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CUENTA REGRESIVA */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-20 bg-secondary/40">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"></div>
          <ShimmerStars />
          
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Falta poco</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground text-balance">Cuenta regresiva para mi gran noche</h2>
            <p className="mt-3 font-serif italic text-muted-foreground">{capitalizedDay} {formattedDate} · {formattedTime}</p>
            
            <div className="mt-10">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                <div className="flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card/70 backdrop-blur-sm py-3 sm:py-5 shadow-sm">
                  <span className="font-display text-2xl sm:text-4xl text-primary tabular-nums">{timeLeft.days}</span>
                  <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">Días</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card/70 backdrop-blur-sm py-3 sm:py-5 shadow-sm">
                  <span className="font-display text-2xl sm:text-4xl text-primary tabular-nums">{timeLeft.hours}</span>
                  <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">Horas</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card/70 backdrop-blur-sm py-3 sm:py-5 shadow-sm">
                  <span className="font-display text-2xl sm:text-4xl text-primary tabular-nums">{timeLeft.minutes}</span>
                  <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">Minutos</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card/70 backdrop-blur-sm py-3 sm:py-5 shadow-sm">
                  <span className="font-display text-2xl sm:text-4xl text-primary tabular-nums">{timeLeft.seconds}</span>
                  <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">Segundos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DETALLES (WHEN AND WHERE) */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Detalles del Evento</p>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground">¿Cuándo y dónde?</h2>
              
              <div className="flex items-center justify-center gap-3 text-primary/70 my-8" aria-hidden="true">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
                <StarOrnament />
                <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
                <StarOrnament />
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {/* Card 1: Fecha */}
              <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-card/70 px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-secondary/50 text-primary">
                  <CalendarIcon />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Fecha</p>
                <p className="mt-2 font-display text-xl text-foreground">{formattedDate}</p>
                <p className="mt-1 font-serif italic text-sm text-muted-foreground">{capitalizedDay} · {formattedYear}</p>
              </div>

              {/* Card 2: Hora */}
              <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-card/70 px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-secondary/50 text-primary">
                  <ClockIcon />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Hora</p>
                <p className="mt-2 font-display text-xl text-foreground">{formattedTime}</p>
                <p className="mt-1 font-serif italic text-sm text-muted-foreground">Recepción a las 7:30 PM</p>
              </div>

              {/* Card 3: Lugar */}
              <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-card/70 px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-secondary/50 text-primary">
                  <MapPinIcon />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lugar</p>
                <p className="mt-2 font-display text-xl text-foreground">{event.location_name}</p>
                <p className="mt-1 font-serif italic text-sm text-muted-foreground">{event.location_address}</p>
                {event.location_map_url && (
                  <a 
                    href={event.location_map_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-4 inline-flex items-center gap-2 font-serif text-sm italic text-primary underline-offset-4 hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: DRESS CODE */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24 bg-secondary/30">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"></div>
          
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Código de Vestimenta</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground">Dress Code</h2>
            
            <div className="flex items-center justify-center gap-3 text-primary/70 my-8" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
              <StarOrnament />
              <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
              <StarOrnament />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-12">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full border border-primary/40 shadow-lg shadow-primary/20 sm:h-20 sm:w-20 flex items-center justify-center text-white/90" style={{ backgroundColor: 'oklch(0.72 0.13 305)' }} aria-label="Color lila reservado">
                  <CrossIcon />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-sm sm:text-base uppercase tracking-[0.25em] text-primary font-bold">
                  <span>Lila</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-destructive font-bold">Reservado</p>
              </div>

              <div className="h-16 w-px bg-primary/25" aria-hidden="true"></div>

              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 shadow-lg shadow-primary/10 sm:h-20 sm:w-20" aria-label="Vestimenta Formal">
                  <TuxedoIcon />
                </div>
                <div className="mt-3 flex items-center justify-center text-sm sm:text-base uppercase tracking-[0.25em] text-primary font-bold">
                  <span>Formal</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Traje / Vestido</p>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-md font-serif text-lg leading-relaxed text-foreground/80 text-pretty">
              El color <span className="font-semibold text-primary">lila</span> está reservado únicamente para la quinceañera. Te pedimos con cariño elegir cualquier otro tono para acompañarme en esta noche especial.
            </p>
            <p className="mt-4 font-serif italic text-sm text-muted-foreground">Vestimenta formal</p>
          </div>
        </section>

        {/* SECTION 6: LLUVIA DE SOBRES */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24">
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Acerca del Regalo</p>
            
            <div className="mt-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-shimmer rounded-full bg-primary/20 blur-2xl" aria-hidden="true"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-card shadow-lg shadow-primary/10 animate-float-slow">
                  <EnvelopeGiftIcon />
                </div>
              </div>
            </div>

            <h2 className="mt-8 font-display text-3xl sm:text-4xl text-foreground">Lluvia de Sobres</h2>
            <p className="mt-5 font-serif text-lg leading-relaxed text-foreground/80 text-pretty">
              Si deseas regalarme algo, lo mejor es un sobre con tu cariño dentro. Será de gran ayuda para seguir construyendo mis sueños, y atesoraré cada gesto con muchísimo amor.
            </p>
            <p className="mt-6 font-script text-3xl text-primary">¡Gracias de corazón!</p>
          </div>
        </section>

        {/* SECTION 7: COMPARTE EL RECUERDO */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24 bg-secondary/40">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"></div>
          
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Comparte el Recuerdo</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground text-balance">Sube tus fotos a la carpeta</h2>
            
            <div className="flex items-center justify-center gap-3 text-primary/70 my-8" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
              <StarOrnament />
              <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
              <StarOrnament />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
            </div>

            <p className="mx-auto max-w-md font-serif text-base leading-relaxed text-foreground/80 text-pretty">
              Quiero conservar cada instante de esta noche desde tu mirada. Escanea el código QR y sube las fotos y videos que tomes durante la fiesta a la carpeta compartida.
            </p>

            <div className="mt-10 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 rounded-[1.4rem] border border-primary/30" aria-hidden="true"></div>
                <div className="absolute -inset-0.5 rounded-[1.1rem] border border-accent/40" aria-hidden="true"></div>
                <div className="relative rounded-[1rem] border border-primary/20 bg-card p-5 shadow-xl shadow-primary/15">
                  <img 
                    alt="Código QR para subir fotos a la carpeta compartida" 
                    loading="lazy" 
                    width="240" 
                    height="240" 
                    decoding="async" 
                    className="h-56 w-56 sm:h-60 sm:w-60" 
                    style={{ color: 'transparent' }} 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&color=4A2A6B&bgcolor=FBF7FB&data=${encodeURIComponent(event.photos_folder_url || 'https://photos.app.goo.gl/WNkq2bs2K4JbYF4o6')}`}
                  />
                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
                    <QrCodeOutlineIcon />
                    <span>Escanea</span>
                  </div>
                </div>
              </div>
            </div>

            {event.photos_folder_url && (
              <a 
                href={event.photos_folder_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-8 inline-flex items-center gap-2 font-serif text-sm italic text-primary underline-offset-4 hover:underline"
              >
                o toca aquí para abrir la carpeta directamente
                <ExternalLinkIcon />
              </a>
            )}
            
            <p className="mt-6 font-serif italic text-xs text-muted-foreground">Fotos · Videos · Cada recuerdo cuenta</p>
          </div>
        </section>

        {/* SECTION 8: CONFIRMACIÓN RSVP (SECURE SYSTEM) */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24" style={{ paddingBottom: '120px' }}>
          <CornerDecor className="pointer-events-none absolute top-0 left-0 h-38 w-38 sm:h-50 sm:w-50" />
          <CornerDecor className="pointer-events-none absolute top-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleX(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 left-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scaleY(-1)' }} />
          <CornerDecor className="pointer-events-none absolute bottom-0 right-0 h-38 w-38 sm:h-50 sm:w-50" style={{ transform: 'scale(-1, -1)' }} />

          <div className="relative mx-auto max-w-2xl">
            <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-b from-card to-secondary/40 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-xl shadow-primary/10">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Confirma tu Asistencia</p>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl text-foreground text-balance">Hazme saber que estarás ahí</h2>
              <p className="mt-4 font-serif italic text-muted-foreground max-w-md mx-auto text-balance">
                Por favor, confirma tu asistencia directamente en nuestra plataforma para coordinar los lugares en el salón.
              </p>
              
              <div className="flex items-center justify-center gap-3 text-primary/70 my-8" aria-hidden="true">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40"></span>
                <StarOrnament />
                <span className="font-script text-2xl text-primary leading-none -mt-1">XV</span>
                <StarOrnament />
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40"></span>
              </div>

              <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                <div className="text-center">
                  <p className="font-script text-3xl sm:text-4xl text-primary leading-tight">{guest.name}</p>
                </div>
                
                <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-card/70 px-6 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">Tus cupos disponibles</p>
                  
                  {currentRsvpStatus === 'pending' ? (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="font-display text-4xl text-primary font-bold">{guest.max_slots}</span>
                      </div>
                      <p className="text-sm uppercase tracking-[0.15em] text-foreground font-bold">
                        {guest.max_slots === 1 ? 'Cupo Personal Reservado' : 'Cupos Reservados'}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/80 font-semibold">
                        {guest.max_slots === 1 ? '(Pase individual, sin acompañantes)' : `(Cupo reservado para ti y hasta ${guest.max_slots - 1} acompañantes)`}
                      </p>
                    </>
                  ) : currentRsvpStatus === 'confirmed' ? (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="font-display text-4xl text-green-600 font-bold">{currentAttendingCount}</span>
                      </div>
                      <p className="text-sm uppercase tracking-[0.15em] text-green-600 font-bold">Asistencia Confirmada</p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/80 font-semibold">
                        {currentAttendingCount === 1 ? '1 cupo reservado' : `${currentAttendingCount} cupos reservados`}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="font-display text-4xl text-red-600 font-bold">0</span>
                      </div>
                      <p className="text-sm uppercase tracking-[0.15em] text-red-600 font-bold">No podrás asistir</p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/80 font-semibold">
                        Has cancelado tu asistencia
                      </p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setShowRsvpModal(true);
                  }}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all outline-none px-6 h-14 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 text-base tracking-wide"
                >
                  <WhatsAppIcon />
                  {currentRsvpStatus === 'pending' ? 'Confirmar Asistencia' : 'Modificar Confirmación'}
                </button>

                <p className="text-xs text-muted-foreground/80 text-center text-balance">
                  {currentRsvpStatus === 'pending' 
                    ? 'Al confirmar, tu pase quedará registrado de forma oficial e inalterable en el sistema.' 
                    : 'Puedes modificar tu confirmación en cualquier momento si cambian tus planes.'}
                </p>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-center">
              <div className="w-20 h-px bg-primary/20 mb-3" aria-hidden="true"></div>
              <p className="text-xs uppercase tracking-[0.40em] text-primary/60">XV Años · {event.host_name}</p>
            </div>
          </div>
        </section>
      </div>

      {/* ==========================================================================
           RSVP DOCK MODAL (GLASSMORPHISM)
           ========================================================================== */}
      {showRsvpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md bg-zinc-950/90 text-white rounded-[2rem] p-2.5 ring-1 ring-white/10 shadow-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-zinc-900/40 p-6 sm:p-8 flex flex-col relative">
              
              {/* Close Button */}
              <button 
                type="button"
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
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
                  <div className="text-center mb-2">
                    <h4 className="font-display text-xl font-medium tracking-tight">Confirmar Asistencia</h4>
                    <p className="text-zinc-400 text-sm mt-1">{guest.name}</p>
                  </div>

                  {submitError && (
                    <div className="bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-lg p-3">
                      {submitError}
                    </div>
                  )}

                  {/* 1. Selector de Estado */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">¿Asistirás al evento?</label>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          rsvpStatus === 'confirmed'
                            ? 'bg-purple-900/30 border-purple-500 text-purple-200 shadow-md'
                            : 'bg-zinc-800/30 border-zinc-700/50 text-zinc-400'
                        }`}
                        onClick={() => setRsvpStatus('confirmed')}
                      >
                        Sí, asistiré
                      </button>
                      <button
                        type="button"
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                          rsvpStatus === 'declined'
                            ? 'bg-red-950/30 border-red-500 text-red-200 shadow-md'
                            : 'bg-zinc-800/30 border-zinc-700/50 text-zinc-400'
                        }`}
                        onClick={() => setRsvpStatus('declined')}
                      >
                        No podré asistir
                      </button>
                    </div>
                  </div>

                  {/* 2. Selector de Cupos (Solo si confirma) */}
                  {rsvpStatus === 'confirmed' && guest.max_slots > 1 && (
                    <div className="flex flex-col gap-2 transition-all duration-300">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Cantidad de cupos a utilizar (Máx. {guest.max_slots}):
                      </label>
                      <div className="flex items-center justify-between bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-2.5 mt-1">
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-zinc-700/40 hover:bg-zinc-700 text-white rounded-lg transition-colors font-bold text-lg"
                          onClick={() => setAttendingCount(prev => Math.max(1, prev - 1))}
                          disabled={attendingCount <= 1}
                        >
                          -
                        </button>
                        <span className="font-mono text-xl font-bold">{attendingCount}</span>
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-zinc-700/40 hover:bg-zinc-700 text-white rounded-lg transition-colors font-bold text-lg"
                          onClick={() => setAttendingCount(prev => Math.min(guest.max_slots, prev + 1))}
                          disabled={attendingCount >= guest.max_slots}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Mensaje para la Quinceañera */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Mensaje para {event.host_name} (Opcional):
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/70 transition-colors placeholder:text-zinc-600 resize-none mt-1"
                      placeholder="Deja un mensaje especial..."
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                    />
                  </div>

                  {/* 4. Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold transition-all duration-200 mt-2 shadow-lg shadow-purple-500/10 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Guardar Confirmación'
                    )}
                  </button>
                </form>
              ) : (
                // Success Presentation
                <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                  <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center animate-bounce">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-display text-2xl font-semibold text-green-400">¡Confirmación Guardada!</h4>
                  <p className="text-zinc-400 text-sm max-w-xs">
                    Tu respuesta ha sido registrada en el sistema de {event.host_name}.
                  </p>
                  
                  {/* WhatsApp redirection prompt */}
                  <div className="h-px w-full bg-zinc-800 my-2"></div>
                  
                  <p className="text-xs text-zinc-500 px-4">
                    También puedes enviarle un WhatsApp para notificarle personalmente:
                  </p>
                  
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25d366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-1 shadow-md shadow-green-500/10"
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
