
export interface Usuario {
  id: string;
  nombre: string;
  username: string | null;
  email: string | null;
  foto_url: string | null;
  estado: string | null;
  creado_en: string | null;
  actualizado_en: string | null;
}

export interface CrearUsuario {
  id: string;
  nombre?: string;
  username?: string | null;
  email?: string | null;
  foto_url?: string | null;
  estado?: string | null;
}

export interface ActualizarUsuario {
  nombre?: string;
  username?: string | null;
  email?: string | null;
  foto_url?: string | null;
  estado?: string | null;
}

export interface Contacto {
  id: string;
  nombre: string;
  username: string | null;
  foto_url: string | null;
  estado: string | null;
}