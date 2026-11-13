import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

import {
  Mensaje,
  CrearMensaje
} from '../models/mensaje.model';

import type { RealtimeChannel } from '@supabase/supabase-js';

export interface EventoMensaje {
  tipo: 'INSERT' | 'UPDATE' | 'DELETE';
  mensaje: Partial<Mensaje>;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private canales: Map<string, RealtimeChannel> = new Map();

  constructor(
    private supabaseService: SupabaseService
  ) {}

  // Obtener el usuario autenticado
  private async obtenerUsuarioId(): Promise<string> {

    const { data, error } =
      await this.supabaseService.client.auth.getUser();

    if (error) throw error;

    if (!data.user) {
      throw new Error('No existe un usuario autenticado.');
    }

    return data.user.id;
  }

  // Enviar un mensaje
  async enviarMensaje(
    datos: Omit<CrearMensaje, 'sender_id'>
  ): Promise<Mensaje> {

    const usuarioId = await this.obtenerUsuarioId();

    const { data, error } =
      await this.supabaseService.client
        .from('messages')
        .insert({
          ...datos,
          sender_id: usuarioId,
          tipo: datos.tipo ?? 'texto'
        })
        .select()
        .single();

    if (error) throw error;

    return data as Mensaje;
  }

  // Consultar mensajes de una conversación
  async obtenerMensajes(chatId: string): Promise<Mensaje[]> {

    const { data, error } =
      await this.supabaseService.client
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('creado_en', { ascending: true });

    if (error) throw error;

    return (data ?? []) as Mensaje[];
  }

  // Editar un mensaje propio
  async editarMensaje(
    mensajeId: string,
    nuevoContenido: string
  ): Promise<Mensaje> {

    const { data, error } =
      await this.supabaseService.client
        .from('messages')
        .update({
          contenido: nuevoContenido,
          editado_en: new Date().toISOString()
        })
        .eq('id', mensajeId)
        .select()
        .single();

    if (error) throw error;

    return data as Mensaje;
  }

  // Eliminar lógicamente un mensaje propio
  async eliminarMensaje(mensajeId: string): Promise<void> {

    const { error } =
      await this.supabaseService.client
        .from('messages')
        .update({
          contenido: null,
          archivo_url: null,
          archivo_nombre: null,
          archivo_tamano: null,
          latitud: null,
          longitud: null,
          eliminado_en: new Date().toISOString()
        })
        .eq('id', mensajeId);

    if (error) throw error;
  }

  // Escuchar eventos de mensajes en tiempo real
  async escucharMensajes(
    chatId: string,
    callback: (evento: EventoMensaje) => void
  ): Promise<RealtimeChannel> {

    // Eliminar primero una suscripción anterior
    await this.dejarDeEscuchar(chatId);

    const canal = this.supabaseService.client
      .channel(`mensajes-chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {

          callback({
            tipo: payload.eventType,
            mensaje: (
              payload.eventType === 'DELETE'
                ? payload.old
                : payload.new
            ) as Partial<Mensaje>
          });
        }
      )
      .subscribe();

    this.canales.set(chatId, canal);

    return canal;
  }

  // Dejar de escuchar una conversación
  async dejarDeEscuchar(chatId: string): Promise<void> {

    const canal = this.canales.get(chatId);

    if (canal) {
      await this.supabaseService.client.removeChannel(canal);
      this.canales.delete(chatId);
    }
  }

  // Cerrar todos los canales activos
  async cerrarTodosLosCanales(): Promise<void> {

    const canales = Array.from(this.canales.values());

    for (const canal of canales) {
      await this.supabaseService.client.removeChannel(canal);
    }

    this.canales.clear();
  }
}