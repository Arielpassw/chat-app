import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, chatbubblesOutline, alertCircleOutline, checkmarkDoneOutline,
  sendOutline, hourglassOutline, attachOutline, imageOutline, locationOutline,
  pencilOutline, trashOutline, documentOutline, closeOutline
} from 'ionicons/icons';

import { ChatService } from '../../services/chat';
import { SalaService } from '../../services/sala';
import { UsuarioService } from '../../services/usuario';
import { StorageService } from '../../services/storage';
import { UbicacionService } from '../../services/ubicacion';
import { NotificacionesService } from '../../services/notificaciones';
import { Auth } from '../../services/auth';
import { Mensaje } from '../../models/mensaje.model';

@Component({
  selector: 'app-chats-room',
  templateUrl: './chats-room.page.html',
  styleUrls: ['./chats-room.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class ChatsRoomPage implements OnInit, OnDestroy {
  chatId: string | null = null;
  usuarioId: string | null = null;
  nuevoMensaje = '';
  cargando = true;
  enviando = false;
  error = '';
  mensajes: Mensaje[] = [];
  urlsArchivos = new Map<string, string>();
  editandoId: string | null = null;
  textoEdicion = '';
  contacto = { nombre: 'Conversación', avatar: 'C', estado: 'Activo' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private salaService: SalaService,
    private usuarioService: UsuarioService,
    private storageService: StorageService,
    private ubicacionService: UbicacionService,
    private notificacionesService: NotificacionesService,
    private auth: Auth
  ) {
    addIcons({
      arrowBackOutline, chatbubblesOutline, alertCircleOutline, checkmarkDoneOutline,
      sendOutline, hourglassOutline, attachOutline, imageOutline, locationOutline,
      pencilOutline, trashOutline, documentOutline, closeOutline
    });
  }

  async ngOnInit(): Promise<void> {
    this.chatId = this.route.snapshot.paramMap.get('id');
    if (!this.chatId) {
      await this.router.navigate(['/chats']);
      return;
    }

    try {
      const usuario = await this.auth.obtenerUsuario();
      if (!usuario) {
        await this.router.navigate(['/login']);
        return;
      }

      this.usuarioId = usuario.id;
      await this.cargarCabecera();
      await this.cargarMensajes();
      await this.escucharMensajes();
    } catch (error: any) {
      console.error('Error inicializando chat:', error);
      this.error = error?.message || 'No se pudo cargar la conversación.';
    } finally {
      this.cargando = false;
    }
  }

  async cargarCabecera(): Promise<void> {
    if (!this.chatId) return;

    try {
      const salas = await this.salaService.obtenerMisSalas();
      const sala = salas.find(s => s.chat_id === this.chatId)?.chats;
      if (sala?.nombre) {
        this.contacto.nombre = sala.nombre;
        this.contacto.avatar = this.obtenerIniciales(sala.nombre);
      }

      if (sala?.tipo === 'individual') {
        const participantes = await this.salaService.obtenerParticipantes(this.chatId);
        const otro = participantes.find(p => p.user_id !== this.usuarioId);
        if (otro) {
          const perfil = await this.usuarioService.obtenerPerfilPorId(otro.user_id);
          if (perfil) {
            this.contacto.nombre = perfil.nombre || this.contacto.nombre;
            this.contacto.avatar = this.obtenerIniciales(perfil.nombre || 'U');
            this.contacto.estado = perfil.estado || 'Disponible';
          }
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar la cabecera del chat:', error);
    }
  }

  async cargarMensajes(): Promise<void> {
    if (!this.chatId) return;

    try {
      this.error = '';
      this.mensajes = await this.chatService.obtenerMensajes(this.chatId);

      for (const mensaje of this.mensajes) {
        await this.prepararArchivo(mensaje);
      }
    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);
      this.error = error?.message || 'No se pudieron cargar los mensajes.';
    }
  }

  async prepararArchivo(mensaje: Mensaje): Promise<void> {
    if (!mensaje.archivo_url || !['imagen', 'archivo'].includes(mensaje.tipo)) return;
    try {
      const url = await this.storageService.obtenerUrlFirmada(mensaje.archivo_url);
      this.urlsArchivos.set(mensaje.id, url);
    } catch (error) {
      console.warn('No se pudo generar la URL temporal:', error);
    }
  }

  async escucharMensajes(): Promise<void> {
    if (!this.chatId) return;

    await this.chatService.escucharMensajes(this.chatId, async evento => {
      const mensaje = evento.mensaje as Mensaje;

      if (evento.tipo === 'INSERT') {
        if (!this.mensajes.some(m => m.id === mensaje.id)) {
          this.mensajes.push(mensaje);
          await this.prepararArchivo(mensaje);
        }
      } else if (evento.tipo === 'UPDATE') {
        const indice = this.mensajes.findIndex(m => m.id === mensaje.id);
        if (indice !== -1) {
          this.mensajes[indice] = { ...this.mensajes[indice], ...mensaje };
          await this.prepararArchivo(this.mensajes[indice]);
        }
      } else if (evento.tipo === 'DELETE') {
        this.mensajes = this.mensajes.filter(m => m.id !== mensaje.id);
        this.urlsArchivos.delete(mensaje.id);
      }
    });
  }

  async enviarMensaje(): Promise<void> {
    const contenido = this.nuevoMensaje.trim();
    if (!contenido || !this.chatId || this.enviando) return;

    await this.enviar({
      chat_id: this.chatId,
      contenido,
      tipo: 'texto'
    });
    this.nuevoMensaje = '';
  }

  async enviar(datos: any): Promise<void> {
    if (!this.chatId || this.enviando) return;

    try {
      this.enviando = true;
      const mensaje = await this.chatService.enviarMensaje(datos);

      // Firebase FCM + Edge Function de Supabase.
      try {
        await this.notificacionesService.enviarNotificacion(mensaje.chat_id, mensaje.id);
      } catch (error) {
        console.warn('El mensaje se envió, pero la notificación no pudo procesarse:', error);
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      this.error = error?.message || 'No se pudo enviar el mensaje.';
    } finally {
      this.enviando = false;
    }
  }

  async seleccionarArchivo(event: Event): Promise<void> {
    if (!this.chatId) return;
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    try {
      const subido = await this.storageService.subirArchivoChat(this.chatId, archivo);
      const tipo = archivo.type.startsWith('image/') ? 'imagen' : 'archivo';

      await this.enviar({
        chat_id: this.chatId,
        tipo,
        contenido: tipo === 'imagen' ? 'Imagen compartida' : 'Archivo compartido',
        archivo_url: subido.path,
        archivo_nombre: subido.nombre,
        archivo_tamano: subido.tamano
      });
    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      this.error = error?.message || 'No se pudo subir el archivo.';
    } finally {
      input.value = '';
    }
  }

  async compartirUbicacion(): Promise<void> {
    if (!this.chatId) return;

    try {
      const ubicacion = await this.ubicacionService.obtenerUbicacion();

      await this.enviar({
        chat_id: this.chatId,
        tipo: 'ubicacion',
        contenido: '📍 Ubicación compartida',
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud
      });
    } catch (error: any) {
      console.error('Error compartiendo ubicación:', error);
      this.error = error?.message || 'No se pudo obtener la ubicación.';
    }
  }

  iniciarEdicion(mensaje: Mensaje): void {
    this.editandoId = mensaje.id;
    this.textoEdicion = mensaje.contenido || '';
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.textoEdicion = '';
  }

  async guardarEdicion(mensaje: Mensaje): Promise<void> {
    const texto = this.textoEdicion.trim();
    if (!texto) return;

    try {
      await this.chatService.editarMensaje(mensaje.id, texto);
      this.cancelarEdicion();
    } catch (error: any) {
      this.error = error?.message || 'No se pudo editar el mensaje.';
    }
  }

  async eliminarMensaje(mensaje: Mensaje): Promise<void> {
    if (!confirm('¿Eliminar este mensaje?')) return;

    try {
      await this.chatService.eliminarMensaje(mensaje.id);
    } catch (error: any) {
      this.error = error?.message || 'No se pudo eliminar el mensaje.';
    }
  }

  esMensajeMio(mensaje: Mensaje): boolean {
    return mensaje.sender_id === this.usuarioId;
  }

  obtenerHora(fecha: string | null): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-EC', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    return partes.length === 1
      ? partes[0].substring(0, 2).toUpperCase()
      : `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  abrirUbicacion(mensaje: Mensaje): void {
    if (mensaje.latitud == null || mensaje.longitud == null) return;
    window.open(`https://www.google.com/maps?q=${mensaje.latitud},${mensaje.longitud}`, '_blank');
  }

  volverChats(): void { this.router.navigate(['/chats']); }

  async ngOnDestroy(): Promise<void> {
    if (this.chatId) {
      await this.chatService.dejarDeEscuchar(this.chatId);
    }
  }
}
