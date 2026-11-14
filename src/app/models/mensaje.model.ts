
export type TipoMensaje = 'texto' | 'imagen' | 'archivo' | 'ubicacion';

export interface Mensaje {
  id: string;
  chat_id: string;
  sender_id: string;
  contenido: string | null;
  tipo: TipoMensaje;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tamano: number | null;
  latitud: number | null;
  longitud: number | null;
  editado_en: string | null;
  eliminado_en: string | null;
  creado_en: string | null;
}

export interface CrearMensaje {
  chat_id: string;
  sender_id: string;
  contenido?: string | null;
  tipo?: TipoMensaje;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tamano?: number | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface ActualizarMensaje {
  contenido?: string | null;
  editado_en?: string;
  eliminado_en?: string | null;
}