
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

import {
    Sala,
    CrearSala,
    ParticipanteSala,
    AgregarParticipante
} from '../models/sala.model';

@Injectable({
    providedIn: 'root'
})
export class SalaService {

    constructor(
        private supabaseService: SupabaseService
    ) { }

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

    // Crear una sala individual o grupal
    async crearSala(datos: CrearSala): Promise<Sala> {
        const usuarioId = await this.obtenerUsuarioId();

        const { data: sala, error } =
            await this.supabaseService.client
                .from('chats')
                .insert({
                    nombre: datos.nombre ?? null,
                    tipo: datos.tipo,
                    imagen_url: datos.imagen_url ?? null,
                    creado_por: usuarioId
                })
                .select()
                .single();

        if (error) throw error;

        // Agregar al creador como administrador
        const { error: errorParticipante } =
            await this.supabaseService.client
                .from('chat_participants')
                .insert({
                    chat_id: sala.id,
                    user_id: usuarioId,
                    rol: 'administrador'
                });

        if (errorParticipante) {
            throw errorParticipante;
        }

        return sala as Sala;
    }

    // Agregar participantes a una sala
    async agregarParticipantes(
        datos: AgregarParticipante[]
    ): Promise<void> {

        if (datos.length === 0) return;

        const participantes = datos.map(participante => ({
            chat_id: participante.chat_id,
            user_id: participante.user_id,
            rol: participante.rol ?? 'miembro'
        }));

        const { error } =
            await this.supabaseService.client
                .from('chat_participants')
                .insert(participantes);

        if (error) throw error;
    }

    // Consultar las salas del usuario autenticado
    async obtenerMisSalas(): Promise<any[]> {
        const usuarioId = await this.obtenerUsuarioId();

        const { data, error } =
            await this.supabaseService.client
                .from('chat_participants')
                .select(`
          id,
          chat_id,
          user_id,
          rol,
          unido_en,
          ultimo_mensaje_leido,
          chats (*)
        `)
                .eq('user_id', usuarioId)
                .order('unido_en', { ascending: false });

        if (error) throw error;

        return data ?? [];
    }

    // Consultar participantes de una sala
    async obtenerParticipantes(
        chatId: string
    ): Promise<ParticipanteSala[]> {

        const { data, error } =
            await this.supabaseService.client
                .from('chat_participants')
                .select('*')
                .eq('chat_id', chatId)
                .order('unido_en', { ascending: true });

        if (error) throw error;

        return (data ?? []) as ParticipanteSala[];
    }

    // Actualizar información de una sala
    async actualizarSala(
        chatId: string,
        datos: {
            nombre?: string | null;
            imagen_url?: string | null;
        }
    ): Promise<void> {
        const { error } = await this.supabaseService.client
            .from('chats')
            .update({
                ...datos,
                actualizado_en: new Date().toISOString()
            })
            .eq('id', chatId);

        if (error) throw error;
    }

    // Actualizar la última fecha de lectura
    async actualizarUltimaLectura(
        chatId: string
    ): Promise<void> {

        const usuarioId = await this.obtenerUsuarioId();

        const { error } =
            await this.supabaseService.client
                .from('chat_participants')
                .update({
                    ultimo_mensaje_leido: new Date().toISOString()
                })
                .eq('chat_id', chatId)
                .eq('user_id', usuarioId);

        if (error) throw error;
    }
}