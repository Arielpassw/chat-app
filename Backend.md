# BACKEND.md — Documentación técnica del backend

- **Proyecto:** Chat App
- **Rama de desarrollo:** `feature/backend`
- **Tecnologías:** Ionic, Angular, TypeScript, Capacitor, Supabase y Firebase Cloud Messaging.

---

## 1. Objetivo del documento

Este documento describe la estructura, los servicios, los modelos y las operaciones disponibles en el backend de **Chat App**.

Su finalidad es facilitar la integración del frontend con los servicios existentes, estableciendo cómo consumir las operaciones de autenticación, usuarios, conversaciones, mensajes, archivos, ubicación y notificaciones.

> **Principio de integración:** Los componentes y páginas del frontend deben consumir los servicios de `src/app/services/` en lugar de implementar directamente las consultas a Supabase.

---

## 2. Arquitectura del backend

El backend utiliza **Supabase** como plataforma principal y **Firebase Cloud Messaging** exclusivamente para las notificaciones push.

| Componente | Función |
| :--- | :--- |
| **Supabase Auth** | Autenticación y administración de sesiones |
| **PostgreSQL** | Persistencia de información |
| **Supabase Storage** | Almacenamiento de archivos e imágenes |
| **Supabase Realtime** | Actualización de información en tiempo real |
| **Supabase Edge Functions** | Procesamiento de notificaciones |
| **Firebase Cloud Messaging** | Entrega de notificaciones push |

### Flujo general

```text
Frontend Ionic Angular
        |
        v
Servicios TypeScript
        |
        +--------------------------+
        |                          |
        v                          v
     Supabase                 Capacitor
        |                          |
        v                          v
 PostgreSQL / Storage       Funcionalidades nativas
        |
        v
 Supabase Realtime
        |
        v
 Actualizaciones del chat
```

### Flujo de notificaciones

```text
ChatService -> Supabase Edge Function
                       |
                       v
                Firebase Cloud Messaging
                       |
                       v
                Dispositivo receptor
```

---

## 3. Estructura de carpetas

```text
src/app/
│
├── guards/
│   └── auth-guard.ts
│
├── models/
│   ├── archivo.model.ts
│   ├── mensaje.model.ts
│   ├── sala.model.ts
│   └── usuario.model.ts
│
├── services/
│   ├── auth.ts
│   ├── chat.ts
│   ├── notificaciones.ts
│   ├── preferencias.ts
│   ├── sala.ts
│   ├── storage.ts
│   ├── supabase.ts
│   ├── ubicacion.ts
│   └── usuario.ts
│
└── pages/
    └── ...
```

---

## 4. Configuración e inyección de servicios

Los servicios utilizan Angular Dependency Injection y están registrados con `providedIn: 'root'`. Por lo tanto, pueden inyectarse directamente en los componentes y páginas.

### Ejemplo

```typescript
import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { ChatService } from '../../services/chat';
import { SalaService } from '../../services/sala';

@Component({
  selector: 'app-ejemplo',
  templateUrl: './ejemplo.page.html'
})
export class EjemploPage {

  constructor(
    private auth: Auth,
    private chatService: ChatService,
    private salaService: SalaService
  ) {}

}
```

> *Nota: Los imports deben adaptarse según la ubicación de cada página.*

---

## 5. Servicio de autenticación

- **Archivo:** `src/app/services/auth.ts`
- **Clase:** `Auth`

Este servicio utiliza Supabase Auth para administrar el acceso de los usuarios.

### Métodos disponibles

| Método | Parámetros | Retorno |
| :--- | :--- | :--- |
| `registrar()` | `nombre`, `email`, `password` | Datos del registro |
| `iniciarSesion()` | `email`, `password` | Datos de autenticación |
| `cerrarSesion()` | Ninguno | `Promise<void>` |
| `obtenerSesion()` | Ninguno | `Promise<Session \| null>` |
| `obtenerUsuario()` | Ninguno | Usuario autenticado |
| `recuperarPassword()` | `email` | `Promise<void>` |
| `escucharCambios()` | `callback` | Suscripción de autenticación |

### 5.1. Registrar usuario

```typescript
const resultado = await this.auth.registrar(
  'Usuario de prueba',
  'usuario@gmail.com',
  'ContraseñaSegura123'
);
```

- El registro utiliza Supabase Auth.
- El perfil se crea automáticamente mediante el trigger `handle_new_user()` de PostgreSQL.
- No es necesario ejecutar manualmente `crearPerfil()` después del registro normal.

### 5.2. Iniciar sesión

```typescript
try {
  const resultado = await this.auth.iniciarSesion(
    'usuario@gmail.com',
    'ContraseñaSegura123'
  );

  console.log('Sesión iniciada:', resultado);

} catch (error) {
  console.error('Error al iniciar sesión:', error);
}
```

### 5.3. Obtener la sesión

```typescript
const sesion = await this.auth.obtenerSesion();

if (sesion) {
  console.log('Usuario autenticado:', sesion.user.id);
} else {
  console.log('No existe una sesión activa.');
}
```

### 5.4. Obtener el usuario autenticado

```typescript
const usuario = await this.auth.obtenerUsuario();

console.log(usuario?.id);
console.log(usuario?.email);
```

### 5.5. Cerrar sesión

```typescript
await this.auth.cerrarSesion();
```

### 5.6. Recuperar contraseña

```typescript
await this.auth.recuperarPassword(
  'usuario@gmail.com'
);
```

### 5.7. Escuchar cambios de autenticación

```typescript
const suscripcion = this.auth.escucharCambios(
  (evento, sesion) => {
    console.log('Evento:', evento);
    console.log('Sesión:', sesion);
  }
);
```

Para dejar de escuchar:

```typescript
suscripcion.unsubscribe();
```

---

## 6. Servicio de usuarios

- **Archivo:** `src/app/services/usuario.ts`

Este servicio administra la información de los perfiles almacenados en `profiles`.

### Métodos disponibles

| Método | Descripción |
| :--- | :--- |
| `crearPerfil()` | Crea un perfil cuando sea necesario |
| `obtenerMiPerfil()` | Consulta el perfil actual |
| `obtenerPerfilPorId()` | Consulta un perfil por identificador |
| `actualizarMiPerfil()` | Actualiza la información personal |
| `buscarUsuarios()` | Busca usuarios por nombre o username |
| `obtenerUsuarios()` | Consulta perfiles sujetos a las políticas de acceso |

### 6.1. Obtener el perfil actual

```typescript
const perfil = await this.usuarioService.obtenerMiPerfil();

console.log(perfil);
```

### 6.2. Consultar un perfil por identificador

```typescript
const perfil = await this.usuarioService.obtenerPerfilPorId(
  usuarioId
);
```

### 6.3. Actualizar el perfil

```typescript
await this.usuarioService.actualizarMiPerfil({
  nombre: 'Nuevo nombre',
  username: 'nuevo_usuario',
  estado: 'Disponible'
});
```

### 6.4. Buscar usuarios

```typescript
const usuarios = await this.usuarioService.buscarUsuarios(
  'Ariel'
);
```

- La búsqueda utiliza la función PostgreSQL `buscar_perfiles`.
- La función permite buscar por nombre o username y devuelve hasta 20 resultados.
- **Importante:** La búsqueda requiere al menos dos caracteres.

### Consideraciones
- El identificador del perfil corresponde al UUID del usuario de Supabase Auth.
- El perfil se crea automáticamente durante el registro.
- No se debe crear un segundo perfil para el mismo usuario.
- Las consultas están sujetas a las políticas RLS.

---

## 7. Modelos de datos

Los modelos se encuentran en `src/app/models/`.

### 7.1. Usuario
**Archivo:** `usuario.model.ts`

```typescript
export interface Usuario {
  id: string;
  nombre: string;
  username: string | null;
  email: string | null;
  foto_url: string | null;
  estado: string | null;
  creado_en: string | null;
  actualizado_en: string | null;
}

export interface CrearUsuario {
  id: string;
  nombre?: string;
  username?: string | null;
  email?: string | null;
  foto_url?: string | null;
  estado?: string | null;
}

export interface ActualizarUsuario {
  nombre?: string;
  username?: string | null;
  email?: string | null;
  foto_url?: string | null;
  estado?: string | null;
}

export interface Contacto {
  id: string;
  nombre: string;
  username: string | null;
  foto_url: string | null;
  estado: string | null;
}
```

### 7.2. Sala y participantes
**Archivo:** `sala.model.ts`

```typescript
export type TipoSala = 'individual' | 'grupal';

export type RolParticipante =
  'administrador' | 'miembro';

export interface Sala {
  id: string;
  nombre: string | null;
  tipo: TipoSala;
  imagen_url: string | null;
  creado_por: string;
  creado_en: string | null;
  actualizado_en: string | null;
}

export interface CrearSala {
  nombre?: string | null;
  tipo: TipoSala;
  imagen_url?: string | null;
  creado_por: string;
}

export interface ParticipanteSala {
  id: string;
  chat_id: string;
  user_id: string;
  rol: RolParticipante | null;
  unido_en: string | null;
  ultimo_mensaje_leido: string | null;
}

export interface AgregarParticipante {
  chat_id: string;
  user_id: string;
  rol?: RolParticipante;
}
```

### 7.3. Mensajes
**Archivo:** `mensaje.model.ts`

```typescript
export type TipoMensaje =
  'texto' | 'imagen' | 'archivo' | 'ubicacion';

export interface Mensaje {
  id: string;
  chat_id: string;
  sender_id: string;
  contenido: string | null;
  tipo: TipoMensaje;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tamano: number | null;
  latitud: number | null;
  longitud: number | null;
  editado_en: string | null;
  eliminado_en: string | null;
  creado_en: string | null;
}

export interface CrearMensaje {
  chat_id: string;
  sender_id: string;
  contenido?: string | null;
  tipo?: TipoMensaje;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tamano?: number | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface ActualizarMensaje {
  contenido?: string | null;
  editado_en?: string;
  eliminado_en?: string | null;
}
```

### 7.4. Archivos
**Archivo:** `archivo.model.ts`

```typescript
export interface ArchivoChat {
  path: string;
  nombre: string;
  tamano: number;
  tipo: string;
}

export interface ArchivoAvatar {
  path: string;
  url: string;
}

export interface ArchivoAdjunto extends ArchivoChat {
  url: string;
}
```

---

## 8. Servicio de salas y conversaciones

- **Archivo:** `src/app/services/sala.ts`
- **Clase:** `SalaService`

Este servicio administra los chats y sus participantes.

### Métodos disponibles

| Método | Descripción |
| :--- | :--- |
| `crearSala()` | Crea una conversación y registra al creador |
| `agregarParticipantes()` | Incorpora usuarios a una conversación |
| `obtenerMisSalas()` | Consulta las conversaciones del usuario |
| `obtenerParticipantes()` | Consulta los integrantes de un chat |
| `actualizarSala()` | Modifica información de una conversación |
| `actualizarUltimaLectura()` | Actualiza la última lectura del usuario |

### 8.1. Crear una conversación

```typescript
const sala = await this.salaService.crearSala({
  nombre: 'Conversación de prueba',
  tipo: 'grupal',
  imagen_url: null,
  creado_por: usuarioId
});
```

La función `crear_sala_transaccional` obtiene el usuario autenticado mediante `auth.uid()`. Por seguridad, el identificador del creador enviado por el frontend no se utiliza para determinar quién crea realmente la conversación.

La operación registra:
1. La conversación en `chats`.
2. El usuario creador en `chat_participants`.
3. El rol de administrador para el creador.

*Ambas inserciones se realizan dentro de una misma transacción.*

### 8.2. Agregar participantes

```typescript
await this.salaService.agregarParticipantes([
  {
    chat_id: sala.id,
    user_id: usuarioId,
    rol: 'miembro'
  }
]);
```

El usuario autenticado debe cumplir las políticas de autorización correspondientes.

### 8.3. Consultar conversaciones

```typescript
const salas = await this.salaService.obtenerMisSalas();

console.log(salas);
```

### 8.4. Consultar participantes

```typescript
const participantes =
  await this.salaService.obtenerParticipantes(salaId);
```

### 8.5. Actualizar una conversación

```typescript
await this.salaService.actualizarSala(salaId, {
  nombre: 'Nuevo nombre'
});
```

### 8.6. Actualizar última lectura

```typescript
await this.salaService.actualizarUltimaLectura(salaId);
```

> **Consideración para conversaciones grupales:** La creación transaccional inicial registra al creador. La incorporación de los demás participantes se realiza mediante `agregarParticipantes()`. Por tanto, el frontend debe gestionar los posibles errores de incorporación de participantes.

---

## 9. Servicio de mensajes

- **Archivo:** `src/app/services/chat.ts`
- **Clase:** `ChatService`

Este servicio gestiona los mensajes y la comunicación en tiempo real.

### Métodos disponibles

| Método | Descripción |
| :--- | :--- |
| `enviarMensaje()` | Registra un mensaje |
| `obtenerMensajes()` | Consulta los mensajes de un chat |
| `editarMensaje()` | Modifica el contenido de un mensaje |
| `eliminarMensaje()` | Realiza una eliminación lógica |
| `escucharMensajes()` | Escucha cambios en tiempo real |
| `dejarDeEscuchar()` | Cancela la escucha de un chat |
| `cerrarTodosLosCanales()` | Cierra todas las suscripciones |

### 9.1. Enviar mensaje de texto

```typescript
const mensaje = await this.chatService.enviarMensaje({
  chat_id: salaId,
  contenido: 'Hola, ¿cómo estás?',
  tipo: 'texto'
});
```

El servicio obtiene automáticamente el identificador del usuario autenticado y lo asigna a `sender_id`. No es necesario enviar `sender_id` desde el componente.

### 9.2. Consultar mensajes

```typescript
const mensajes = await this.chatService.obtenerMensajes(
  salaId
);
```

Los mensajes se ordenan por fecha de creación ascendente.

### 9.3. Editar mensaje

```typescript
await this.chatService.editarMensaje(
  mensajeId,
  'Contenido actualizado'
);
```

Solo el propietario del mensaje puede editarlo según las políticas RLS.

### 9.4. Eliminar mensaje

```typescript
await this.chatService.eliminarMensaje(mensajeId);
```

La eliminación es lógica: se actualiza `eliminado_en` y se limpian los campos de contenido y archivos. El registro permanece en la base de datos.

### 9.5. Escuchar mensajes en tiempo real

El método `escucharMensajes()` devuelve un canal de Supabase Realtime.

```typescript
const canal = await this.chatService.escucharMensajes(
  salaId,
  (evento) => {

    console.log('Tipo de evento:', evento.tipo);
    console.log('Mensaje:', evento.mensaje);

  }
);
```

Los eventos disponibles son:

| Evento | Descripción |
| :--- | :--- |
| `INSERT` | Nuevo mensaje |
| `UPDATE` | Mensaje actualizado |
| `DELETE` | Eliminación física del registro |

*En este proyecto, la eliminación normal de mensajes es lógica, por lo que genera un evento `UPDATE`.*

### 9.6. Dejar de escuchar mensajes

```typescript
await this.chatService.dejarDeEscuchar(salaId);
```

### 9.7. Cerrar todas las suscripciones

```typescript
await this.chatService.cerrarTodosLosCanales();
```

### Recomendación para el frontend

Al ingresar a una conversación:
1. Consultar los mensajes existentes.
2. Activar la suscripción de Realtime.
3. Actualizar la interfaz cuando lleguen eventos.
4. Evitar agregar dos veces el mismo mensaje.
5. Cancelar la suscripción al abandonar la conversación.

#### Ejemplo de ciclo de vida

```typescript
async ionViewWillEnter() {
  await this.cargarMensajes();

  await this.chatService.escucharMensajes(
    this.salaId,
    (evento) => {
      this.procesarEventoMensaje(evento);
    }
  );
}

async ionViewWillLeave() {
  await this.chatService.dejarDeEscuchar(
    this.salaId
  );
}
```

> *Los métodos `cargarMensajes()` y `procesarEventoMensaje()` representan lógica que debe implementar la página.*

---

## 10. Servicio de almacenamiento

- **Archivo:** `src/app/services/storage.ts`
- **Clase:** `StorageService`

El almacenamiento se realiza mediante Supabase Storage.

### Buckets configurados

| Bucket | Visibilidad | Tamaño máximo |
| :--- | :--- | :--- |
| `avatars` | Público | 5 MB |
| `chat-files` | Privado | 20 MB |

### Organización de archivos

```text
avatars/
└── USER_ID/
    └── imagen.jpg

chat-files/
└── CHAT_ID/
    └── USER_ID/
        └── documento.pdf
```

### Métodos disponibles

| Método | Descripción |
| :--- | :--- |
| `subirAvatar()` | Sube una imagen de perfil |
| `subirArchivoChat()` | Sube un archivo a una conversación |
| `obtenerUrlFirmada()` | Genera una URL temporal para un archivo privado |
| `obtenerUrlAvatar()` | Obtiene la URL del avatar |
| `eliminarAvatar()` | Elimina un avatar |
| `eliminarArchivoChat()` | Elimina un archivo de una conversación |

### Consideraciones de integración

Para enviar una imagen o archivo:
1. Seleccionar el archivo desde la interfaz.
2. Subirlo mediante `StorageService`.
3. Obtener la ruta del archivo.
4. Crear el mensaje con el tipo correspondiente.
5. Guardar la ruta en `archivo_url`.
6. Obtener una URL firmada cuando sea necesario mostrar un archivo privado.

> **Importante:** No guardar URLs firmadas temporales como referencia permanente en la tabla `messages`. La ruta almacenada en Supabase Storage debe utilizarse para generar nuevas URLs cuando corresponda.

---

## 11. Servicio de ubicación

- **Archivo:** `src/app/services/ubicacion.ts`
- **Clase:** `UbicacionService`

Este servicio utiliza Capacitor Geolocation para acceder a la ubicación del dispositivo.

La integración de la interfaz debe contemplar:
- Solicitud de permisos.
- Comprobación de disponibilidad de ubicación.
- Obtención de coordenadas.
- Manejo de errores.
- Envío de las coordenadas mediante un mensaje de tipo `ubicacion`.

Los mensajes de ubicación utilizan los campos:

```json
{
  "tipo": "ubicacion",
  "contenido": "Ubicación compartida",
  "latitud": -0.1807,
  "longitud": -78.4678
}
```

> *Las coordenadas del ejemplo son ilustrativas. La firma exacta de los métodos de `UbicacionService` debe consultarse en `src/app/services/ubicacion.ts` antes de invocarlos.*

---

## 12. Servicio de preferencias

- **Archivo:** `src/app/services/preferencias.ts`
- **Clase:** `PreferenciasService`

Utiliza Capacitor Preferences para guardar preferencias locales de la aplicación.

- Puede utilizarse para conservar configuraciones no sensibles que necesiten persistir entre ejecuciones.
- **No** debe utilizarse para guardar contraseñas, claves privadas, tokens de servicio ni credenciales administrativas.
- Consultar `src/app/services/preferencias.ts` para conocer los nombres y parámetros exactos de sus métodos.

---

## 13. Servicio de notificaciones push

- **Archivo:** `src/app/services/notificaciones.ts`
- **Clase:** `NotificacionesService`

La aplicación utiliza Firebase Cloud Messaging para gestionar las notificaciones push en Android.

### Métodos disponibles

| Método | Descripción |
| :--- | :--- |
| `solicitarPermiso()` | Solicita permiso para recibir notificaciones |
| `guardarTokenEnSupabase()` | Registra un token FCM |
| `escucharCambiosToken()` | Escucha renovaciones del token |
| `escucharNotificaciones()` | Escucha notificaciones recibidas |
| `escucharAccionesNotificacion()` | Escucha interacciones con notificaciones |
| `registrarDispositivo()` | Ejecuta el registro completo del dispositivo |
| `obtenerTokenDispositivo()` | Obtiene el token FCM |
| `detenerEscuchas()` | Elimina los listeners registrados |

### 13.1. Registrar el dispositivo

Después de autenticar al usuario, el frontend debe registrar el dispositivo:

```typescript
const token =
  await this.notificacionesService.registrarDispositivo();

if (token) {
  console.log('Dispositivo registrado correctamente.');
}
```

Este proceso:
1. Comprueba los permisos.
2. Solicita autorización si es necesario.
3. Registra los listeners.
4. Obtiene el token FCM.
5. Guarda el token en `fcm_tokens`.

*El registro debe realizarse cuando exista una sesión autenticada.*

### 13.2. Obtener token sin registrarlo

```typescript
const token =
  await this.notificacionesService.obtenerTokenDispositivo();

console.log(token);
```

Este método obtiene el token, pero no lo guarda en Supabase. Para el registro normal se debe utilizar `registrarDispositivo()`.

### 13.3. Detener listeners

```typescript
await this.notificacionesService.detenerEscuchas();
```

Debe considerarse durante el cierre de sesión o cuando se requiera limpiar los listeners.

---

## 14. Supabase Edge Function: `enviar-notificacion`

- **Ubicación:** `supabase/functions/enviar-notificacion/index.ts`

La función permite enviar una notificación push a los demás participantes de una conversación después de registrar un mensaje.

### Endpoint

```http
POST https://fhhnvzzsvdqngnodvrtj.supabase.co/functions/v1/enviar-notificacion
```

### Autenticación requerida

La función utiliza autenticación de usuario. Debe enviarse el JWT de la sesión activa:

```http
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json
```

### Parámetros

```json
{
  "chat_id": "UUID_DEL_CHAT",
  "message_id": "UUID_DEL_MENSAJE"
}
```

### Invocación desde Angular

Se puede invocar utilizando el cliente Supabase:

```typescript
const { data, error } =
  await this.supabaseService.client.functions.invoke(
    'enviar-notificacion',
    {
      body: {
        chat_id: chatId,
        message_id: mensajeId
      }
    }
  );

if (error) {
  console.error(
    'Error enviando notificación:',
    error
  );
} else {
  console.log(
    'Resultado de notificaciones:',
    data
  );
}
```

> *El servicio `SupabaseService` debe inyectarse en el componente o servicio que realice esta operación.*

### Flujo recomendado de integración

La notificación debe solicitarse después de que el mensaje se haya guardado correctamente.

```typescript
async enviarMensajeYNotificar(
  chatId: string,
  contenido: string
) {
  try {

    const mensaje =
      await this.chatService.enviarMensaje({
        chat_id: chatId,
        contenido,
        tipo: 'texto'
      });

    const { data, error } =
      await this.supabaseService.client.functions.invoke(
        'enviar-notificacion',
        {
          body: {
            chat_id: chatId,
            message_id: mensaje.id
          }
        }
      );

    if (error) {
      console.error(
        'El mensaje se guardó, pero falló la notificación:',
        error
      );

      return mensaje;
    }

    console.log('Notificación procesada:', data);

    return mensaje;

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    throw error;
  }
}
```

> **Importante:** Este ejemplo es ilustrativo y debe adaptarse a la arquitectura de la página o servicio que implemente el frontend. Un error al enviar la notificación no significa que el mensaje no se haya guardado; la operación de mensajería y el envío push son operaciones independientes.

### Validaciones del servidor

La Edge Function:
- Verifica la autenticación del usuario.
- Comprueba que el mensaje exista.
- Comprueba que el mensaje pertenezca al usuario autenticado.
- Consulta los participantes del chat.
- Excluye al remitente.
- Recupera los tokens de los demás usuarios.
- Envía las notificaciones mediante FCM.

> *El secreto `FIREBASE_SERVICE_ACCOUNT` se administra en Supabase y nunca debe exponerse al frontend.*

---

## 15. Base de datos y relaciones

### Tablas principales

| Tabla | Propósito |
| :--- | :--- |
| `profiles` | Perfiles de usuarios |
| `chats` | Conversaciones |
| `chat_participants` | Participantes de conversaciones |
| `messages` | Mensajes |
| `fcm_tokens` | Tokens de dispositivos |

### Relaciones

```text
auth.users
     |
     v
  profiles
     |
     +----------------------+
     |                      |
     v                      v
chat_participants        fcm_tokens
     |
     v
   chats
     |
     v
  messages
```

### Funciones PostgreSQL utilizadas

| Función | Responsabilidad |
| :--- | :--- |
| `handle_new_user()` | Crear automáticamente un perfil |
| `buscar_perfiles()` | Buscar usuarios |
| `is_chat_member()` | Comprobar pertenencia a una conversación |
| `is_chat_creator()` | Comprobar si el usuario creó una conversación |
| `crear_sala_transaccional()` | Crear una conversación y registrar al administrador |

### Seguridad RLS

Las operaciones sobre perfiles, conversaciones, participantes, mensajes y archivos están sujetas a políticas de seguridad.
- No se debe desactivar RLS para facilitar la integración del frontend.
- Las operaciones deben ejecutarse con la sesión del usuario autenticado y respetar los permisos establecidos.

---

## 16. Manejo de errores

Las operaciones de los servicios pueden lanzar errores. Se recomienda utilizar `try/catch` en las páginas que consumen los métodos.

### Ejemplo

```typescript
async cargarConversaciones() {
  try {

    this.salas =
      await this.salaService.obtenerMisSalas();

  } catch (error) {

    console.error(
      'Error cargando conversaciones:',
      error
    );

  }
}
```

La interfaz debe informar al usuario cuando ocurran errores de:
- Autenticación.
- Conexión.
- Permisos.
- Acceso a archivos.
- Envío de mensajes.
- Recepción de notificaciones.
- Obtención de ubicación.

> **Seguridad:** No se deben mostrar claves, tokens ni información interna de las excepciones al usuario final.

---

## 17. Recomendaciones para la integración del frontend

Para mantener una arquitectura organizada se recomienda:

1. Inyectar los servicios mediante el constructor de Angular.
2. Utilizar los modelos existentes para tipar la información.
3. No duplicar consultas a Supabase dentro de las páginas.
4. No enviar manualmente el identificador del remitente al crear mensajes.
5. Obtener el usuario autenticado desde `Auth`.
6. Registrar los dispositivos después de iniciar sesión.
7. Cargar mensajes antes de activar la actualización en tiempo real.
8. Cerrar las suscripciones al salir de una conversación.
9. Generar URLs firmadas para visualizar archivos privados.
10. Invocar las notificaciones después de guardar correctamente un mensaje.
11. No guardar credenciales privadas en el frontend.
12. Respetar las políticas RLS existentes.

---

## 18. Estado de implementación

### Backend (Completado)
- [x] Cliente Supabase.
- [x] Autenticación.
- [x] Gestión de perfiles.
- [x] Búsqueda de usuarios.
- [x] Modelos TypeScript.
- [x] Creación de conversaciones.
- [x] Administración de participantes.
- [x] Envío y consulta de mensajes.
- [x] Edición y eliminación lógica.
- [x] Supabase Realtime.
- [x] Supabase Storage.
- [x] Acceso a ubicación.
- [x] Preferencias locales.
- [x] Registro de tokens FCM.
- [x] Edge Function de notificaciones.

### Integración pendiente
- [ ] Conectar todas las páginas con los servicios.
- [ ] Completar los flujos de creación de conversaciones.
- [ ] Completar los flujos de envío y recepción de mensajes.
- [ ] Integrar archivos e imágenes.
- [ ] Integrar ubicación compartida.
- [ ] Integrar notificaciones después del envío de mensajes.
- [ ] Ejecutar pruebas integrales con varios usuarios y dispositivos.

---

## 19. Consideraciones finales

El backend proporciona los servicios y la infraestructura necesarios para la aplicación de mensajería. El frontend debe consumir estos servicios respetando los modelos, las operaciones y las políticas de seguridad descritas en este documento.

Para conocer la configuración general del proyecto, las tecnologías utilizadas y los comandos de instalación, consultar también el archivo `README.md`.

---

- **Repositorio:** `Arielpassw/chat-app`
- **Rama de backend:** `feature/backend`
- **Documentación técnica:** `Backend.md`