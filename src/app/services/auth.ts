
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
    providedIn: 'root'
})
export class Auth {

    constructor(
        private supabaseService: SupabaseService
    ) { }

    // Registrar un usuario
    async registrar(
        nombre: string,
        email: string,
        password: string
    ) {
        const { data, error } =
            await this.supabaseService.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: nombre.trim()
                    }
                }
            });

        if (error) {
            throw error;
        }

        return data;
    }

    // Iniciar sesión
    async iniciarSesion(email: string, password: string) {
        const { data, error } =
            await this.supabaseService.client.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        return data;
    }

    // Cerrar sesión
    async cerrarSesion(): Promise<void> {
        const { error } =
            await this.supabaseService.client.auth.signOut();

        if (error) {
            throw error;
        }
    }

    // Obtener la sesión actual
    async obtenerSesion() {
        const { data, error } =
            await this.supabaseService.client.auth.getSession();

        if (error) {
            throw error;
        }

        return data.session;
    }

    // Obtener el usuario autenticado
    async obtenerUsuario() {
        const { data, error } =
            await this.supabaseService.client.auth.getUser();

        if (error) {
            throw error;
        }

        return data.user;
    }

    // Escuchar cambios en la autenticación
    escucharCambios(callback: (sesion: any) => void) {
        const { data } =
            this.supabaseService.client.auth.onAuthStateChange(
                (_evento, sesion) => {
                    callback(sesion);
                }
            );

        return data.subscription;
    }
}
