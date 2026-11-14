
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

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
  ],
})
export class ChatsRoomPage implements OnInit {

  chatId: string | null = null;

  contacto = {
    nombre: 'María González',
    avatar: 'MG',
    estado: 'En línea'
  };

  nuevoMensaje = '';

  mensajes = [
    {
      id: 1,
      texto: '¡Hola! ¿Cómo estás?',
      hora: '10:30',
      enviado: false
    },
    {
      id: 2,
      texto: '¡Hola María! Muy bien, ¿y tú?',
      hora: '10:31',
      enviado: true
    },
    {
      id: 3,
      texto: 'Muy bien, gracias 😊',
      hora: '10:32',
      enviado: false
    },
    {
      id: 4,
      texto: '¿Ya revisaste el proyecto?',
      hora: '10:33',
      enviado: false
    },
    {
      id: 5,
      texto: 'Sí, estuve revisando los últimos cambios.',
      hora: '10:34',
      enviado: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
  }

  enviarMensaje() {
    const texto = this.nuevoMensaje.trim();

    if (!texto) {
      return;
    }

    const horaActual = new Date().toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    this.mensajes.push({
      id: Date.now(),
      texto: texto,
      hora: horaActual,
      enviado: true
    });

    this.nuevoMensaje = '';
  }

  volverChats() {
    this.router.navigate(['/chats']);
  }

  irAContactos() {
    this.router.navigate(['/contacts']);
  }

}
