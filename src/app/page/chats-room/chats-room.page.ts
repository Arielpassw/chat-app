import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonIcon
} from '@ionic/angular';

import { ActivatedRoute, Router } from '@angular/router';

import { ChatService } from '../../services/chat';
import { SupabaseService } from '../../services/supabase';

import { Mensaje } from '../../models/mensaje.model';


@Component({
  selector: 'app-chats-room',
  templateUrl: './chats-room.page.html',
  styleUrls: ['./chats-room.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class ChatsRoomPage implements OnInit, OnDestroy {

  chatId: string | null = null;

  usuarioId: string | null = null;

  nuevoMensaje = '';

  cargando = true;

  enviando = false;

  error = '';

  mensajes: Mensaje[] = [];

  contacto = {
    nombre: 'Conversación',
    avatar: 'C',
    estado: 'Conversación'
  };


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private supabaseService: SupabaseService
  ) {}


  async ngOnInit() {

    this.chatId =
      this.route.snapshot.paramMap.get('id');

    if (!this.chatId) {
      this.router.navigate(['/chats']);
      return;
    }

    try {

      const { data } =
        await this.supabaseService.client.auth.getUser();

      if (!data.user) {
        this.router.navigate(['/login']);
        return;
      }

      this.usuarioId = data.user.id;

      await this.cargarMensajes();

      await this.escucharMensajes();

    } catch (error) {

      console.error(
        'Error inicializando chat:',
        error
      );

      this.error =
        'No se pudo cargar la conversación.';

    } finally {

      this.cargando = false;

    }
  }


  async cargarMensajes() {

    if (!this.chatId) {
      return;
    }

    try {

      this.mensajes =
        await this.chatService.obtenerMensajes(
          this.chatId
        );

    } catch (error) {

      console.error(
        'Error obteniendo mensajes:',
        error
      );

      this.error =
        'No se pudieron cargar los mensajes.';
    }
  }


  async escucharMensajes() {

    if (!this.chatId) {
      return;
    }

    try {

      await this.chatService.escucharMensajes(
        this.chatId,
        (evento) => {

          if (evento.tipo === 'INSERT') {

            const mensaje =
              evento.mensaje as Mensaje;

            const existe =
              this.mensajes.some(
                m => m.id === mensaje.id
              );

            if (!existe) {
              this.mensajes.push(mensaje);
            }
          }


          if (evento.tipo === 'UPDATE') {

            const mensaje =
              evento.mensaje as Mensaje;

            const indice =
              this.mensajes.findIndex(
                m => m.id === mensaje.id
              );

            if (indice !== -1) {

              this.mensajes[indice] = {
                ...this.mensajes[indice],
                ...mensaje
              };
            }
          }


          if (evento.tipo === 'DELETE') {

            const mensaje =
              evento.mensaje as Mensaje;

            this.mensajes =
              this.mensajes.filter(
                m => m.id !== mensaje.id
              );
          }

        }
      );

    } catch (error) {

      console.error(
        'Error escuchando mensajes:',
        error
      );
    }
  }


  async enviarMensaje() {

    const contenido =
      this.nuevoMensaje.trim();

    if (
      !contenido ||
      !this.chatId ||
      this.enviando
    ) {
      return;
    }

    try {

      this.enviando = true;

      await this.chatService.enviarMensaje({

        chat_id: this.chatId,

        contenido: contenido,

        tipo: 'texto'

      });

      this.nuevoMensaje = '';

    } catch (error) {

      console.error(
        'Error enviando mensaje:',
        error
      );

      this.error =
        'No se pudo enviar el mensaje.';

    } finally {

      this.enviando = false;
    }
  }


  esMensajeMio(mensaje: Mensaje): boolean {

    return mensaje.sender_id === this.usuarioId;
  }


  obtenerHora(fecha: string | null): string {

    if (!fecha) {
      return '';
    }

    return new Date(fecha).toLocaleTimeString(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );
  }


  volverChats() {

    this.router.navigate(['/chats']);

  }


  async ngOnDestroy() {

    if (this.chatId) {

      await this.chatService.dejarDeEscuchar(
        this.chatId
      );

    }

  }

}