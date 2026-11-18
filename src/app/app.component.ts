import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  searchOutline,
  addOutline,
  chevronForwardOutline,
  chatbubblesOutline,
  checkmarkDoneOutline,
  sendOutline,
  hourglassOutline,
  alertCircleOutline,
  closeCircleOutline,
  peopleOutline,
  chatbubbleOutline,
  chatbubbleEllipsesOutline,
  settingsOutline,
  createOutline,
  atOutline,
  mailOutline,
  callOutline,
  checkmarkOutline,
  logOutOutline,
  imageOutline,
  closeOutline,
} from 'ionicons/icons';

import { SupabaseService } from './services/supabase';
import { PreferenciasService } from './services/preferencias';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ]
})
export class AppComponent implements OnInit {

  private ultimoCodigoProcesado = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private preferencias: PreferenciasService
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      searchOutline,
      addOutline,
      chevronForwardOutline,
      chatbubblesOutline,
      checkmarkDoneOutline,
      sendOutline,
      hourglassOutline,
      alertCircleOutline,
      closeCircleOutline,
      peopleOutline,
      chatbubbleOutline,
      chatbubbleEllipsesOutline,
      settingsOutline,
      createOutline,
      atOutline,
      mailOutline,
      callOutline,
      checkmarkOutline,
      logOutOutline,
      imageOutline,
      closeOutline,
    });

    void this.configurarDeepLinks();
  }

  async ngOnInit(): Promise<void> {
    try {
      const modoOscuro =
        await this.preferencias.obtener<boolean>('modo_oscuro') ?? false;

      document.documentElement.classList.toggle(
        'dark-mode',
        modoOscuro
      );

      document.documentElement.classList.toggle(
        'ion-palette-dark',
        modoOscuro
      );

    } catch (error) {
      console.warn(
        'No se pudo cargar la preferencia de tema:',
        error
      );
    }
  }

  private async configurarDeepLinks(): Promise<void> {
    await App.addListener('appUrlOpen', async (evento) => {
      await this.procesarEnlace(evento.url);
    });

    const inicio = await App.getLaunchUrl();

    if (inicio?.url) {
      await this.procesarEnlace(inicio.url);
    }
  }

  private async procesarEnlace(url: string): Promise<void> {
    try {
      const enlace = new URL(url);

      if (
        enlace.protocol !== 'io.ionic.starter:' ||
        enlace.hostname !== 'login-callback'
      ) {
        return;
      }

      const error = enlace.searchParams.get('error_description');

      if (error) {
        console.error('Error de confirmación:', error);
        await this.router.navigateByUrl('/login');
        return;
      }

      const codigo = enlace.searchParams.get('code');

      if (!codigo || codigo === this.ultimoCodigoProcesado) {
        return;
      }

      this.ultimoCodigoProcesado = codigo;

      const { error: errorSesion } =
        await this.supabaseService.client.auth.exchangeCodeForSession(codigo);

      if (errorSesion) {
        this.ultimoCodigoProcesado = '';
        throw errorSesion;
      }

      console.log(
        'Correo confirmado y sesión autenticada correctamente.'
      );

      await this.router.navigateByUrl('/login');

    } catch (error) {
      console.error(
        'No se pudo procesar el enlace de autenticación:',
        error
      );

      await this.router.navigateByUrl('/login');
    }
  }
}