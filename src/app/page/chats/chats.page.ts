import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, personOutline, searchOutline, addOutline,
  chevronForwardOutline, chatbubblesOutline, alertCircleOutline
} from 'ionicons/icons';
import { SalaService } from '../../services/sala';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class ChatsPage implements OnInit {
  conversaciones: any[] = [];
  busqueda = '';
  cargando = true;
  error = '';

  constructor(
    private router: Router,
    private salaService: SalaService,
    private chatService: ChatService
  ) {
    addIcons({
      arrowBackOutline, personOutline, searchOutline, addOutline,
      chevronForwardOutline, chatbubblesOutline, alertCircleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarConversaciones();
  }

  async cargarConversaciones(): Promise<void> {
    try {
      this.cargando = true;
      this.error = '';

      const salas = await this.salaService.obtenerMisSalas();
      const resultado = [];

      for (const participacion of salas) {
        const chat = participacion.chats;
        let mensaje = 'Sin mensajes todavía';
        let hora = '';

        try {
          const mensajes = await this.chatService.obtenerMensajes(participacion.chat_id);
          const ultimo = mensajes[mensajes.length - 1];
          if (ultimo) {
            mensaje = ultimo.eliminado_en
              ? 'Mensaje eliminado'
              : ultimo.contenido || (ultimo.tipo === 'imagen' ? '📷 Imagen' :
                ultimo.tipo === 'archivo' ? '📎 Archivo' : '📍 Ubicación');
            hora = this.obtenerHora(ultimo.creado_en);
          }
        } catch {
          // La sala sigue siendo visible aunque no se pueda consultar su último mensaje.
        }

        resultado.push({
          id: participacion.chat_id,
          nombre: chat?.nombre || 'Conversación',
          mensaje,
          hora,
          avatar: this.obtenerIniciales(chat?.nombre || 'Conversación'),
          noLeidos: 0
        });
      }

      this.conversaciones = resultado;
    } catch (error: any) {
      console.error('Error cargando conversaciones:', error);
      this.error = error?.message || 'No se pudieron cargar tus conversaciones.';
    } finally {
      this.cargando = false;
    }
  }

  get conversacionesFiltradas(): any[] {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) return this.conversaciones;
    return this.conversaciones.filter(c =>
      c.nombre.toLowerCase().includes(texto)
    );
  }

  obtenerIniciales(nombre: string): string {
    const palabras = nombre.trim().split(/\s+/).filter(Boolean);
    return palabras.length === 1
      ? palabras[0].substring(0, 2).toUpperCase()
      : `${palabras[0][0]}${palabras[1][0]}`.toUpperCase();
  }

  obtenerHora(fecha: string | null): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-EC', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  abrirChat(chat: any): void {
    this.router.navigate(['/chats-room', chat.id]);
  }

  irAContactos(): void { this.router.navigate(['/contacts']); }
  irACrearSala(): void { this.router.navigate(['/create-room']); }
  irAPerfil(): void { this.router.navigate(['/profile']); }
  volverHome(): void { this.router.navigate(['/home']); }
}
