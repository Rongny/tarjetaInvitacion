# Invitación Digital de XV Años - Melany (Interactiva)

Este proyecto es una invitación web premium interactiva para una celebración de 15 Años (Quinceañera). Cuenta con una pantalla de presentación (Intro Gate) que simula un sobre 3D cerrado con un sello de cera (lacre). Al hacer clic en el sello, este se rompe, la solapa del sobre se abre y la carta con los detalles iniciales emerge en 3D, revelando luego con una transición fluida el contenido completo de la invitación.

## Características Principales

1. **Apertura de Sobre Interactiva:** Sello de cera pulsante con animación 3D realista al romperse y solapa que gira con perspectiva física.
2. **Personalización Dinámica (Sin Servidor):** Lee los datos del invitado directamente desde los parámetros de la URL para personalizar nombres, pases y género gramatical.
3. **Música de Fondo:** Reproductor de audio integrado con botón flotante (Play/Pause) que se activa automáticamente al abrir el sobre.
4. **Efecto de Lluvia de Pétalos:** Pétalos de flores (sakura/rosas) cayendo continuamente con variaciones aleatorias en tamaño y velocidad.
5. **Cuenta Regresiva Activa:** Contador en tiempo real calculando días, horas, minutos y segundos para el evento.
6. **Dress Code / Lluvia de Sobres / Álbum Compartido:** Secciones informativas detalladas con enlace dinámico para subir fotos a Google Fotos y código QR.
7. **RSVP por WhatsApp:** Botón dinámico que pre-redacta un mensaje de confirmación para enviar directamente al organizador por WhatsApp.

---

## 🎨 Personalización de Colores (Temas)

Para facilitar la personalización de la paleta de colores cuando el organizador defina el tema oficial, se han centralizado los colores como **variables CSS** al inicio del archivo `styles.css`.

Para cambiar todo el esquema de color del sitio, abre [styles.css](file:///d:/Proyectos/tarjetaInvitacion/styles.css) y edita los valores dentro del bloque `:root`:

```css
:root {
  /* Modifica estos valores hexadecimales o nombres de color */
  --primary: #4a2a6b;         /* Color principal oscuro (botones, títulos importantes) */
  --primary-rgb: 74, 42, 107; /* Mismo color en formato RGB (usado para transparencias) */
  --secondary: #9964c4;       /* Color medio (cuerpo de tarjeta, detalles) */
  --secondary-rgb: 153, 100, 196;
  --accent: #bf8ce0;          /* Color claro de acento (bordes, fondos suaves) */
  --accent-rgb: 191, 140, 224;
  --accent-soft: #f4e8f9;     /* Fondo ultra-suave para cajas de texto */
  --bg-main: #fbf7fb;         /* Fondo general de la página web */
  --text-main: #2c1a3f;       /* Color del texto de lectura principal */
  --text-muted: #6b5883;      /* Color para subtítulos y textos secundarios */
  --gold: #d4b26f;            /* Color dorado para líneas decorativas y bordes elegantes */

  /* Sello de cera (Lacre) */
  --seal-base: #a10015;       /* Rojo/Bermellón base */
  --seal-medium: #fa5d36;
  --seal-highlight: #ffc9a0;
}
```

---

## 🔗 Estructura de Parámetros URL (Generar Enlaces)

El script lee tres parámetros clave de la URL para adaptar la invitación a cada persona:

1. **`n` (Nombre del Invitado):** Nombre completo del invitado. Los guiones `-` o guiones bajos `_` se convertirán automáticamente en espacios y se capitalizarán.
   * *Ejemplo:* `?n=shaidy-sierra` se convertirá en `Shaidy Sierra`.
2. **`s` (Cupos / Pases):** Número de pases reservados para este invitado.
   * *Ejemplo:* `?s=1` mostrará "Cupo Personal Reservado".
   * *Ejemplo:* `?s=3` mostrará "Pase para 3 Personas".
3. **`g` (Género):** Utilizado para la concordancia en español en los textos ("Querida/o" e "invitada/o").
   * *Ejemplo:* `?g=f` (Femenino) -> "Querida Shaidy Sierra", "estás invitada".
   * *Ejemplo:* `?g=m` (Masculino) -> "Querido Carlos Mendoza", "estás invitado".

### Ejemplos de Enlaces Completos:
* Para Shaidy Sierra (Femenino, 1 Pase):
  `https://tu-invitacion.site/?n=shaidy-sierra&s=1&g=f`
* Para Juan Carlos Pérez (Masculino, 4 Pases):
  `https://tu-invitacion.site/?n=juan-carlos-perez&s=4&g=m`

---

## 🛠️ Cómo Generar Enlaces Masivamente (Google Sheets)

Para enviar los enlaces personalizados por WhatsApp de forma masiva a tus invitados, puedes usar una hoja de cálculo con la siguiente fórmula:

1. Crea las siguientes columnas:
   * **A:** Nombre del invitado (ej. `Shaidy Sierra`)
   * **B:** Cupos (ej. `1`)
   * **C:** Género (`f` o `m`)
   * **D:** URL Base (ej. `https://15anosmelany.site/`)
2. En la columna **E** coloca la siguiente fórmula para generar el enlace personalizado automáticamente:
   ```excel
   =CONCATENAR(D2, "?n=", SUSTITUIR(MINUSC(A2), " ", "-"), "&s=", B2, "&g=", C2)
   ```
3. Copia la fórmula hacia abajo y ¡listo! Tendrás un enlace exclusivo para cada invitado en tu lista.

---

## 🚀 Despliegue (Hosting Gratuito)

Al ser un sitio web estático (HTML, CSS y JS puro), puedes alojarlo gratis y en pocos minutos en:
*   **GitHub Pages:** Crea un repositorio, sube los archivos y activa GitHub Pages en la sección *Settings > Pages*.
*   **Netlify / Vercel:** Arrastra y suelta la carpeta del proyecto en sus plataformas de despliegue rápido.
*   **Firebase Hosting:** Configura el CLI de Firebase y despliega usando `firebase deploy`.
