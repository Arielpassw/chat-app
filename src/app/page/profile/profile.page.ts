import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, createOutline, logOutOutline, personOutline, mailOutline } from 'ionicons/icons';
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
export class ProfilePage implements OnInit {
  usuario: Usuario | null = null;
  cargando = true;
  error = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private auth: Auth
  ) {
    addIcons({ arrowBackOutline, createOutline, logOutOutline, personOutline, mailOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPerfil();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {
    try {
      this.cargando = true;
      this.usuario = await this.usuarioService.obtenerMiPerfil();
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      this.error = error?.message || 'No se pudo cargar el perfil.';
    } finally {
      this.cargando = false;
    }
  }

  obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    return partes.length === 1
      ? partes[0].substring(0, 2).toUpperCase()
      : `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  volver(): void { this.router.navigate(['/home']); }
  editar(): void { this.router.navigate(['/edit-profile']); }

  async cerrarSesion(): Promise<void> {
    try {
      await this.auth.cerrarSesion();
      await this.router.navigate(['/login']);
    } catch (error: any) {
      this.error = error?.message || 'No se pudo cerrar la sesión.';
    }
  }
}
