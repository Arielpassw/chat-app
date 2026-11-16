
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly BUCKET_AVATARS = 'avatars';
  private readonly BUCKET_CHAT = 'chat-files';

  private readonly MAX_AVATAR = 5 * 1024 * 1024;
  private readonly MAX_ARCHIVO = 20 * 1024 * 1024;

  private readonly TIPOS_AVATAR = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  constructor(
    private supabaseService: SupabaseService
  ) {}

  // Obtener el ID del usuario autenticado
  private async obtenerUsuarioId(): Promise<string> {
    const { data, error } =
      await this.supabaseService.client.auth.getUser();

    if (error) throw error;

    if (!data.user) {
      throw new Error('No existe un usuario autenticado.');
    }

    return data.user.id;
  }

  // Limpiar el nombre del archivo
  private limpiarNombre(nombre: string): string {
    const nombreLimpio = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    return nombreLimpio || 'archivo';
  }

  // Validar que el archivo tenga contenido
  private validarArchivo(archivo: File): void {
    if (!archivo || archivo.size <= 0) {
      throw new Error('El archivo está vacío o no es válido.');
    }
  }

  // Subir foto de perfil
  async subirAvatar(archivo: File): Promise<{
    path: string;
    url: string;
  }> {
    this.validarArchivo(archivo);

    const usuarioId = await this.obtenerUsuarioId();

    if (!this.TIPOS_AVATAR.includes(archivo.type)) {
      throw new Error('Solo se permiten imágenes JPEG, PNG o WebP.');
    }

    if (archivo.size > this.MAX_AVATAR) {
      throw new Error('La imagen no puede superar los 5 MB.');
    }

    const nombre =
      `${Date.now()}-${this.limpiarNombre(archivo.name)}`;

    const path = `${usuarioId}/${nombre}`;

    const { data, error } =
      await this.supabaseService.client.storage
        .from(this.BUCKET_AVATARS)
        .upload(path, archivo, {
          cacheControl: '3600',
          upsert: false,
          contentType: archivo.type
        });

    if (error) throw error;

    const { data: urlData } =
      this.supabaseService.client.storage
        .from(this.BUCKET_AVATARS)
        .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  }

  // Subir archivo a una conversación
  async subirArchivoChat(
    chatId: string,
    archivo: File
  ): Promise<{
    path: string;
    nombre: string;
    tamano: number;
    tipo: string;
  }> {
    this.validarArchivo(archivo);

    if (!chatId || !chatId.trim()) {
      throw new Error('El ID de la conversación es obligatorio.');
    }

    const usuarioId = await this.obtenerUsuarioId();

    if (archivo.size > this.MAX_ARCHIVO) {
      throw new Error('El archivo no puede superar los 20 MB.');
    }

    const nombre =
      `${Date.now()}-${this.limpiarNombre(archivo.name)}`;

    const path = `${chatId}/${usuarioId}/${nombre}`;

    const tipo = archivo.type || 'application/octet-stream';

    const { data, error } =
      await this.supabaseService.client.storage
        .from(this.BUCKET_CHAT)
        .upload(path, archivo, {
          cacheControl: '3600',
          upsert: false,
          contentType: tipo
        });

    if (error) throw error;

    return {
      path: data.path,
      nombre: archivo.name,
      tamano: archivo.size,
      tipo
    };
  }

  // Obtener URL temporal de un archivo privado
  async obtenerUrlFirmada(
    path: string,
    segundos: number = 3600
  ): Promise<string> {
    if (!path || !path.trim()) {
      throw new Error('La ruta del archivo es obligatoria.');
    }

    if (!Number.isInteger(segundos) || segundos <= 0) {
      throw new Error('El tiempo de expiración no es válido.');
    }

    const { data, error } =
      await this.supabaseService.client.storage
        .from(this.BUCKET_CHAT)
        .createSignedUrl(path, segundos);

    if (error) throw error;

    return data.signedUrl;
  }

  // Obtener URL pública de un avatar
  obtenerUrlAvatar(path: string): string {
    if (!path || !path.trim()) {
      throw new Error('La ruta del avatar es obligatoria.');
    }

    const { data } =
      this.supabaseService.client.storage
        .from(this.BUCKET_AVATARS)
        .getPublicUrl(path);

    return data.publicUrl;
  }

  // Eliminar foto de perfil
  async eliminarAvatar(path: string): Promise<void> {
    if (!path || !path.trim()) {
      throw new Error('La ruta del avatar es obligatoria.');
    }

    const { error } =
      await this.supabaseService.client.storage
        .from(this.BUCKET_AVATARS)
        .remove([path]);

    if (error) throw error;
  }

  // Eliminar archivo de una conversación
  async eliminarArchivoChat(path: string): Promise<void> {
    if (!path || !path.trim()) {
      throw new Error('La ruta del archivo es obligatoria.');
    }

    const { error } =
      await this.supabaseService.client.storage
        .from(this.BUCKET_CHAT)
        .remove([path]);

    if (error) throw error;
  }
}
