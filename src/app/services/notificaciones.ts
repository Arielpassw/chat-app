
import { Injectable } from '@angular/core';
import {
  Capacitor,
  PluginListenerHandle
} from '@capacitor/core';

import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private listenerToken: PluginListenerHandle | null = null;
  private listenerNotificacion: PluginListenerHandle | null = null;
  private listenerAccion: PluginListenerHandle | null = null;

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

  // Obtener el usuario autenticado
  private async obtenerUsuarioId(): Promise<string> {

    const { data, error } =
      await this.supabaseService.client.auth.getUser();

    if (error) throw error;

    if (!data.user) {
      throw new Error('No existe un usuario autenticado en Supabase.');
    }

    return data.user.id;
  }

  // Guardar el token FCM en Supabase
  async guardarTokenEnSupabase(token: string): Promise<void> {

    const usuarioId = await this.obtenerUsuarioId();

    const { error } = await this.supabaseService.client
      .from('fcm_tokens')
      .upsert(
        {
          user_id: usuarioId,
          token: token,
          plataforma: Capacitor.getPlatform(),
          actualizado_en: new Date().toISOString()
        },
        {
          onConflict: 'token'
        }
      );

    if (error) throw error;

    console.log('Token FCM registrado en Supabase.');
  }

  // Escuchar cambios del token FCM
  async escucharCambiosToken(): Promise<void> {

    if (this.listenerToken) {
      return;
    }

    this.listenerToken = await FirebaseMessaging.addListener(
      'tokenReceived',
      async (evento) => {

        try {
          await this.guardarTokenEnSupabase(evento.token);
          console.log('Token FCM actualizado.');
        } catch (error) {
          console.error('Error actualizando token FCM:', error);
        }
      }
    );
  }

  // Escuchar notificaciones recibidas
  async escucharNotificaciones(): Promise<void> {

    if (this.listenerNotificacion) {
      return;
    }

    this.listenerNotificacion = await FirebaseMessaging.addListener(
      'notificationReceived',
      (evento) => {
        console.log('Notificación recibida:', evento.notification);
      }
    );
  }

  // Escuchar cuando el usuario toca una notificación
  async escucharAccionesNotificacion(): Promise<void> {

    if (this.listenerAccion) {
      return;
    }

    this.listenerAccion = await FirebaseMessaging.addListener(
      'notificationActionPerformed',
      (evento) => {
        console.log('Notificación seleccionada:', evento.notification);
      }
    );
  }

  // Registrar dispositivo y configurar listeners
  async registrarDispositivo(): Promise<string | null> {

    try {
      const permiso = await this.solicitarPermiso();

      if (!permiso) {
        console.log('Permiso de notificaciones denegado.');
        return null;
      }

      await this.escucharCambiosToken();
      await this.escucharNotificaciones();
      await this.escucharAccionesNotificacion();

      const resultado = await FirebaseMessaging.getToken();

      await this.guardarTokenEnSupabase(resultado.token);

      console.log('Dispositivo registrado correctamente.');

      return resultado.token;

    } catch (error) {
      console.error('Error registrando dispositivo:', error);
      return null;
    }
  }

  // Obtener token FCM para pruebas
  async obtenerTokenDispositivo(): Promise<string | null> {

    try {
      const permiso = await this.solicitarPermiso();

      if (!permiso) {
        console.log('Permiso de notificaciones denegado.');
        return null;
      }

      const resultado = await FirebaseMessaging.getToken();

      return resultado.token;

    } catch (error) {
      console.error('Error obteniendo token FCM:', error);
      return null;
    }
  }

  // Retirar todos los listeners
  async detenerEscuchas(): Promise<void> {

    const listeners = [
      this.listenerToken,
      this.listenerNotificacion,
      this.listenerAccion
    ];

    for (const listener of listeners) {
      if (listener) {
        await listener.remove();
      }
    }

    this.listenerToken = null;
    this.listenerNotificacion = null;
    this.listenerAccion = null;
  }
}
