
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { StorageService } from '../../services/storage';

import {
  arrowBackOutline,
  createOutline,
  logOutOutline,
  personOutline,
  mailOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../services/usuario';
import { Auth } from '../../services/auth';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class ProfilePage {

  usuario: Usuario | null = null;
  cargando = true;
  error = '';
  fotoUrl = '';

  private cargandoPerfil = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private auth: Auth,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      arrowBackOutline,
      createOutline,
      logOutOutline,
      personOutline,
      mailOutline
    });
  }

  // Se ejecuta cada vez que se entra a la pantalla.
  async ionViewWillEnter(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {

    // Evitar consultas simultáneas.
    if (this.cargandoPerfil) return;

    this.cargandoPerfil = true;
    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();

    try {
      console.log('INICIO: cargando perfil...');

      const usuario = await this.usuarioService.obtenerMiPerfil();

      console.log('PERFIL RECIBIDO:', usuario);

      if (!usuario) {
        throw new Error(
          'No se encontró el perfil del usuario autenticado.'
        );
      }

      // Asignar el perfil y la URL de la foto.

      this.usuario = usuario;

      this.fotoUrl = usuario.foto_url
        ? this.storageService.obtenerUrlAvatar(usuario.foto_url)
        : '';

      console.log('PERFIL ASIGNADO:', this.usuario);

    } catch (error: any) {

      console.error('Error cargando perfil:', error);

      this.usuario = null;

      // Si hay un error, limpiar la URL de la foto.
      this.fotoUrl = '';

      this.error =
        error?.message || 'No se pudo cargar el perfil.';

    } finally {

      this.cargando = false;
      this.cargandoPerfil = false;

      this.cdr.detectChanges();

      console.log('CARGA DEL PERFIL FINALIZADA');
      console.log('ESTADO CARGANDO:', this.cargando);
      console.log('PERFIL DISPONIBLE:', !!this.usuario);
    }
  }

  obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return 'U';

    return partes.length === 1
      ? partes[0].substring(0, 2).toUpperCase()
      : `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  editar(): void {
    this.router.navigate(['/edit-profile']);
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.auth.cerrarSesion();
      await this.router.navigate(['/login']);
    } catch (error: any) {
      this.error =
        error?.message || 'No se pudo cerrar la sesión.';

      this.cdr.detectChanges();
    }
  }
}
