import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonToggle, IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, notificationsOutline, moonOutline, trashOutline, checkmarkOutline } from 'ionicons/icons';
import { PreferenciasService } from '../../services/preferencias';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonToggle, IonIcon, CommonModule, FormsModule],
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
    addIcons({ arrowBackOutline, notificationsOutline, moonOutline, trashOutline, checkmarkOutline });
  }

  async ngOnInit(): Promise<void> {
    this.notificaciones = await this.preferencias.obtener<boolean>('notificaciones') ?? true;
    this.modoOscuro = await this.preferencias.obtener<boolean>('modo_oscuro') ?? false;
  }

  volver(): void { this.router.navigate(['/home']); }

  async cambiarNotificaciones(): Promise<void> {
    await this.preferencias.guardar('notificaciones', this.notificaciones);
    if (this.notificaciones) {
      const token = await this.notificacionesService.registrarDispositivo();
      this.mensaje = token ? 'Notificaciones activadas.' : 'No se pudo registrar el dispositivo.';
    } else {
      await this.notificacionesService.detenerEscuchas();
      this.mensaje = 'Notificaciones desactivadas en este dispositivo.';
    }
  }

  async cambiarModoOscuro(): Promise<void> {
    await this.preferencias.guardar('modo_oscuro', this.modoOscuro);
    document.body.classList.toggle('dark', this.modoOscuro);
    this.mensaje = 'Preferencia guardada.';
  }

  async limpiarPreferencias(): Promise<void> {
    await this.preferencias.limpiar();
    this.notificaciones = true;
    this.modoOscuro = false;
    document.body.classList.remove('dark');
    this.mensaje = 'Preferencias restauradas.';
  }
}
