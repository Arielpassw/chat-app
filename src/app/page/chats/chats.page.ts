import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';

import { SalaService } from '../../services/sala';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class ChatsPage implements OnInit {

  conversaciones: any[] = [];

  cargando = true;

  error = '';

  constructor(
    private router: Router,
    private salaService: SalaService
  ) {}

  async ngOnInit() {
    await this.cargarConversaciones();
  }

  async cargarConversaciones() {

    try {

      this.cargando = true;
      this.error = '';

      const salas =
        await this.salaService.obtenerMisSalas();

      console.log('Salas obtenidas:', salas);

      this.conversaciones =
        salas.map((participacion: any) => {

          const chat = participacion.chats;

          return {
            id: participacion.chat_id,

            nombre:
              chat?.nombre ||
              'Conversación',

            mensaje:
              'Sin mensajes todavía',

            hora: '',

            avatar:
              this.obtenerIniciales(
                chat?.nombre ||
                'Conversación'
              ),

            noLeidos: 0
          };

        });

    } catch (error) {

      console.error(
        'Error cargando conversaciones:',
        error
      );

      this.error =
        'No se pudieron cargar tus conversaciones.';

    } finally {

      this.cargando = false;

    }
  }


  obtenerIniciales(nombre: string): string {

    const palabras =
      nombre
        .trim()
        .split(' ')
        .filter(p => p.length > 0);

    if (palabras.length === 1) {

      return palabras[0]
        .substring(0, 2)
        .toUpperCase();

    }

    return (
      palabras[0][0] +
      palabras[1][0]
    ).toUpperCase();
  }


  abrirChat(chat: any) {

    console.log(
      'Abriendo sala:',
      chat.id
    );

    this.router.navigate([
      '/chats-room',
      chat.id
    ]);

  }


  irAContactos() {
    this.router.navigate(['/contacts']);
  }


  irAPerfil() {
    this.router.navigate(['/profile']);
  }


  volverHome() {
    this.router.navigate(['/home']);
  }

}