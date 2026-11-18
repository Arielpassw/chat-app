# Chat App — Aplicación móvil de mensajería

Aplicación móvil de mensajería desarrollada con **Ionic**, **Angular** y **Capacitor**, utilizando **Supabase** como plataforma principal de backend y **Firebase Cloud Messaging (FCM)** para el envío de notificaciones push.

El proyecto permite establecer la infraestructura necesaria para gestionar usuarios, perfiles, conversaciones, mensajes, archivos multimedia y comunicación en tiempo real.

---

## 1. Información general

| Característica | Descripción |
| :--- | :--- |
| **Nombre del proyecto** | Chat App |
| **Tipo de aplicación** | Aplicación móvil de mensajería |
| **Framework** | Ionic + Angular |
| **Lenguaje** | TypeScript |
| **Plataforma móvil** | Android |
| **Entorno de ejecución** | Capacitor |
| **Backend** | Supabase |
| **Base de datos** | PostgreSQL |
| **Autenticación** | Supabase Auth |
| **Almacenamiento** | Supabase Storage |
| **Tiempo real** | Supabase Realtime |
| **Notificaciones push** | Firebase Cloud Messaging |
| **Funciones backend adicionales** | Supabase Edge Functions |

---

## 2. Tecnologías utilizadas

### Frontend y aplicación móvil
* **Ionic Angular:** desarrollo de interfaces móviles.
* **Angular:** arquitectura de componentes y servicios.
* **TypeScript:** lenguaje principal.
* **Capacitor:** integración con funcionalidades nativas de Android.
* **Capacitor Preferences:** almacenamiento de preferencias locales.
* **Capacitor Geolocation:** acceso a la ubicación del dispositivo.
* **@capacitor-firebase/messaging:** integración con Firebase Cloud Messaging.

### Backend y servicios
* **Supabase:** plataforma principal de backend.
* **PostgreSQL:** gestión de la información.
* **Supabase Auth:** registro, autenticación y administración de sesiones.
* **Supabase Storage:** almacenamiento de imágenes y archivos.
* **Supabase Realtime:** recepción de cambios en tiempo real.
* **Supabase Edge Functions:** ejecución de operaciones del lado del servidor.
* **Firebase Cloud Messaging:** envío de notificaciones push a dispositivos Android.

> **Distribución de responsabilidades:** Supabase administra los usuarios, perfiles, chats, mensajes y archivos. Firebase se utiliza exclusivamente para las notificaciones push mediante FCM.

---

## 3. Arquitectura del sistema

La aplicación utiliza una arquitectura cliente-servidor.

```text
                    APLICACIÓN MÓVIL
                   Ionic + Angular
                          |
                          |
                 Servicios de Angular
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
     Supabase Auth   Supabase DB    Supabase Storage
          |               |               |
          v               v               v
       Usuarios       PostgreSQL       Archivos
                      y perfiles
                          |
                          v
                   Supabase Realtime
                          |
                          v
                  Mensajes en tiempo real
```

### Flujo de notificaciones push

```text
             Aplicación Android
                    |
                    v
             Firebase Messaging
                    |
                    v
              Token FCM
                    |
                    v
              Supabase DB
               fcm_tokens
                    |
                    v
          Supabase Edge Function
            enviar-notificacion
                    |
                    v
          Firebase Cloud Messaging
                    |
                    v
             Dispositivo receptor
```

### Responsabilidades de cada plataforma

| Plataforma | Responsabilidad |
| :--- | :--- |
| **Ionic Angular** | Interfaz y lógica del cliente |
| **Capacitor** | Funcionalidades nativas del dispositivo |
| **Supabase Auth** | Autenticación de usuarios |
| **Supabase Database** | Información de usuarios, chats y mensajes |
| **Supabase Storage** | Archivos, imágenes y avatares |
| **Supabase Realtime** | Actualizaciones en tiempo real |
| **Supabase Edge Functions** | Procesamiento seguro de operaciones del servidor |
| **Firebase Cloud Messaging** | Notificaciones push |

---

## 4. Estructura del proyecto

La organización principal del código se encuentra dentro de `src/app`.

```text
chat-app/
│
├── android/
│   └── app/
│       └── google-services.json
│
├── src/
│   ├── app/
│   │   ├── guards/
│   │   │   └── auth-guard.ts
│   │   │
│   │   ├── models/
│   │   │   ├── archivo.model.ts
│   │   │   ├── mensaje.model.ts
│   │   │   ├── sala.model.ts
│   │   │   └── usuario.model.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── notificaciones.ts
│   │   │   ├── preferencias.ts
│   │   │   ├── sala.ts
│   │   │   ├── storage.ts
│   │   │   ├── supabase.ts
│   │   │   ├── ubicacion.ts
│   │   │   └── usuario.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   ├── chats/
│   │   │   └── ...
│   │   │
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   │
│   └── environments/
│       ├── environment.example.ts
│       └── environment.prod.example.ts
│
├── supabase/
│   ├── .gitignore
│   ├── config.toml
│   │
│   └── functions/
│       └── enviar-notificacion/
│           ├── index.ts
│           ├── deno.json
│           └── .npmrc
│
├── capacitor.config.ts
├── ionic.config.json
├── package.json
└── README.md
```

> *Nota: La estructura de `pages/` puede ampliarse conforme se integren las funcionalidades del frontend.*

---

## 5. Servicios del backend

Los servicios centralizan las operaciones que realiza la aplicación con Supabase y las funcionalidades nativas del dispositivo.

| Servicio | Responsabilidad |
| :--- | :--- |
| `supabase.ts` | Inicialización y acceso al cliente de Supabase |
| `auth.ts` | Registro, inicio de sesión, cierre de sesión y sesiones |
| `usuario.ts` | Administración y consulta de perfiles |
| `sala.ts` | Creación y administración de chats y participantes |
| `chat.ts` | Envío, consulta, edición, eliminación y recepción de mensajes |
| `storage.ts` | Subida, consulta y eliminación de archivos |
| `notificaciones.ts` | Permisos, tokens FCM y escucha de notificaciones |
| `ubicacion.ts` | Acceso a la ubicación del dispositivo |
| `preferencias.ts` | Administración de preferencias locales |

### 5.1. Autenticación
El servicio `Auth` utiliza Supabase Auth.
* Registrar usuarios.
* Iniciar sesión mediante correo y contraseña.
* Cerrar sesión.
* Obtener la sesión actual.
* Consultar el usuario autenticado.
* Recuperar contraseñas.
* Escuchar cambios en el estado de autenticación.

> *Los perfiles se crean automáticamente mediante un trigger de PostgreSQL asociado al registro de usuarios.*

### 5.2. Usuarios y perfiles
El servicio `UsuarioService` permite:
* Crear perfiles cuando sea necesario.
* Consultar el perfil del usuario autenticado.
* Consultar perfiles por identificador.
* Actualizar información personal.
* Buscar usuarios por nombre o username (utiliza la función PostgreSQL `buscar_perfiles`).

### 5.3. Salas y conversaciones
El servicio `SalaService` permite:
* Crear conversaciones individuales y grupales.
* Consultar las conversaciones del usuario.
* Agregar participantes.
* Consultar los participantes de una conversación.
* Actualizar información de una sala.
* Actualizar la última lectura de mensajes.

> *La creación inicial de una sala y su administrador utiliza la función transaccional `crear_sala_transaccional`.*

### 5.4. Mensajes
El servicio `ChatService` gestiona las operaciones de mensajería:
* Enviar mensajes.
* Consultar mensajes de una conversación.
* Editar mensajes.
* Eliminar mensajes mediante eliminación lógica.
* Escuchar nuevos mensajes y cambios mediante Supabase Realtime.
* Dejar de escuchar una conversación.
* Cerrar todos los canales de tiempo real.

**Tipos de mensajes contemplados:**

| Tipo | Descripción |
| :--- | :--- |
| `texto` | Mensaje de texto |
| `imagen` | Imagen compartida |
| `archivo` | Documento o archivo adjunto |
| `ubicacion` | Ubicación geográfica |

### 5.5. Almacenamiento de archivos
El servicio `StorageService` utiliza Supabase Storage con dos buckets configurados:

| Bucket | Visibilidad | Límite |
| :--- | :--- | :--- |
| `avatars` | Público | 5 MB |
| `chat-files` | Privado | 20 MB |

**Organización de archivos:**

```text
avatars/
└── user_id/
    └── imagen.jpg

chat-files/
└── chat_id/
    └── user_id/
        └── documento.pdf
```

**Operaciones contempladas:**
* Subir avatares.
* Subir archivos a conversaciones.
* Obtener URLs firmadas para archivos privados.
* Obtener URLs de avatares.
* Eliminar archivos y avatares.

> **Importante:** Los mensajes deben almacenar la ruta del archivo en Storage, no una URL firmada temporal que pueda expirar.

### 5.6. Notificaciones push
El servicio `NotificacionesService` utiliza el plugin de Firebase Messaging para Android y se encarga de:
* Solicitar permisos de notificaciones.
* Obtener el token FCM del dispositivo.
* Registrar el token en Supabase (tabla `fcm_tokens`).
* Actualizar tokens cuando cambien.
* Escuchar notificaciones recibidas.
* Escuchar las acciones realizadas sobre las notificaciones.

### 5.7. Ubicación y preferencias
* **Ubicación:** El servicio `UbicacionService` permite acceder a la ubicación del dispositivo mediante Capacitor Geolocation.
* **Preferencias:** El servicio `PreferenciasService` utiliza Capacitor Preferences para conservar configuraciones locales de la aplicación.

---

## 6. Base de datos

La base de datos utiliza PostgreSQL administrado por Supabase.

### Tablas principales

#### `profiles`
Almacena la información de los perfiles (se relaciona 1:1 con `auth.users`).

| Campo | Descripción |
| :--- | :--- |
| `id` | Identificador del usuario |
| `nombre` | Nombre del usuario |
| `username` | Nombre de usuario único |
| `email` | Correo electrónico |
| `foto_url` | Imagen de perfil |
| `estado` | Estado del usuario |
| `creado_en` | Fecha de creación |
| `actualizado_en` | Última actualización |

#### `chats`
Almacena las conversaciones.

| Campo | Descripción |
| :--- | :--- |
| `id` | Identificador del chat |
| `nombre` | Nombre de la conversación |
| `tipo` | Individual o grupal |
| `imagen_url` | Imagen de la conversación |
| `creado_por` | Usuario creador |
| `creado_en` | Fecha de creación |
| `actualizado_en` | Última actualización |

#### `chat_participants`
Relaciona usuarios con conversaciones.

| Campo | Descripción |
| :--- | :--- |
| `id` | Identificador del registro |
| `chat_id` | Identificador de la conversación |
| `user_id` | Identificador del usuario |
| `rol` | Administrador o miembro |
| `unido_en` | Fecha de incorporación |
| `ultimo_mensaje_leido` | Último mensaje leído |

#### `messages`
Almacena los mensajes enviados.

| Campo | Descripción |
| :--- | :--- |
| `id` | Identificador del mensaje |
| `chat_id` | Conversación asociada |
| `sender_id` | Usuario remitente |
| `contenido` | Contenido del mensaje |
| `tipo` | Tipo de mensaje |
| `archivo_url` | Ruta del archivo |
| `archivo_nombre` | Nombre del archivo |
| `archivo_tamano` | Tamaño del archivo |
| `latitud` | Coordenada geográfica |
| `longitud` | Coordenada geográfica |
| `editado_en` | Fecha de edición |
| `eliminado_en` | Fecha de eliminación lógica |
| `creado_en` | Fecha de creación |

#### `fcm_tokens`
Almacena los tokens de los dispositivos registrados para recibir notificaciones.

| Campo | Descripción |
| :--- | :--- |
| `id` | Identificador del registro |
| `user_id` | Usuario propietario |
| `token` | Token de Firebase Cloud Messaging |
| `plataforma` | Plataforma del dispositivo |
| `creado_en` | Fecha de registro |
| `actualizado_en` | Última actualización |

### Relaciones principales

```text
auth.users
    |
    | 1:1
    v
profiles

profiles
    |
    | 1:N
    v
chat_participants
    |
    | N:1
    v
chats
    |
    | 1:N
    v
messages

profiles
    |
    | 1:N
    v
fcm_tokens
```

---

## 7. Seguridad de la información

La seguridad se administra principalmente mediante **Row Level Security (RLS)** de PostgreSQL.

**Políticas implementadas:**
* Cada usuario puede consultar y actualizar su propio perfil.
* Los usuarios autenticados pueden buscar perfiles mediante la función autorizada.
* Los participantes pueden consultar los mensajes de sus conversaciones.
* Los usuarios solo pueden enviar mensajes como ellos mismos y editar únicamente los propios.
* Los participantes pueden acceder a los archivos de sus conversaciones respetando las políticas de Storage.
* Los usuarios solo pueden administrar sus propios avatares.

**Funciones de apoyo:**
* `is_chat_member`
* `is_chat_creator`

> **Seguridad crítica:** Las claves privadas, credenciales de servicio y secretos nunca deben incluirse en el código del frontend ni publicarse en GitHub.

---

## 8. Notificaciones mediante Supabase Edge Functions

La función `enviar-notificacion` se encarga de procesar las notificaciones push.

### Funcionamiento
1. El usuario autenticado envía un mensaje.
2. La aplicación obtiene el identificador del chat y del mensaje.
3. Se invoca la Edge Function.
4. La función verifica que el mensaje exista y pertenezca al usuario autenticado.
5. Consulta los participantes de la conversación.
6. Recupera los tokens FCM de los demás participantes.
7. Obtiene un token OAuth de Google utilizando la cuenta de servicio configurada.
8. Envía las notificaciones mediante Firebase Cloud Messaging.

### Endpoint
```http
POST https://fhhnvzzsvdqngnodvrtj.supabase.co/functions/v1/enviar-notificacion
```

### Autenticación y encabezados
```http
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

### Cuerpo de la solicitud
```json
{
  "chat_id": "UUID_DEL_CHAT",
  "message_id": "UUID_DEL_MENSAJE"
}
```

### Ejemplo de respuesta exitosa
```json
{
  "success": true,
  "enviados": 1,
  "fallidos": 0,
  "total": 1
}
```
> *Los valores anteriores son ilustrativos; la cantidad real depende de los dispositivos registrados y de los resultados de FCM.*

### Secreto requerido y despliegue
La función requiere el secreto `FIREBASE_SERVICE_ACCOUNT` configurado directamente en Supabase (nunca en el repositorio).

Para desplegar con Supabase CLI:
```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase functions deploy enviar-notificacion --no-verify-jwt
```
> *La opción `--no-verify-jwt` se utiliza porque la autenticación de usuario es validada dentro de la función mediante `withSupabase({ auth: "user" })`.*

---

## 9. Configuración del entorno de desarrollo

### Requisitos previos
* Node.js 22 y npm
* Ionic CLI y Angular CLI
* Android Studio, Android SDK y Java 17
* Cuenta de Supabase y Supabase CLI
* Proyecto de Firebase configurado para FCM

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Arielpassw/chat-app.git

# Entrar al proyecto
cd chat-app

# Cambiar a la rama de backend
git switch feature/backend

# Instalar dependencias
npm install
```

### Configuración de variables de entorno
Crear los archivos locales copiando las plantillas existentes:
* `src/environments/environment.example.ts` $\rightarrow$ `src/environments/environment.ts`
* `src/environments/environment.prod.example.ts` $\rightarrow$ `src/environments/environment.prod.ts`

Configurar los datos de Supabase y Firebase según las propiedades definidas. **No publicar los archivos reales de entorno.**

### Configuración de Firebase para Android
Ubicar el archivo de configuración descargado de Firebase en:
```text
android/app/google-services.json
```
*(No confundir este archivo cliente con la cuenta de servicio privada utilizada por la Edge Function).*

### Comandos de ejecución y compilación
```bash
# Ejecutar en desarrollo web
ionic serve

# Compilar la aplicación
ionic build

# Sincronizar con Android
npx cap sync android

# Abrir Android Studio
npx cap open android
```

---

## 10. Flujo de trabajo con Git

| Rama | Propósito |
| :--- | :--- |
| `main` | Versión estable del proyecto |
| `develop` | Integración y pruebas |
| `feature/backend` | Desarrollo del backend |
| `feature/*` | Nuevas funcionalidades |

**Obtener los últimos cambios del backend:**
```bash
git switch feature/backend
git pull origin feature/backend
```

**Integrar cambios en `develop`:**
```bash
git switch develop
git pull origin develop
git merge feature/backend
```

---

## 11. Estado del desarrollo

### Backend implementado
- [x] Configuración del cliente Supabase.
- [x] Autenticación y gestión de sesiones.
- [x] Modelos de usuarios, salas, mensajes y archivos.
- [x] Gestión de perfiles y búsqueda de usuarios.
- [x] Creación transaccional de conversaciones y gestión de participantes.
- [x] Envío, consulta, edición y eliminación lógica de mensajes.
- [x] Suscripción a Supabase Realtime y configuración de políticas RLS.
- [x] Almacenamiento de archivos e imágenes en Supabase Storage.
- [x] Acceso a ubicación y preferencias locales mediante Capacitor.
- [x] Registro de tokens FCM y despliegue de la Edge Function de notificaciones.

### Integración y pruebas pendientes
- [ ] Integración completa de los servicios con las pantallas del frontend.
- [ ] Pruebas de creación de chats desde la aplicación.
- [ ] Pruebas de envío y recepción de mensajes, archivos, imágenes y ubicación compartida.
- [ ] Pruebas de notificaciones push y tiempo real entre dos usuarios/dispositivos Android.

---

## 12. Consideraciones para el desarrollo del frontend

1. Utilizar los servicios existentes en lugar de realizar consultas directas a Supabase desde los componentes.
2. Mantener los modelos TypeScript para respetar la estructura de los datos.
3. Verificar que el usuario tenga una sesión activa antes de ejecutar operaciones protegidas.
4. Consultar los chats y mensajes utilizando los métodos de sus respectivos servicios.
5. Suscribirse a Supabase Realtime al ingresar a una conversación y cancelar las suscripciones al salir.
6. Invocar la Edge Function después de enviar un mensaje correctamente.
7. Registrar el dispositivo mediante `registrarDispositivo()` después de iniciar sesión y cuando corresponda renovar el token.
8. Utilizar rutas de Storage para los archivos y generar URLs firmadas cuando sea necesario.
9. Manejar errores de conexión, permisos y autenticación desde la interfaz.

---

## 13. Repositorio

* **Código fuente:** GitHub — `Arielpassw/chat-app`
* **Rama de backend:** `feature/backend`

*Proyecto académico de desarrollo de aplicaciones móviles. Tecnologías principales: Ionic, Angular, Capacitor, Supabase, PostgreSQL y Firebase Cloud Messaging.*