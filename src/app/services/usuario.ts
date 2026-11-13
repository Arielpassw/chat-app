
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

import {
    Usuario,
    CrearUsuario,
    ActualizarUsuario,
    Contacto
} from '../models/usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    constructor(
        private supabaseService: SupabaseService
    ) { }

    // Crear un perfil
    async crearPerfil(datos: CrearUsuario): Promise<Usuario> {
        const { data, error } = await this.supabaseService.client
            .from('profiles')
            .insert(datos)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Usuario;
    }

    // Obtener el perfil del usuario autenticado
    async obtenerMiPerfil(): Promise<Usuario | null> {
        const { data: { user }, error: errorUsuario } =
            await this.supabaseService.client.auth.getUser();

        if (errorUsuario) {
            throw errorUsuario;
        }

        if (!user) {
            return null;
        }

        return this.obtenerPerfilPorId(user.id);
    }

    // Obtener un perfil mediante su ID
    async obtenerPerfilPorId(id: string): Promise<Usuario | null> {
        const { data, error } = await this.supabaseService.client
            .from('profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data as Usuario | null;
    }

    // Actualizar el perfil del usuario autenticado
    async actualizarMiPerfil(
        datos: ActualizarUsuario
    ): Promise<Usuario> {

        const { data: { user }, error: errorUsuario } =
            await this.supabaseService.client.auth.getUser();

        if (errorUsuario) {
            throw errorUsuario;
        }

        if (!user) {
            throw new Error('No existe un usuario autenticado.');
        }

        const { data, error } = await this.supabaseService.client
            .from('profiles')
            .update(datos)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data as Usuario;
    }


    // Buscar contactos mediante la función RPC de Supabase
    async buscarUsuarios(texto: string): Promise<Contacto[]> {
        const busqueda = texto.trim();

        // Evitar búsquedas vacías o demasiado cortas
        if (busqueda.length < 2) {
            return [];
        }

        const { data, error } = await this.supabaseService.client
            .rpc('buscar_perfiles', {
                p_busqueda: busqueda
            });

        if (error) {
            console.error('Error buscando contactos:', error);
            throw error;
        }

        return (data ?? []) as Contacto[];
    }


    // Consultar todos los perfiles visibles según las políticas RLS
    async obtenerUsuarios(): Promise<Usuario[]> {
        const { data, error } = await this.supabaseService.client
            .from('profiles')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            throw error;
        }

        return (data ?? []) as Usuario[];
    }
}
