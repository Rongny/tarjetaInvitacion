# Lacre RSVP - Plataforma SaaS de Invitaciones Premium

Este proyecto ha sido migrado de una estructura estática (HTML/CSS/JS) a una aplicación moderna e interactiva utilizando **Next.js 16 (React 19)** y **Supabase** como backend en tiempo real, empaquetado bajo un modelo SaaS.

## 🚀 Arquitectura del Proyecto

El sistema está construido con las siguientes tecnologías clave:
- **Framework Frontend:** Next.js 16 (App Router, soporte nativo de Server & Client Components).
- **Estilos:** Tailwind CSS v4 (compilado nativamente para rendimiento máximo).
- **Base de Datos y Autenticación:** Supabase (PostgreSQL) con sincronización en tiempo real y seguridad mediante **Row Level Security (RLS)** a nivel de fila.
- **Iconografía:** Phosphor Icons.

---

## 📁 Estructura del Directorio

```bash
tarjetaInvitacion/
├── public/                 # Archivos estáticos y recursos multimedia
│   └── hero-optimized.webp # Imagen principal optimizada para la invitación
├── src/
│   ├── app/                # Enrutamiento y vistas (App Router)
│   │   ├── dashboard/      # Panel de control Bento Grid del organizador/cliente
│   │   │   └── page.tsx    # CRUD de invitados, analíticas, edición de temas en tiempo real
│   │   ├── invitado/       # Vista interactiva segura de la invitación dinámica
│   │   │   └── [id]/       # Sub-ruta basada en UUID del invitado
│   │   │       ├── page.tsx            # Fetch SSR de la invitación
│   │   │       ├── CornerDecor.tsx     # Elementos florales decorativos SVG en GPU
│   │   │       └── GuestInvitationView.tsx # Animación 3D del sobre, música y formulario RSVP
│   │   ├── login/          # Página de inicio de sesión de clientes
│   │   ├── register/       # Registro de nuevos organizadores/negocios
│   │   ├── globals.css     # Estilos globales y hoja de animación de la invitación
│   │   ├── layout.tsx      # Configuración de tipografías premium y metadatos
│   │   └── page.tsx        # Landing page promocional de Lacre Platform
│   └── lib/
│       └── supabase.ts     # Cliente de inicialización de Supabase con fallback seguro
└── supabase_schema.sql     # Esquema SQL completo listo para ejecutar en Supabase
```

---

## 🗄️ Modelo de Base de Datos (`supabase_schema.sql`)

El backend en PostgreSQL organiza la información en tres capas principales:

1. **Clients (Clientes):** Perfil de los organizadores de eventos enlazados directamente a `auth.users` de Supabase.
   - Creación automatizada mediante el trigger database `on_auth_user_created` al registrarse.
2. **Events (Eventos):** Configuración del evento del cliente (anfitrión, fecha, dirección, colores del tema, carpeta de fotos, música).
   - Auto-aprovisionamiento automático de un evento de ejemplo por cliente en su primer ingreso al panel.
3. **Guests (Invitados):** Lista de invitados vinculados a un evento. Cada uno posee un `id` único generado mediante un **UUID seguro**.
   - Almacena el estado RSVP (`pending`, `confirmed`, `declined`), cupos reservados y pases utilizados.

---

## 🔐 Seguridad en Tiempo Real (Row Level Security - RLS)

Para garantizar la privacidad y robustez de los datos contra manipulación manual:
- **Clients:** Solo el propietario de la cuenta puede leer y actualizar su perfil comercial.
- **Events:** Acceso de lectura pública (requerido para desplegar la tarjeta al invitado). Acceso completo de escritura restringido a su respectivo `client_id`.
- **Guests:** Lectura pública mediante UUID individual. Permiso de actualización controlado para la confirmación de asistencia, validando automáticamente que los pases confirmados no excedan los cupos máximos asignados.

---

## ⚙️ Instalación y Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto y agrega tus claves del proyecto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 4. Compilación de producción
```bash
npm run build
```

---

## 🎭 Características Visuales e Interactividad

- **Intro Gate (Sobre 3D):** Animación en CSS 3D que simula un sobre premium con un sello lacre. Al romperse el sello con un clic del usuario, la carta con los datos emerge del bolsillo y se revela suavemente la invitación completa.
- **Reproducción de Música:** Control flotante para música de fondo en MP3 que se activa con el consentimiento del usuario tras abrir el sobre.
- **Lluvia de Pétalos:** Efecto continuo renderizado por GPU mediante manipulación del DOM con transformaciones matriciales 3D aleatorias.
- **RSVP Integrado:** Formulario de respuesta directo a la base de datos Supabase con actualización en tiempo real mediante WebSockets en el panel del cliente, apoyado con un botón de respaldo para enviar la misma confirmación por WhatsApp.
