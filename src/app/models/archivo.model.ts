
/**
 * Información de un archivo subido a Supabase Storage.
 * Corresponde al resultado de StorageService.subirArchivoChat().
 */
export interface ArchivoChat {
  path: string;
  nombre: string;
  tamano: number;
  tipo: string;
}

/**
 * Información de un avatar subido a Supabase Storage.
 */
export interface ArchivoAvatar {
  path: string;
  url: string;
}

/**
 * Información de un archivo adjunto con su URL temporal
 * para visualizarlo o descargarlo.
 */
export interface ArchivoAdjunto extends ArchivoChat {
  url: string;
}
