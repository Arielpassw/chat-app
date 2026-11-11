
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private escuchandoToken = false;

  constructor(
    private supabaseService: SupabaseService
  ) {}

  // Solicitar permiso para recibir notificaciones
  async solicitarPermiso(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') {
      return false;
    }

    const permisos = await FirebaseMessaging.checkPermissions();

    if (permisos.receive === 'granted') {
      return true;
    }

    const resultado = await FirebaseMessaging.requestPermissions();

    return resultado.receive === 'granted';
  }

  // Guardar el token FCM en Supabase
  async guardarTokenEnSupabase(token: string): Promise<void> {
    const supabase = this.supabaseService.client;

    const { data: { user }, error: errorUsuario } =
      await supabase.auth.getUser();

    if (errorUsuario || !user) {
      throw new Error('No existe un usuario autenticado en Supabase.');
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id: user.id,
          token: token,
          plataforma: Capacitor.getPlatform()
        },
        {
          onConflict: 'token'
        }
      );

    if (error) {
      throw error;
    }

    console.log('Token FCM guardado correctamente en Supabase.');
  }

  // Obtener el token y registrarlo
  async registrarDispositivo(): Promise<string | null> {
    try {
      const permiso = await this.solicitarPermiso();

      if (!permiso) {
        console.log('Permiso de notificaciones denegado.');
        return null;
      }

      // Escuchar primero los cambios del token
      await this.escucharCambiosToken();

      // Obtener token actual
      const resultado = await FirebaseMessaging.getToken();

      const token = resultado.token;

      console.log('Token FCM obtenido:', token);

      // Guardarlo en Supabase
      await this.guardarTokenEnSupabase(token);

      return token;

    } catch (error) {
      console.error('Error registrando dispositivo:', error);
      return null;
    }
  }

  // Detectar si Firebase genera un nuevo token
  async escucharCambiosToken(): Promise<void> {
    if (this.escuchandoToken) {
      return;
    }

    await FirebaseMessaging.addListener(
      'tokenReceived',
      async (evento) => {
        try {
          console.log('Nuevo token FCM recibido.');

          await this.guardarTokenEnSupabase(evento.token);

        } catch (error) {
          console.error('Error actualizando token:', error);
        }
      }
    );

    this.escuchandoToken = true;
  }

  // Escuchar notificaciones recibidas
  async escucharNotificaciones(): Promise<void> {
    await FirebaseMessaging.addListener(
      'notificationReceived',
      (evento) => {
        console.log('Notificación recibida:', evento.notification);
      }
    );
  }

  // Escuchar cuando se toca una notificación
  async escucharAccionesNotificacion(): Promise<void> {
    await FirebaseMessaging.addListener(
      'notificationActionPerformed',
      (evento) => {
        console.log('Notificación seleccionada:', evento.notification);
      }
    );
  }

  
  // Obtener un token FCM real para pruebas en Android
  async obtenerTokenDispositivo(): Promise<string | null> {
    try {
      if (Capacitor.getPlatform() !== 'android') {
        console.log('Esta prueba debe ejecutarse en Android.');
        return null;
      }

      const permiso = await this.solicitarPermiso();

      if (!permiso) {
        console.log('Permiso de notificaciones denegado.');
        return null;
      }

      const resultado = await FirebaseMessaging.getToken();

      console.log('TOKEN FCM REAL:', resultado.token);

      return resultado.token;

    } catch (error) {
      console.error('Error obteniendo token FCM:', error);
      return null;
    }
  }

}
