import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';

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
export class ChatsPage {

  // Datos temporales para construir la interfaz.
  // Más adelante serán reemplazados por datos de Supabase.
  conversaciones = [
    {
      id: 1,
      nombre: 'María González',
      mensaje: '¡Hola! ¿Cómo estás?',
      hora: '10:32',
      avatar: 'MG',
      noLeidos: 2
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      mensaje: 'Nos vemos mañana 👍',
      hora: '09:45',
      avatar: 'JP',
      noLeidos: 0
    },
    {
      id: 3,
      nombre: 'Proyecto Universitario',
      mensaje: 'Carlos: Ya terminé mi parte',
      hora: 'Ayer',
      avatar: 'PU',
      noLeidos: 5
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      mensaje: 'Te envié el archivo',
      hora: 'Ayer',
      avatar: 'AR',
      noLeidos: 0
    }
  ];

  constructor(private router: Router) {}

  abrirChat(chat: any) {
    this.router.navigate(['/chats-room', chat.id]);
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