import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonInput, IonButton, IonIcon, IonText, IonSpinner,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, chatbubblesOutline,
} from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { NotificacionesService } from '../../services/notificaciones';
import { PreferenciasService } from '../../services/preferencias';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonInput, IonButton, IonIcon, IonText, IonSpinner, CommonModule, FormsModule],
})
export class LoginPage {
  email = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  errorMensaje = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private notificaciones: NotificacionesService,
    private preferencias: PreferenciasService
  ) {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, chatbubblesOutline });
  }

  async iniciarSesion(): Promise<void> {
    this.errorMensaje = '';
    if (!this.email.trim() || !this.password) {
      this.errorMensaje = 'Completa todos los campos.';
      return;
    }

    this.cargando = true;
    try {
      await this.auth.iniciarSesion(this.email.trim(), this.password);
      // Respetar la preferencia local antes de pedir permisos del sistema.
      const notificacionesActivas = await this.preferencias.obtener<boolean>('notificaciones');
      if (notificacionesActivas !== false) {
        await this.notificaciones.registrarDispositivo();
      }
      await this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      this.errorMensaje = error?.message || 'No se pudo iniciar sesión.';
    } finally {
      this.cargando = false;
    }
  }

  irARegistro(): void { this.router.navigate(['/register']); }
  alternarPassword(): void { this.mostrarPassword = !this.mostrarPassword; }
}
