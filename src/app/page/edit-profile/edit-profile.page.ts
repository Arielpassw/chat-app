
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonInput, IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  checkmarkOutline,
  imageOutline
} from 'ionicons/icons';

import { UsuarioService } from '../../services/usuario';
import { StorageService } from '../../services/storage';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
    IonInput, IonIcon, CommonModule, FormsModule
  ],
})
export class EditProfilePage implements OnInit {

  usuario: Usuario | null = null;
  nombre = '';
  username = '';
  estado = '';
  fotoUrl = '';
  fotoPath = '';

  cargando = true;
  guardando = false;
  error = '';

  private solicitudActiva = false;

  constructor(
    private usuarioService: UsuarioService,
    private storageService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      checkmarkOutline,
      imageOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.solicitudActiva) return;

    this.solicitudActiva = true;
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      console.log('INICIO: cargando datos para editar perfil...');

      const usuario = await this.usuarioService.obtenerMiPerfil();

      console.log('PERFIL PARA EDICIÓN:', usuario);

      if (!usuario) {
        throw new Error('No se encontró el perfil del usuario.');
      }

      this.usuario = usuario;
      this.nombre = usuario.nombre || '';
      this.username = usuario.username || '';
      this.estado = usuario.estado || '';

      // Obtener la URL de la foto si existe.
      this.fotoUrl = usuario.foto_url
        ? this.storageService.obtenerUrlAvatar(usuario.foto_url)
        : '';

      console.log('DATOS DEL FORMULARIO CARGADOS');

    } catch (error: any) {
      console.error('Error cargando perfil para edición:', error);
      this.error = error?.message || 'No se pudo cargar el perfil.';
    } finally {
      this.cargando = false;
      this.solicitudActiva = false;
      this.cdr.detectChanges();

      console.log('CARGA DE EDICIÓN FINALIZADA');
      console.log('ESTADO CARGANDO:', this.cargando);
    }
  }

  async seleccionarFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    try {
      this.error = '';
      this.cdr.detectChanges();

      const resultado = await this.storageService.subirAvatar(archivo);

      this.fotoUrl = resultado.url;
      this.fotoPath = resultado.path;

    } catch (error: any) {
      console.error('Error subiendo foto:', error);
      this.error = error?.message || 'No se pudo subir la foto.';
    } finally {
      input.value = '';
      this.cdr.detectChanges();
    }
  }

  async guardar(): Promise<void> {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.guardando = true;
      this.error = '';
      this.cdr.detectChanges();

      await this.usuarioService.actualizarMiPerfil({
        nombre: this.nombre.trim(),
        username: this.username.trim() || null,
        estado: this.estado.trim() || 'Disponible',
        foto_url: this.fotoPath || this.fotoUrl || null
      });

      await this.router.navigate(['/profile']);

    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      this.error = error?.message || 'No se pudo guardar el perfil.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  volver(): void {
    this.router.navigate(['/profile']);
  }
}
