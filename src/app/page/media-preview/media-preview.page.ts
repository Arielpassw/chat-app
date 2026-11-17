import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage';
import { ChatService } from '../../services/chat';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.page.html',
  styleUrls: ['./media-preview.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MediaPreviewPage implements OnDestroy {
  archivo: File | null = null;
  chatId = '';
  url = '';
  error = '';
  enviando = false;

  constructor(
    private router: Router,
    private storage: StorageService,
    private chat: ChatService,
    private notificaciones: NotificacionesService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state ?? history.state;
    this.archivo = state?.['archivo'] instanceof File ? state['archivo'] as File : null;
    this.chatId = typeof state?.['chatId'] === 'string' ? state['chatId'] : '';
    if (this.archivo && this.archivo.type.startsWith('image/')) {
      this.url = URL.createObjectURL(this.archivo);
    }
    if (!this.archivo || !this.chatId) {
      this.error = 'No se recibió un archivo válido ni una conversación.';
    }
  }

  get tamano(): string {
    return this.archivo ? `${(this.archivo.size / 1024 / 1024).toFixed(2)} MB` : '';
  }

  volverChat(): void { void this.router.navigate(['/chats-room', this.chatId]); }
  cancelar(): void { this.volverChat(); }

  async enviarArchivo(): Promise<void> {
    if (!this.archivo || !this.chatId || this.enviando) return;
    this.enviando = true;
    this.error = '';
    try {
      const subido = await this.storage.subirArchivoChat(this.chatId, this.archivo);
      const tipo = this.archivo.type.startsWith('image/') ? 'imagen' : 'archivo';
      const mensaje = await this.chat.enviarMensaje({
        chat_id: this.chatId,
        tipo,
        contenido: tipo === 'imagen' ? 'Imagen compartida' : 'Archivo compartido',
        archivo_url: subido.path,
        archivo_nombre: subido.nombre,
        archivo_tamano: subido.tamano
      });
      try {
        await this.notificaciones.enviarNotificacion(mensaje.chat_id, mensaje.id);
      } catch (error) {
        console.warn('El archivo se envió, pero la notificación falló:', error);
      }
      await this.router.navigate(['/chats-room', this.chatId]);
    } catch (error: any) {
      this.error = error?.message || 'No se pudo enviar el archivo.';
    } finally {
      this.enviando = false;
    }
  }

  ngOnDestroy(): void {
    if (this.url) URL.revokeObjectURL(this.url);
  }
}
