import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class ProfilePage {

  editando = false;

  usuario = {
    nombre: 'Emi',
    username: '@emi',
    correo: 'usuario@correo.com',
    telefono: '0999999999',
    avatar: 'EM'
  };

  constructor(
    private router: Router
  ) {}

  volverChats() {
    this.router.navigate(['/chats']);
  }

  activarEdicion() {
    this.editando = true;
  }

  guardarCambios() {
    this.editando = false;

    console.log(
      'Datos del perfil:',
      this.usuario
    );
  }

  cerrarSesion() {

    console.log('Cerrar sesión');

    // Posteriormente conectaremos
    // Supabase Auth aquí.

    this.router.navigate(['/login']);
  }

}