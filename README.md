# Chat App

Aplicación móvil de mensajería construida con **Ionic**, **Angular standalone** y **Capacitor**. **Supabase** proporciona autenticación, persistencia, almacenamiento y actualizaciones en tiempo real; **Firebase Cloud Messaging (FCM)** se utiliza para las notificaciones push en Android.

> **Estado del aprovisionamiento:** el repositorio contiene la aplicación, la configuración de Supabase CLI y una Edge Function, pero no contiene migraciones SQL, scripts de creación de tablas ni políticas RLS. Para un proyecto Supabase nuevo, el esquema y sus políticas deben crearse antes de que funcionen las operaciones de datos. Este README describe el contrato que utiliza el código; no sustituye los scripts SQL que aún no están versionados.

## Objetivo

Ofrecer una aplicación móvil para comunicarse mediante conversaciones individuales y grupales, con soporte para perfiles, mensajes, archivos, imágenes y ubicación compartida. La arquitectura separa la experiencia de usuario y las funciones nativas (Ionic/Angular/Capacitor) de los servicios backend (Supabase) y de las notificaciones push (FCM).

## Características

- Registro, inicio de sesión, cierre de sesión y recuperación de contraseña con Supabase Auth.
- Perfiles editables y búsqueda/listado de usuarios.
- Creación y consulta de conversaciones individuales y grupales, con participantes y roles.
- Envío, consulta, edición y eliminación lógica de mensajes.
- Recepción de cambios de mensajes mediante Supabase Realtime.
- Subida de avatares e imágenes/archivos de chat a Supabase Storage.
- Obtención de enlaces firmados para descargar/ver archivos de chats privados.
- Obtención y envío de coordenadas de ubicación.
- Registro de dispositivos Android y envío de notificaciones push por FCM.
- Preferencias locales (incluido el tema oscuro) mediante Capacitor Preferences.
- Pantallas adaptables de acceso, conversaciones, contactos, salas, perfil, configuración y vista previa de medios.

## Tecnologías

| Tecnología | Función en el proyecto |
| --- | --- |
| Ionic Angular | Componentes y experiencia de interfaz móvil. |
| Angular standalone | Componentes, rutas con carga diferida e inyección de servicios. |
| TypeScript | Lenguaje de la aplicación y sus modelos. |
| Capacitor | Empaquetado e integración con Android y sus capacidades nativas. |
| Supabase Auth | Registro, acceso y sesión de usuarios. |
| Supabase Database (PostgreSQL) | Perfiles, conversaciones, participantes, mensajes y tokens de dispositivos. |
| Supabase Realtime | Notificación de cambios de la tabla de mensajes. |
| Supabase Storage | Avatares y adjuntos de conversaciones. |
| Supabase Edge Functions | Lógica de servidor para procesar las solicitudes de notificación. |
| Firebase Cloud Messaging | Entrega de notificaciones push a dispositivos; no gestiona los datos ni los archivos de la aplicación. |
| Capacitor Geolocation / Preferences | Ubicación del dispositivo y preferencias locales. |
| Vitest / Playwright | Pruebas unitarias y pruebas de extremo a extremo. |

## Arquitectura y flujos

```text
Aplicación Ionic / Angular
    ├── Supabase Auth ─────────────── identidad y sesión
    ├── Supabase Database ────────── perfiles, chats y mensajes
    ├── Supabase Realtime ────────── cambios de mensajes
    ├── Supabase Storage ─────────── avatares y archivos
    └── Capacitor ────────────────── Android, ubicación, preferencias y FCM

Flujo push:
Aplicación → Edge Function de Supabase → Firebase Cloud Messaging → Android
```

Los servicios Angular encapsulan las operaciones backend y las pantallas los consumen. Tras guardar un mensaje, la aplicación puede llamar a la Edge Function `enviar-notificacion`. Esta función valida la sesión y que el mensaje pertenezca al remitente, obtiene los tokens de los demás participantes desde Supabase y solicita el envío a FCM. La credencial privada de Firebase se mantiene en los secretos del servidor de Supabase, no en la aplicación.

## Estructura principal

```text
.
├── android/                         Proyecto nativo Android de Capacitor
├── e2e/                             Pruebas Playwright
├── src/
│   ├── app/
│   │   ├── guards/                  Protección de rutas
│   │   ├── models/                  Modelos de usuario, sala, mensaje y archivo
│   │   ├── page/                    Pantallas standalone de la aplicación
│   │   ├── services/                Servicios Auth, chat, sala, Storage, FCM, etc.
│   │   ├── app.routes.ts            Rutas
│   │   └── app.component.ts         Componente raíz y deep links de autenticación
│   └── environments/                Plantillas de configuración de la aplicación
├── supabase/
│   ├── config.toml                  Configuración local de Supabase CLI
│   └── functions/
│       └── enviar-notificacion/     Edge Function de notificaciones push
├── capacitor.config.ts              Identificador y directorio web de Capacitor
├── angular.json                     Configuración de compilación y pruebas Angular
├── package.json                     Dependencias y comandos npm
└── Backend.md                       Referencia técnica complementaria del backend
```

Las pantallas se encuentran en `src/app/page/` (singular). Los archivos `src/environments/environment.ts` y `src/environments/environment.prod.ts` son configuraciones locales ignoradas por Git; las plantillas versionadas son `environment.example.ts` y `environment.prod.example.ts`.

## Requisitos previos

- Git.
- Node.js compatible con Angular 22 y npm (se recomienda Node.js 22).
- Para Android: Android Studio, Android SDK (API 36 configurada por el proyecto) y Java/JDK 17 o posterior.
- Un proyecto Supabase con Auth, Database, Realtime y Storage.
- Para notificaciones Android: un proyecto Firebase con Firebase Cloud Messaging habilitado y una aplicación Android con identificador `io.ionic.starter`.
- Supabase CLI, solo para enlazar el proyecto y desplegar la Edge Function.

## Instalación y ejecución

1. Clona el repositorio y entra al directorio:

   ```bash
   git clone https://github.com/Arielpassw/chat-app.git
   cd chat-app
   ```

2. Instala las dependencias con el lockfile:

   ```bash
   npm ci
   ```

3. Crea los archivos de configuración locales a partir de las plantillas, si todavía no existen. En PowerShell:

   ```powershell
   if (-not (Test-Path src\environments\environment.ts)) {
     Copy-Item src\environments\environment.example.ts src\environments\environment.ts
   }
   if (-not (Test-Path src\environments\environment.prod.ts)) {
     Copy-Item src\environments\environment.prod.example.ts src\environments\environment.prod.ts
   }
   ```

   En macOS/Linux se pueden copiar manualmente los dos archivos de plantilla con `cp`. Completa los valores siguiendo la siguiente sección.

4. Aprovisiona el esquema, políticas y buckets en Supabase (ver [Configuración de Supabase](#configuración-de-supabase)).
5. Inicia la aplicación web:

   ```bash
   npm start
   ```

   Angular sirve la aplicación en `http://localhost:4200`.

## Configuración del entorno

La aplicación lee la configuración de `src/environments/environment.ts`. La compilación de producción sustituye ese archivo por `src/environments/environment.prod.ts`, según `angular.json`.

Ejemplo ilustrativo, sin valores de acceso reales:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://TU_PROYECTO.supabase.co',
    anonKey: 'TU_CLAVE_PUBLICA_SUPABASE'
  },
  firebase: {
    apiKey: 'TU_FIREBASE_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_FIREBASE_PROJECT_ID',
    storageBucket: 'TU_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'TU_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'TU_FIREBASE_APP_ID'
  }
};
```

- `supabase.url`: URL del proyecto Supabase.
- `supabase.anonKey`: clave pública/publishable del cliente Supabase. No es una clave administrativa; los permisos deben protegerse con RLS.
- Los campos `firebase` aparecen en las plantillas, pero el código TypeScript actual no los consulta. La integración Android usa el plugin `@capacitor-firebase/messaging` y la configuración nativa de Firebase (`google-services.json`).

Los archivos de entorno reales están excluidos de Git. No incluyas en el frontend ni en el repositorio la clave `service_role`, claves privadas de Firebase ni secretos de servidor. Si una clave privada se expone por error, rótala.

## Configuración de Supabase

### 1. Autenticación

En el panel de Supabase habilita el proveedor de correo y contraseña. El servicio implementa registro, inicio/cierre de sesión y recuperación de contraseña. El flujo de registro solicita el callback móvil:

```text
io.ionic.starter://login-callback
```

Añádelo a las URL de redirección permitidas de Auth. La aplicación procesa el enlace entrante y canjea el código para establecer la sesión. Configura la confirmación de correo de acuerdo con las pruebas que vayas a realizar.

### 2. Esquema de base de datos esperado

Los servicios consultan las siguientes tablas y columnas. Los nombres se muestran tal como los usa el código/modelo; pueden requerirse columnas adicionales, claves foráneas, restricciones e índices en la instancia real.

| Tabla | Campos utilizados por la aplicación |
| --- | --- |
| `profiles` | `id`, `nombre`, `username`, `email`, `foto_url`, `estado`, `creado_en`, `actualizado_en` |
| `chats` | `id`, `nombre`, `tipo`, `imagen_url`, `creado_por`, `creado_en`, `actualizado_en` |
| `chat_participants` | `id`, `chat_id`, `user_id`, `rol`, `unido_en`, `ultimo_mensaje_leido` |
| `messages` | `id`, `chat_id`, `sender_id`, `contenido`, `tipo`, `archivo_url`, `archivo_nombre`, `archivo_tamano`, `latitud`, `longitud`, `editado_en`, `eliminado_en`, `creado_en` |
| `fcm_tokens` | `id`, `user_id`, `token`, `plataforma`, `creado_en`, `actualizado_en` |

La aplicación también invoca las funciones PostgreSQL `buscar_perfiles(p_busqueda)` y `crear_sala_transaccional(p_nombre, p_tipo, p_imagen_url)`. La documentación backend refiere además a `handle_new_user()`, `is_chat_member()` e `is_chat_creator()`. El registro de Auth y la búsqueda/creación de salas dependen de que las funciones y relaciones esperadas estén instaladas.

**No hay migraciones ni seeds SQL versionados en `supabase/`**, por lo que el esquema no se crea con `supabase db push` en este repositorio. Antes de probar, crea las tablas, funciones, relaciones, restricciones y permisos necesarios en la base de datos del proyecto. Mantén ese esquema bajo control de versiones en migraciones SQL como mejora del proyecto.

### 3. Row Level Security (RLS)

Activa RLS en las tablas expuestas por la API y configura políticas para las operaciones que necesita la aplicación. Como mínimo, las políticas deben garantizar que:

- Un usuario solo pueda modificar su propio perfil.
- La lectura de perfiles y la búsqueda sean compatibles con las reglas de privacidad decididas para la aplicación.
- Solo miembros de una conversación puedan leer sus participantes y mensajes.
- Los mensajes se creen con el usuario autenticado como remitente; cada usuario solo pueda editar/eliminar sus propios mensajes.
- Los usuarios solo puedan crear/actualizar los tokens FCM que les pertenecen.
- Las funciones RPC y políticas de Storage validen pertenencia a chats cuando corresponda.

El repositorio no incluye las definiciones SQL de estas políticas. No desactives RLS como solución temporal y no uses una clave administrativa en el cliente.

### 4. Realtime

`ChatService` se suscribe a eventos `INSERT`, `UPDATE` y `DELETE` de `public.messages`, filtrados por `chat_id`. Habilita `messages` para Realtime (publicación `supabase_realtime`) en la configuración de la base de datos y verifica que las políticas permitan al usuario autenticado recibir los cambios de sus conversaciones.

### 5. Storage

Crea en Supabase Storage los buckets que el servicio utiliza:

| Bucket | Acceso esperado | Límite validado por el cliente |
| --- | --- | --- |
| `avatars` | Público (URL pública de avatar) | 5 MB; JPEG, PNG o WebP |
| `chat-files` | Privado (URL firmada para acceso temporal) | 20 MB |

Los archivos se organizan por usuario o conversación. Define también las políticas de Storage: los usuarios deben gestionar su propio avatar y solo los participantes autorizados deben cargar/leer/eliminar archivos de un chat. Los límites de tamaño que valida Angular no reemplazan la configuración de límites y políticas del bucket en Supabase. Las rutas de archivos, no las URL firmadas temporales, se guardan en los mensajes.

## Configuración de Firebase Cloud Messaging

FCM se utiliza exclusivamente para enviar notificaciones push; los datos, autenticación y archivos permanecen en Supabase.

1. Crea/configura un proyecto Firebase, habilita Cloud Messaging y registra una aplicación Android con el identificador de paquete `io.ionic.starter`.
2. Descarga el archivo de configuración Android `google-services.json` y colócalo en `android/app/google-services.json`.
3. Configura la cuenta de servicio de Firebase para permitir el envío de mensajes FCM v1.
4. Guarda el JSON de la cuenta de servicio como secreto `FIREBASE_SERVICE_ACCOUNT` en la configuración de secretos del proyecto Supabase. No lo pongas en `environment.ts`, `google-services.json`, el cliente móvil ni Git.
5. Despliega la función desde la raíz del proyecto:

   ```bash
   npx supabase login
   npx supabase link --project-ref TU_PROJECT_REF
   npx supabase functions deploy enviar-notificacion
   ```

   La configuración de `supabase/config.toml` desactiva la verificación JWT del gateway para esta función; el código de la función valida la sesión de usuario. No elimines esa validación.

La aplicación solicita permiso de notificaciones en Android y registra el token del dispositivo en `fcm_tokens`. La recepción push requiere probar en Android con un proyecto Firebase correctamente configurado; la funcionalidad no se ejecuta en el navegador.

## Comandos

| Tarea | Comando |
| --- | --- |
| Servidor de desarrollo | `npm start` |
| Compilación (producción por defecto) | `npm run build` |
| Compilación de desarrollo | `npm run build -- --configuration development` |
| Pruebas unitarias (Vitest) | `npm run test:unit` |
| Pruebas E2E (Playwright, perfil Pixel 7) | `npm run test:e2e` |
| Lint, chequeo E2E y formato | `npm run lint` |
| Compilar y sincronizar Android | `npx cap sync android` |
| Abrir el proyecto Android | `npx cap open android` |

### Generar una APK debug

Desde PowerShell, en la raíz:

```powershell
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat assembleDebug
```

La APK se genera en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Para instalarla en un dispositivo/emulador Android conectado mediante ADB, también se puede ejecutar desde la raíz:

```powershell
npx cap run android
```

El proyecto no documenta una configuración de firma de producción; `assembleDebug` genera una APK de depuración, no una versión firmada para distribución.

## Pruebas manuales

1. Configura Supabase (esquema, RLS, Realtime, Storage y Auth) y completa los archivos de entorno.
2. Ejecuta `npm start` y verifica la navegación a registro e inicio de sesión.
3. Crea al menos dos usuarios de prueba; completa y consulta sus perfiles/contactos.
4. Crea una conversación individual y una sala grupal; comprueba que participantes no autorizados no accedan a sus datos.
5. Envía mensajes, verifica que aparezcan en tiempo real en el otro cliente y prueba edición/eliminación lógica.
6. Prueba avatares, imágenes y archivos dentro de los límites configurados; comprueba el acceso temporal a los archivos privados.
7. En Android, concede el permiso de ubicación y prueba el envío de coordenadas.
8. En dos dispositivos Android o emuladores con Google Play Services, registra los tokens FCM y envía un mensaje para comprobar la notificación. Revisa los logs de la Edge Function si el envío falla.
9. Ejecuta `npm run test:unit`, `npm run test:e2e` y `npm run lint` para las verificaciones automatizadas.

## Capturas de pantalla

Agregar capturas propias de la aplicación en `docs/capturas/` y actualizar las rutas cuando estén disponibles.

| Pantalla | Captura |
| --- | --- |
| Inicio de sesión | *Pendiente de agregar (`docs/capturas/inicio-sesion.png`)* |
| Conversaciones | *Pendiente de agregar (`docs/capturas/conversaciones.png`)* |
| Sala de chat | *Pendiente de agregar (`docs/capturas/sala-chat.png`)* |
| Perfil y configuración | *Pendiente de agregar (`docs/capturas/perfil-configuracion.png`)* |

## Autores y contexto académico

| Nombre | Rol |
| --- | --- |
| Ariel Arias | Backend |
| Emilia Tana | Frontend |

- **Institución:** Escuela Politécnica Nacional del Ecuador
- **Materia:** Desarrollo de Aplicaciones Móviles

## Seguridad

- RLS y políticas de Storage son esenciales: el uso de una clave pública en el cliente no sustituye el control de acceso.
- No publiques contraseñas, tokens, claves privadas, secretos de cuentas de servicio ni claves `service_role`.
- La clave privada FCM se configura únicamente como secreto de la Edge Function en Supabase.
- Los archivos de entorno locales están ignorados por Git. Revisa los cambios antes de publicarlos y rota cualquier secreto que haya quedado expuesto.
