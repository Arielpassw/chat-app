import { Component } from '@angular/core';
import {
  IonContent,
  IonButton
} from '@ionic/angular';

import { NotificacionesService } from '../services/notificaciones';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    IonButton
  ],
})
export class HomePage {

  constructor(
    private notificacionesService: NotificacionesService
  ) {}

  async probarTokenFCM(): Promise<void> {

    console.log('Solicitando token FCM...');

    const token = await this.notificacionesService.obtenerTokenDispositivo();

    if (token) {
      console.log('TOKEN FCM OBTENIDO CORRECTAMENTE:', token);
    } else {
      console.log('No se pudo obtener el token FCM.');
    }
  }
}