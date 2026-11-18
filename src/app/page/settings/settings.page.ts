import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonToggle,
  IonIcon
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  notificationsOutline,
  moonOutline,
  trashOutline,
  checkmarkOutline
} from 'ionicons/icons';

import { PreferenciasService } from '../../services/preferencias';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonToggle,
    IonIcon,
    CommonModule,
    FormsModule
  ],
})
export class SettingsPage implements OnInit {

  notificaciones = true;
  modoOscuro = false;
  mensaje = '';

  constructor(
    private router: Router,
    private preferencias: PreferenciasService,
    private notificacionesService: NotificacionesService
  ) {

    addIcons({
      arrowBackOutline,
      notificationsOutline,
      moonOutline,
      trashOutline,
      checkmarkOutline
    });

  }

  async ngOnInit(): Promise<void> {

    try {

      this.notificaciones =
        await this.preferencias.obtener<boolean>(
          'notificaciones'
        ) ?? true;

      this.modoOscuro =
        await this.preferencias.obtener<boolean>(
          'modo_oscuro'
        ) ?? false;

      document.documentElement.classList.toggle(
        'dark-mode',
        this.modoOscuro
      );

      document.documentElement.classList.toggle(
        'ion-palette-dark',
        this.modoOscuro
      );

    } catch (error: any) {

      this.mensaje =
        error?.message ||
        'No se pudieron cargar las preferencias.';

    }

  }


  volver(): void {

    this.router.navigate(['/home']);

  }


  async cambiarNotificaciones(): Promise<void> {

    try {

      await this.preferencias.guardar(
        'notificaciones',
        this.notificaciones
      );

      if (this.notificaciones) {

        const token =
          await this.notificacionesService.registrarDispositivo();

        this.mensaje = token
          ? 'Notificaciones activadas.'
          : 'No se pudo registrar el dispositivo.';

      } else {

        await this.notificacionesService.detenerEscuchas();

        this.mensaje =
          'Notificaciones desactivadas en este dispositivo.';

      }

    } catch (error: any) {

      this.mensaje =
        error?.message ||
        'No se pudo guardar la preferencia.';

    }

  }


  // Cambia el modo oscuro y guarda la preferencia.
  async cambiarModoOscuro(): Promise<void> {

    try {

      document.documentElement.classList.toggle(
        'dark-mode',
        this.modoOscuro
      );

      document.documentElement.classList.toggle(
        'ion-palette-dark',
        this.modoOscuro
      );

      await this.preferencias.guardar(
        'modo_oscuro',
        this.modoOscuro
      );

      this.mensaje = this.modoOscuro
        ? 'Modo oscuro activado.'
        : 'Modo claro activado.';

    } catch (error: any) {

      // Si falla el guardado, devolvemos el toggle
      // al estado anterior.

      this.modoOscuro = !this.modoOscuro;

      document.documentElement.classList.toggle(
        'dark-mode',
        this.modoOscuro
      );

      document.documentElement.classList.toggle(
        'ion-palette-dark',
        this.modoOscuro
      );

      this.mensaje =
        error?.message ||
        'No se pudo guardar la preferencia.';

    }

  }


  async limpiarPreferencias(): Promise<void> {

    try {

      await this.preferencias.limpiar();

      this.notificaciones = true;
      this.modoOscuro = false;

      document.documentElement.classList.remove(
        'dark-mode',
        'ion-palette-dark'
      );

      this.mensaje =
        'Preferencias restauradas.';

    } catch (error: any) {

      this.mensaje =
        error?.message ||
        'No se pudieron restaurar las preferencias.';

    }

  }

}