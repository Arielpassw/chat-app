import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonInput, IonIcon
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, checkmarkOutline, imageOutline } from 'ionicons/icons';
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

  constructor(
    private usuarioService: UsuarioService,
    private storageService: StorageService,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, personOutline, checkmarkOutline, imageOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    try {
      this.usuario = await this.usuarioService.obtenerMiPerfil();
      if (!this.usuario) throw new Error('No se encontró el perfil.');
      this.nombre = this.usuario.nombre || '';
      this.username = this.usuario.username || '';
      this.estado = this.usuario.estado || '';
      this.fotoUrl = this.usuario.foto_url || '';
    } catch (error: any) {
      this.error = error?.message || 'No se pudo cargar el perfil.';
    } finally {
      this.cargando = false;
    }
  }

  async seleccionarFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    try {
      this.error = '';
      const resultado = await this.storageService.subirAvatar(archivo);
      this.fotoUrl = resultado.url;
      this.fotoPath = resultado.path;
    } catch (error: any) {
      this.error = error?.message || 'No se pudo subir la foto.';
    } finally {
      input.value = '';
    }
  }

  async guardar(): Promise<void> {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    try {
      this.guardando = true;
      this.error = '';

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
    }
  }

  volver(): void { this.router.navigate(['/profile']); }
}
