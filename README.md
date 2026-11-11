# 🛡️ Cyber Def — Centro Multiusuario de Estudio y Gestión Académica

Plataforma web de productividad y estudio universitario construida con **React 18 + Vite + Tailwind CSS + Firebase (Auth + Cloud Firestore)** con diseño futurista **Dashboard OS** (tarjetas translúcidas *glassmorphism*, fondos espaciales y acentos neón violeta/azul/cian).

---

## ✨ Nuevas Capacidades Arquitectónicas

### 1. Autenticación y Perfil de Usuario (Firebase Auth)
- **Login / Registro con Google** mediante ventana emergente (`signInWithPopup`).
- **Login / Registro con Correo Electrónico y Contraseña** con validación y manejo de errores.
- **Estado de sesión reactivo** con `onAuthStateChanged`.
- **Modo Invitado / Offline:** Si no se inicia sesión de inmediato o no hay conexión, la plataforma opera fluidamente con `LocalStorage`.
- Perfil del estudiante con avatar, nombre de usuario y botón de cierre de sesión integrado en el Sidebar y Header.

### 2. Flujo de Onboarding y Elección de Carrera
Al registrarse, el estudiante elige su modalidad de estudio:
- **Opción A (Plantilla Oficial):** *Licenciatura en Ciberdefensa* (FADENA / UNDEF). Clona automáticamente las 37 asignaturas de la carrera, correlatividades oficiales y las 3 materias del Curso Introductorio.
- **Opción B (Autogestión / Personalizada):** Permite ingresar el nombre de cualquier carrera, institución y crear dinámicamente las asignaturas iniciales.
- Los datos se guardan y sincronizan en Cloud Firestore bajo `users/{uid}/data/academic_data`.

### 3. Centro de Resúmenes & Artículos de Estudio
Sección dedicada en el sidebar (`/summaries`) para textos extensos de estudio y preparación de finales:
- **Editor con soporte completo de Markdown:** encabezados H1-H3, negritas, cursivas, listas, citas, checklists y bloques de código con botón de copia.
- **Campos estructurados:** Título, selección de materia asociada, etiquetas/tags, tiempo estimado de lectura en minutos y estado del artículo (*En progreso*, *Listo para repaso*, *Completado*).
- **Vista de lectura limpia** estilo artículo técnico / documentación.
- **Buscador interactivo** en tiempo real por palabra clave, materia o estado.
- **Exportación:** Botón para descargar cualquier artículo en formato `.md` estándar.
- **Persistencia en Firestore:** Guardado en la colección `users/{uid}/summaries`.
