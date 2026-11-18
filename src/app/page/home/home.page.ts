import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class HomePage {

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  irAChats() {
    this.router.navigate(['/chats']);
  }

  irAContactos() {
    this.router.navigate(['/contacts']);
  }

  irAPerfil() {
    this.router.navigate(['/profile']);
  }

  irAConfiguracion() {
    this.router.navigate(['/settings']);
  }

  async cerrarSesion() {
    try {
      await this.auth.cerrarSesion();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}