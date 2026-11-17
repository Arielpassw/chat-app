
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
  searchOutline,
  peopleOutline,
  closeOutline,
  checkmarkCircleOutline,
  personAddOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../services/usuario';
import { SalaService } from '../../services/sala';
import { Auth } from '../../services/auth';

interface ContactoUI {
  id: string;
  nombre: string;
  usuario: string;
  avatar: string;
}

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.page.html',
  styleUrls: ['./create-room.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})
export class CreateRoomPage implements OnInit {

  nombreSala = '';

  busqueda = '';

  contactos: ContactoUI[] = [];

  participantesSeleccionados: ContactoUI[] = [];

  usuarioId: string | null = null;

  cargando = false;

  buscando = false;

  creando = false;

  error = '';

  private ultimaBusqueda = 0;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private salaService: SalaService,
    private auth: Auth
  ) {

    addIcons({
      arrowBackOutline,
      searchOutline,
      peopleOutline,
      closeOutline,
      checkmarkCircleOutline,
      personAddOutline
    });

  }

  async ngOnInit(): Promise<void> {

    try {

      const usuario = await this.auth.obtenerUsuario();

      if (!usuario) {

        await this.router.navigate(['/login']);

        return;

      }

      this.usuarioId = usuario.id;

    } catch (error) {

      console.error('Error verificando sesión:', error);

      this.error = 'No se pudo verificar la sesión.';

    }

  }

  async buscarContactos(): Promise<void> {

    const texto = this.busqueda.trim();

    const solicitud = ++this.ultimaBusqueda;

    this.error = '';

    if (texto.length < 2) {

      this.contactos = [];

      this.buscando = false;

      return;

    }

    this.buscando = true;

    try {

      const resultados =
        await this.usuarioService.buscarUsuarios(texto);

      if (solicitud !== this.ultimaBusqueda) return;

      this.contactos = (resultados || [])
        .map((perfil: any) => {

          const nombre =
            perfil.nombre ||
            perfil.full_name ||
            perfil.name ||
            'Usuario';

          return {

            id:
              perfil.id ||
              perfil.user_id ||
              perfil.uid,

            nombre,

            usuario:
              perfil.username ||
              perfil.usuario ||
              '',

            avatar:
              this.obtenerIniciales(nombre)

          };

        })
        .filter((contacto: ContactoUI) =>
          !!contacto.id &&
          contacto.id !== this.usuarioId
        );

    } catch (error: any) {

      console.error('Error buscando usuarios:', error);

      if (solicitud === this.ultimaBusqueda) {

        this.error =
          error?.message ||
          'No se pudieron buscar los usuarios.';

      }

    } finally {

      if (solicitud === this.ultimaBusqueda) {
        this.buscando = false;
      }

    }

  }

  estaSeleccionado(contacto: ContactoUI): boolean {

    return this.participantesSeleccionados.some(
      p => p.id === contacto.id
    );

  }

  seleccionarParticipante(contacto: ContactoUI): void {

    if (this.estaSeleccionado(contacto)) {

      this.participantesSeleccionados =
        this.participantesSeleccionados.filter(
          p => p.id !== contacto.id
        );

    } else {

      this.participantesSeleccionados.push(contacto);

    }

  }

  quitarParticipante(contacto: ContactoUI): void {

    this.participantesSeleccionados =
      this.participantesSeleccionados.filter(
        p => p.id !== contacto.id
      );

  }

  async crearSala(): Promise<void> {

    const nombre = this.nombreSala.trim();

    if (!this.usuarioId) {

      this.error = 'Debes iniciar sesión para crear una sala.';

      return;

    }

    if (!nombre) {

      this.error = 'Escribe un nombre para el grupo.';

      return;

    }

    if (this.participantesSeleccionados.length === 0) {

      this.error = 'Selecciona al menos un participante.';

      return;

    }

    if (this.creando) return;

    this.creando = true;

    this.error = '';

    try {

      // 1. Crear la sala.
      // El servicio registra automáticamente al creador
      // como administrador.

      const sala = await this.salaService.crearSala({

        nombre,

        tipo: 'grupal',

        imagen_url: null,

        creado_por: this.usuarioId

      });

      // 2. Registrar los demás participantes.

      const participantes =
        this.participantesSeleccionados.map(contacto => ({

          chat_id: sala.id,

          user_id: contacto.id,

          rol: 'miembro' as const

        }));

      await this.salaService.agregarParticipantes(
        participantes
      );

      // 3. Regresar a la lista de conversaciones.

      await this.router.navigate(['/chats']);

    } catch (error: any) {

      console.error('Error creando sala:', error);

      this.error =
        error?.message ||
        'No se pudo crear el grupo.';

    } finally {

      this.creando = false;

    }

  }

  volver(): void {

    this.router.navigate(['/chats']);

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
