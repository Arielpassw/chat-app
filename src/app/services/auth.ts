
import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  Session
} from '@supabase/supabase-js';

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
    if (!nombre.trim()) {
      throw new Error('El nombre es obligatorio.');
    }

    if (!email.trim() || !password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    const { data, error } =
      await this.supabaseService.client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'io.ionic.starter://login-callback',
          data: {
            nombre: nombre.trim()
          }
        }
      });

    if (error) throw error;

    return data;
  }

  // Iniciar sesión
  async iniciarSesion(
    email: string,
    password: string
  ) {
    if (!email.trim() || !password) {
      throw new Error('El correo y la contraseña son obligatorios.');
    }

    const { data, error } =
      await this.supabaseService.client.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (error) throw error;

    return data;
  }

  // Cerrar sesión
  async cerrarSesion(): Promise<void> {
    const { error } =
      await this.supabaseService.client.auth.signOut();

    if (error) throw error;
  }

  // Obtener la sesión actual
  async obtenerSesion(): Promise<Session | null> {
    const { data, error } =
      await this.supabaseService.client.auth.getSession();

    if (error) throw error;

    return data.session;
  }

  // Obtener el usuario autenticado
  async obtenerUsuario() {
    const { data, error } =
      await this.supabaseService.client.auth.getUser();

    if (error) throw error;

    return data.user;
  }

  // Recuperar contraseña mediante correo electrónico
  async recuperarPassword(email: string): Promise<void> {
    if (!email.trim()) {
      throw new Error('El correo electrónico es obligatorio.');
    }

    const { error } =
      await this.supabaseService.client.auth
        .resetPasswordForEmail(email.trim());

    if (error) throw error;
  }

  // Escuchar cambios en la autenticación
  escucharCambios(
    callback: (
      evento: AuthChangeEvent,
      sesion: Session | null
    ) => void
  ) {
    const { data } =
      this.supabaseService.client.auth.onAuthStateChange(
        (evento, sesion) => {
          callback(evento, sesion);
        }
      );

    return data.subscription;
  }
}
