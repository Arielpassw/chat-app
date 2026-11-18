
export type TipoSala = 'individual' | 'grupal';

export type RolParticipante = 'administrador' | 'miembro';

export interface Sala {
  id: string;
  nombre: string | null;
  tipo: TipoSala;
  imagen_url: string | null;
  creado_por: string;
  creado_en: string | null;
  actualizado_en: string | null;
}

export interface CrearSala {
  nombre?: string | null;
  tipo: TipoSala;
  imagen_url?: string | null;
  creado_por: string;
}

export interface ParticipanteSala {
  id: string;
  chat_id: string;
  user_id: string;
  rol: RolParticipante | null;
  unido_en: string | null;
  ultimo_mensaje_leido: string | null;
}

export interface AgregarParticipante {
  chat_id: string;
  user_id: string;
  rol?: RolParticipante;
}
