
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonIcon
} from '@ionic/angular';

import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  searchOutline,
  closeCircleOutline,
  peopleOutline,
  chatbubbleOutline,
  addOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../services/usuario';
import { SalaService } from '../../services/sala';
import { Auth } from '../../services/auth';

interface ContactoUI {
  id: string;
  nombre: string;
  usuario: string;
  avatar: string;
  estado: string;
}

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
export class ContactsPage implements OnInit {

  busqueda = '';

  contactos: ContactoUI[] = [];

  cargando = false;

  creandoChat = false;

  error = '';

  private usuarioActualId: string | null = null;

  private ultimaBusqueda = 0;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private salaService: SalaService,
    private auth: Auth
  ) {

    addIcons({
      arrowBackOutline,
      personOutline,
      searchOutline,
      closeCircleOutline,
      peopleOutline,
      chatbubbleOutline,
      addOutline
    });

  }

  async ngOnInit(): Promise<void> {

    try {

      const usuario = await this.auth.obtenerUsuario();

      if (!usuario) {
        await this.router.navigate(['/login']);
        return;
      }

      this.usuarioActualId = usuario.id;

    } catch (error) {

      console.error('Error obteniendo usuario:', error);

      this.error = 'No se pudo verificar la sesión.';

    }

  }

  async buscarContactos(): Promise<void> {

    const texto = this.busqueda.trim();

    const solicitud = ++this.ultimaBusqueda;

    this.error = '';

    if (texto.length < 2) {

      this.contactos = [];
      this.cargando = false;

      return;

    }

    this.cargando = true;

    try {

      const resultados =
        await this.usuarioService.buscarUsuarios(texto);

      // Evitar mostrar resultados de búsquedas anteriores.
      if (solicitud !== this.ultimaBusqueda) return;

      this.contactos = (resultados || [])
        .map((perfil: any) => {

          const nombre =
            perfil.nombre ||
            perfil.full_name ||
            perfil.name ||
            'Usuario';

          const id =
            perfil.id ||
            perfil.user_id ||
            perfil.uid;

          return {
            id,
            nombre,
            usuario:
              perfil.username
                ? '@' + perfil.username.replace(/^@/, '')
                : perfil.usuario || '',
            avatar: this.obtenerIniciales(nombre),
            estado: perfil.estado || 'Disponible'
          };

        })
        .filter(contacto =>
          !!contacto.id &&
          contacto.id !== this.usuarioActualId
        );

    } catch (error: any) {

      console.error('Error buscando contactos:', error);

      if (solicitud === this.ultimaBusqueda) {

        this.contactos = [];

        this.error =
          error?.message ||
          'No se pudieron cargar los contactos.';

      }

    } finally {

      if (solicitud === this.ultimaBusqueda) {
        this.cargando = false;
      }

    }

  }

  get contactosFiltrados(): ContactoUI[] {
    return this.contactos;
  }

  async iniciarChat(contacto: ContactoUI): Promise<void> {

    if (
      this.creandoChat ||
      !this.usuarioActualId
    ) return;

    this.creandoChat = true;
    this.error = '';

    try {

      // Crear conversación individual.
      const sala = await this.salaService.crearSala({

        nombre: contacto.nombre,

        tipo: 'individual',

        imagen_url: null,

        creado_por: this.usuarioActualId

      });

      // El creador ya se registra como administrador
      // dentro de crearSala().
      await this.salaService.agregarParticipantes([{

        chat_id: sala.id,

        user_id: contacto.id,

        rol: 'miembro'

      }]);

      // Actualizar la lista de conversaciones.
      await this.router.navigate(['/chats']);

    } catch (error: any) {

      console.error('Error creando conversación:', error);

      this.error =
        error?.message ||
        'No se pudo iniciar la conversación.';

    } finally {

      this.creandoChat = false;

    }

  }

  irACrearSala(): void {

    this.router.navigate(['/create-room']);

  }

  volverChats(): void {

    this.router.navigate(['/chats']);

  }

  irAPerfil(): void {

    this.router.navigate(['/profile']);

  }

  obtenerIniciales(nombre: string): string {

    const partes = nombre.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return 'U';

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return (
      partes[0][0] + partes[1][0]
    ).toUpperCase();

  }

}
