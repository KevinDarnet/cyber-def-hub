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

---

## 🛠️ Configuración de Firebase

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Completa las variables con las credenciales de tu proyecto en la [Consola de Firebase](https://console.firebase.google.com/):
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```
3. En la consola de Firebase:
   - Habilita **Authentication** (métodos *Google* y *Correo electrónico/contraseña*).
   - Crea tu base de datos **Cloud Firestore**.
   - Despliega las reglas de seguridad provistas en `firestore.rules`.

---

## 🔒 Reglas de Seguridad de Firestore (`firestore.rules`)

El archivo [`firestore.rules`](./firestore.rules) garantiza que ningún estudiante pueda leer o modificar datos de otro usuario:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🚀 Comandos del Proyecto

- **Iniciar en desarrollo local:**
  ```bash
  npm run dev
  ```
- **Compilar para producción:**
  ```bash
  npm run build
  ```
- **Desplegar a Firebase Hosting:**
  ```bash
  npm run deploy
  ```
# cyber-def-hub
