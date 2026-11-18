
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferenciasService {

  // Guardar un valor
  async guardar<T>(clave: string, valor: T): Promise<void> {
    await Preferences.set({
      key: clave,
      value: JSON.stringify(valor)
    });
  }

  // Obtener un valor
  async obtener<T>(clave: string): Promise<T | null> {
    const { value } = await Preferences.get({ key: clave });

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  // Eliminar un valor
  async eliminar(clave: string): Promise<void> {
    await Preferences.remove({ key: clave });
  }

  // Eliminar todas las preferencias
  async limpiar(): Promise<void> {
    await Preferences.clear();
  }

  // Consultar si existe una preferencia
  async existe(clave: string): Promise<boolean> {
    const { value } = await Preferences.get({ key: clave });
    return value !== null;
  }
}
