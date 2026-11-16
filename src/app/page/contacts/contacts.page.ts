import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class ContactsPage {

  busqueda = '';

  contactos = [
    {
      id: 1,
      nombre: 'María González',
      usuario: '@maria',
      avatar: 'MG',
      estado: 'En línea'
    },
    {
      id: 2,
      nombre: 'Juan Pérez',
      usuario: '@juan',
      avatar: 'JP',
      estado: 'Disponible'
    },
    {
      id: 3,
      nombre: 'Ana Rodríguez',
      usuario: '@ana',
      avatar: 'AR',
      estado: 'En línea'
    },
    {
      id: 4,
      nombre: 'Carlos Mendoza',
      usuario: '@carlos',
      avatar: 'CM',
      estado: 'Disponible'
    }
  ];

  constructor(
    private router: Router
  ) {}

  get contactosFiltrados() {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();

    if (!texto) {
      return this.contactos;
    }

    return this.contactos.filter(contacto =>
      contacto.nombre
        .toLowerCase()
        .includes(texto) ||
      contacto.usuario
        .toLowerCase()
        .includes(texto)
    );
  }

  volverChats() {
    this.router.navigate(['/chats']);
  }

  irAPerfil() {
    this.router.navigate(['/profile']);
  }

  iniciarChat(contacto: any) {
    console.log('Contacto seleccionado:', contacto);

    // Posteriormente aquí conectaremos:
    // SalaService.crearSala()
    // SalaService.agregarParticipantes()
  }

}