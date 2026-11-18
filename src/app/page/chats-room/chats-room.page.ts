import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private auth: Auth,
    private cdr: ChangeDetectorRef

  ) {
    addIcons({
      arrowBackOutline, chatbubblesOutline, alertCircleOutline, checkmarkDoneOutline,
      sendOutline, hourglassOutline, attachOutline, imageOutline, locationOutline,
      pencilOutline, trashOutline, documentOutline, closeOutline
    });
  }


  async ngOnInit(): Promise<void> {
    this.chatId = this.route.snapshot.paramMap.get('id');

    console.log('ID de conversación recibido:', this.chatId);

    if (!this.chatId) {
      this.error = 'No se recibió el identificador de la conversación.';
      this.cargando = false;
      // Forzar la detección de cambios para actualizar la vista.
      this.cdr.detectChanges();
      console.log(
        'ESTADO FINAL DE CARGA:',
        this.cargando
      );

      await this.router.navigate(['/chats']);
      return;
    }

    try {
      console.log('1. Verificando usuario...');

      const usuario = await this.auth.obtenerUsuario();

      if (!usuario) {
        await this.router.navigate(['/login']);
        return;
      }

      this.usuarioId = usuario.id;
      console.log('2. Usuario autenticado:', this.usuarioId);

      console.log('3. Cargando cabecera...');
      await this.cargarCabecera();

      console.log('4. Cargando mensajes...');
      await this.cargarMensajes();

      console.log('5. Finalizando carga inicial...');

      this.cargando = false;
      this.cdr.detectChanges();

      console.log(
        'ESTADO FINAL DE CARGA:',
        this.cargando
      );

      // Actualizar última lectura sin bloquear la pantalla.
      this.salaService.actualizarUltimaLectura(this.chatId)
        .catch(error => {
          console.warn('Error actualizando última lectura:', error);
        });

      // Activar mensajes en tiempo real.
      this.escucharMensajes().catch(error => {
        console.error('Error activando mensajes en tiempo real:', error);
        this.error = 'No se pudo activar la actualización en tiempo real.';
      });

      console.log('6. Pantalla de conversación inicializada.');

    } catch (error: any) {
      console.error('Error inicializando chat:', error);

      this.error =
        error?.message || 'No se pudo cargar la conversación.';

      this.cargando = false;

      // Forzar la detección de cambios para actualizar la vista.
      this.cdr.detectChanges();


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

      console.log('ID de sala:', this.chatId);
      console.log('Usuario actual:', this.usuarioId);
      console.log('Mensajes obtenidos:', this.mensajes);
      console.log('Mensajes recuperados:', this.mensajes);

      // Preparar archivos sin bloquear la carga de la conversación.
      for (const mensaje of this.mensajes) {
        this.prepararArchivo(mensaje).catch(error => {
          console.warn('Error preparando archivo:', error);
        });
      }

    } catch (error: any) {
      console.error('Error obteniendo mensajes:', error);

      this.error =
        error?.message || 'No se pudieron cargar los mensajes.';
    }
  }



  async prepararArchivo(mensaje: Mensaje): Promise<void> {
    if (
      !mensaje.archivo_url ||
      !['imagen', 'archivo'].includes(mensaje.tipo)
    ) {
      return;
    }

    try {
      console.log('Preparando archivo:', mensaje.id);

      const url = await this.storageService.obtenerUrlFirmada(
        mensaje.archivo_url
      );

      this.urlsArchivos.set(mensaje.id, url);

      console.log('URL del archivo preparada:', mensaje.id);

    } catch (error) {
      console.warn(
        'No se pudo generar la URL temporal:',
        mensaje.id,
        error
      );

    } finally {
      // Actualizar la vista cuando termine la carga del archivo.
      this.cdr.detectChanges();
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
          if (mensaje.sender_id !== this.usuarioId && this.chatId) {
            await this.salaService.actualizarUltimaLectura(this.chatId);
          }
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

      this.cdr.detectChanges();

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
      this.error = '';
      this.cdr.detectChanges();

      // 1. Guardar el mensaje en Supabase.
      const mensaje = await this.chatService.enviarMensaje({
        ...datos,
        chat_id: this.chatId
      });

      // 2. Mostrarlo inmediatamente, evitando duplicados
      // si también llega mediante Realtime.
      if (!this.mensajes.some(m => m.id === mensaje.id)) {
        this.mensajes.push(mensaje);
      }

      this.cdr.detectChanges();

      // 3. Enviar la notificación sin bloquear el envío.
      this.notificacionesService
        .enviarNotificacion(mensaje.chat_id, mensaje.id)
        .catch(error => {
          console.warn(
            'El mensaje se envió, pero falló la notificación:',
            error
          );
        });

    } catch (error: any) {
      console.error('Error enviando mensaje:', error);

      this.error =
        error?.message || 'No se pudo enviar el mensaje.';

    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }


  async seleccionarArchivo(event: Event): Promise<void> {
    if (!this.chatId) return;
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    try {
      await this.router.navigate(['/media-preview'], {
        state: { archivo, chatId: this.chatId }
      });
    } catch (error: any) {
      this.error = error?.message || 'No se pudo abrir la vista previa.';
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
