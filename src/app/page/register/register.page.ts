import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    CommonModule,
    FormsModule,
  ],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  confirmarPassword = '';

  mostrarPassword = false;
  mostrarConfirmacion = false;

  cargando = false;
  errorMensaje = '';
  mensajeExito = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  async registrar(): Promise<void> {
    this.errorMensaje = '';
    this.mensajeExito = '';

    if (
      !this.nombre.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmarPassword
    ) {
      this.errorMensaje = 'Completa todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMensaje =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.errorMensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    try {
      const data = await this.auth.registrar(
        this.nombre.trim(),
        this.email.trim(),
        this.password
      );

      console.log('Usuario registrado:', data);

      this.mensajeExito =
        'Cuenta creada correctamente. Ahora puedes iniciar sesión.';

      this.nombre = '';
      this.email = '';
      this.password = '';
      this.confirmarPassword = '';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);

      this.errorMensaje =
        error?.message || 'No se pudo crear la cuenta.';
    } finally {
      this.cargando = false;
    }
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  alternarConfirmacion(): void {
    this.mostrarConfirmacion =
      !this.mostrarConfirmacion;
  }
}