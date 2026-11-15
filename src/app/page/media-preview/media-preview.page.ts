import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.page.html',
  styleUrls: ['./media-preview.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MediaPreviewPage {

  archivo = {
    nombre: 'imagen-chat.jpg',
    tipo: 'Imagen',
    tamano: '2.4 MB',
    url: 'assets/placeholder-image.jpg'
  };

  constructor(private router: Router) {}

  volverChat() {
    this.router.navigate(['/chats-room']);
  }

  cancelar() {
    this.router.navigate(['/chats-room']);
  }

  enviarArchivo() {
    console.log('Archivo listo para enviar:', this.archivo);
    this.router.navigate(['/chats-room']);
  }
}