document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // CONFIGURATION & GUEST DATA PARSER
  // ==========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  
  // Default values if parameters are missing
  const defaultGuest = {
    name: "Invitado Especial",
    slots: 1,
    gender: "m" // 'm' for male (Querido/Invitado), 'f' for female (Querida/Invitada)
  };

  // 1. Get raw values from query params
  // ?n=shaidy-sierra&s=2&g=f
  // We also check URL path if rewrite rule is active, but query params is safest for static page.
  const rawName = urlParams.get("n") || urlParams.get("name") || "";
  const rawSlots = urlParams.get("s") || urlParams.get("slots") || "1";
  const rawGender = (urlParams.get("g") || urlParams.get("gender") || "m").toLowerCase();

  // 2. Format name: replace hyphens/underscores with space and capitalize each word
  let guestName = defaultGuest.name;
  if (rawName.trim()) {
    guestName = rawName
      .replace(/[-_]+/g, " ")
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // 3. Format slots
  let slots = parseInt(rawSlots, 10);
  if (isNaN(slots) || slots < 1) {
    slots = defaultGuest.slots;
  }

  // 4. Format gender
  const gender = (rawGender === "f" || rawGender === "female" || rawGender === "mujer") ? "f" : "m";

  // ==========================================================================
  // DOM ELEMENT INJECTIONS (Personalization)
  // ==========================================================================
  
  // Text content variables based on gender
  const salutation = gender === "f" ? "Querida" : "Querido";
  const guestAdjective = gender === "f" ? "invitada" : "invitado";
  const pronounHost = gender === "f" ? "acompañarme" : "acompañarme"; // standard in Spanish

  // Inject in Intro Gate (Envelope Screen)
  const introWelcomeEl = document.querySelector(".intro-welcome-text");
  if (introWelcomeEl) {
    introWelcomeEl.innerHTML = `${guestName}, tienes una invitación especial`;
  }

  // Inject in Personalized Letter (Section 2)
  const letterTitleSpan = document.querySelector(".letter-guest-title");
  if (letterTitleSpan) {
    letterTitleSpan.textContent = guestName;
  }
  
  const letterSalutationEl = document.querySelector(".letter-salutation");
  if (letterSalutationEl) {
    letterSalutationEl.textContent = `${salutation} ${guestName},`;
  }

  const letterAdjectiveEl = document.querySelector(".letter-adjective-invite");
  if (letterAdjectiveEl) {
    letterAdjectiveEl.textContent = guestAdjective;
  }

  // Inject in RSVP Card (Section 8)
  const rsvpGuestNameEl = document.querySelector(".rsvp-guest-name");
  if (rsvpGuestNameEl) {
    rsvpGuestNameEl.textContent = guestName;
  }

  const ticketValEl = document.querySelector(".ticket-val");
  const ticketSubEl = document.querySelector(".ticket-sub");
  if (ticketValEl && ticketSubEl) {
    if (slots === 1) {
      ticketValEl.textContent = "Cupo Personal Reservado";
      ticketSubEl.textContent = "(Pase individual, sin acompañantes)";
    } else {
      ticketValEl.textContent = `Pase para ${slots} Personas`;
      ticketSubEl.textContent = `(Cupo reservado para ti y ${slots - 1} acompañante${slots - 1 > 1 ? "s" : ""})`;
    }
  }

  // Dynamically set page title
  document.title = `Invitación para ${guestName} — Mis XV Años de Shaidy`;

  // Update Meta description tags for SEO/Preview sharing
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", `${guestName}, estás ${guestAdjective} a celebrar los XV Años de Shaidy. Sábado 21 de Noviembre, Discoteca 8cero4.`);
  }

  // ==========================================================================
  // WHATSAPP RSVP LINK GENERATOR
  // ==========================================================================
  const whatsappButton = document.querySelector(".btn-whatsapp");
  if (whatsappButton) {
    const phoneNumber = "573015181018"; // Host phone number
    const confirmationText = `¡Hola Shaidy!\n\nSoy *${guestName}* y con muchísima alegría confirmo mi asistencia a tu fiesta de XV Años.\n\n¡Cuenta conmigo, no me la pierdo por nada del mundo!`;
    const encodedText = encodeURIComponent(confirmationText);
    whatsappButton.setAttribute("href", `https://wa.me/${phoneNumber}?text=${encodedText}`);
    whatsappButton.setAttribute("target", "_blank");
    whatsappButton.setAttribute("rel", "noopener noreferrer");
  }

  // ==========================================================================
  // COUNTDOWN TIMER LOGIC
  // ==========================================================================
  // Target date: Sunday June 14, 2026 at 8:00 PM (Colombia Time / UTC -5)
  // Let's set it as a date string. We can use ISO format with offset: 2026-06-14T20:00:00-05:00
  const targetDate = new Date("2026-11-21T20:00:00-05:00").getTime();

  const daysVal = document.getElementById("countdown-days");
  const hoursVal = document.getElementById("countdown-hours");
  const minsVal = document.getElementById("countdown-mins");
  const secsVal = document.getElementById("countdown-secs");

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysVal) daysVal.textContent = "00";
      if (hoursVal) hoursVal.textContent = "00";
      if (minsVal) minsVal.textContent = "00";
      if (secsVal) secsVal.textContent = "00";
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    // Format numbers with leading zeroes
    if (daysVal) daysVal.textContent = d.toString().padStart(2, "0");
    if (hoursVal) hoursVal.textContent = h.toString().padStart(2, "0");
    if (minsVal) minsVal.textContent = m.toString().padStart(2, "0");
    if (secsVal) secsVal.textContent = s.toString().padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // DYNAMIC FLOWER PETALS FALL
  // ==========================================================================
  const petalsContainer = document.querySelector(".petals-container");
  const petalColors = [
    "var(--accent)", 
    "var(--secondary)", 
    "rgba(var(--accent-rgb), 0.5)", 
    "rgba(var(--secondary-rgb), 0.35)",
    "#ffccd5",
    "#fff3f5"
  ];

  function createPetal() {
    if (!petalsContainer) return;
    
    const petal = document.createElement("span");
    petal.classList.add("petal");
    
    // Random sizes, speeds, and color fills
    const size = Math.random() * 12 + 6; // 6px to 18px
    const duration = Math.random() * 6 + 7; // 7s to 13s
    const delay = Math.random() * 5; // 0s to 5s delay
    const left = Math.random() * 100; // 0% to 100% position
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];
    
    // Choose one of three different petal SVG designs
    const svgIndex = Math.floor(Math.random() * 3);
    let svgPath = "";
    if (svgIndex === 0) {
      // Rounded ellipse shape
      svgPath = `<ellipse cx="10" cy="10" rx="9" ry="5" fill="${color}" transform="rotate(${Math.random() * 90} 10 10)"></ellipse>`;
    } else if (svgIndex === 1) {
      // Leafy petal shape
      svgPath = `<path d="M0,10 C5,0 15,0 20,10 C15,20 5,20 0,10 Z" fill="${color}"></path>`;
    } else {
      // Sakura shape
      svgPath = `<path d="M10,0 C15,6 20,8 20,12 C20,17 15,20 10,20 C5,20 0,17 0,12 C0,8 5,6 10,0 Z" fill="${color}"></path>`;
    }
    
    petal.style.left = `${left}%`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    
    petal.innerHTML = `<svg viewBox="0 0 20 20" style="width: 100%; height: 100%">${svgPath}</svg>`;
    
    petalsContainer.appendChild(petal);
    
    // Remove petal after animation finishes to prevent memory leaking
    setTimeout(() => {
      petal.remove();
    }, (duration + delay) * 1000);
  }

  // Spawn initial set of petals
  for (let i = 0; i < 20; i++) {
    createPetal();
  }

  // Continuously spawn petals
  setInterval(createPetal, 450);

  // ==========================================================================
  // ENVELOPE OPENING INTERACTION & TRANSITION
  // ==========================================================================
  const envelopeBtn = document.querySelector(".envelope-stage");
  const envelope = document.querySelector(".envelope");
  const introGate = document.querySelector(".intro-gate");
  const mainContent = document.querySelector(".main-content");
  const audioControlBtn = document.querySelector(".audio-control-btn");
  
  // Background Audio Element setup
  const bgAudio = new Audio();
  // Using a royalty-free soft romantic instrumental piano track for quinceañeras
  bgAudio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
  bgAudio.loop = true;
  bgAudio.volume = 0.5;

  let isOpening = false;

  if (envelopeBtn && envelope && introGate && mainContent) {
    envelopeBtn.addEventListener("click", (e) => {
      // Prevent opening multiple times or if wax seal click is handled
      if (isOpening) return;
      isOpening = true;

      // 1. Trigger the opening CSS transitions
      envelope.classList.remove("envelope-idle");
      envelope.classList.add("is-open");

      // Hide the instruction text and fade header
      const instructionText = document.querySelector(".intro-instruction");
      if (instructionText) {
        instructionText.style.opacity = "0";
      }
      
      const introHeader = document.querySelector(".intro-header");
      if (introHeader) {
        introHeader.style.opacity = "0";
      }

      // Try playing the background music
      try {
        bgAudio.play()
          .then(() => {
            if (audioControlBtn) {
              audioControlBtn.classList.add("show", "playing");
            }
          })
          .catch(err => {
            console.log("Audio autoplay blocked or failed:", err);
            // Even if audio is blocked, the website opening continues!
            if (audioControlBtn) {
              audioControlBtn.classList.add("show");
            }
          });
      } catch (err) {
        console.error("Audio player failed:", err);
      }

      // 2. Wait for animations to complete (flap opens + letter rises = 2.3 seconds)
      setTimeout(() => {
        // Fade out Intro Gate
        introGate.classList.add("fade-out");
        
        // Show Main Content
        mainContent.classList.add("reveal");
        
        // Remove intro gate DOM element from layout after fade-out transition (1000ms)
        setTimeout(() => {
          introGate.remove();
        }, 1000);
      }, 2350);
    });
  }

  // ==========================================================================
  // FLOATING MUSIC PLAYER CONTROL BUTTON
  // ==========================================================================
  if (audioControlBtn) {
    audioControlBtn.addEventListener("click", () => {
      if (bgAudio.paused) {
        bgAudio.play()
          .then(() => {
            audioControlBtn.classList.add("playing");
            // Set SVG to Pause Icon
            audioControlBtn.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              </svg>
            `;
          });
      } else {
        bgAudio.pause();
        audioControlBtn.classList.remove("playing");
        // Set SVG to Play Icon
        audioControlBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
      }
    });
  }
});
