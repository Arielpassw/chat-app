import { Injectable } from '@angular/core';
import {
  Geolocation,
  Position
} from '@capacitor/geolocation';

export interface Coordenadas {
  latitud: number;
  longitud: number;
  precision: number;
}

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  // Solicitar permisos de ubicación
  async solicitarPermisos(): Promise<boolean> {
    const permisos = await Geolocation.checkPermissions();

    if (permisos.location === 'granted') {
      return true;
    }

    const resultado = await Geolocation.requestPermissions();

    return resultado.location === 'granted';
  }

  // Obtener la ubicación actual
  async obtenerUbicacion(): Promise<Coordenadas> {
    const permitido = await this.solicitarPermisos();

    if (!permitido) {
      throw new Error('No se concedieron permisos de ubicación.');
    }

    const posicion: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precision: posicion.coords.accuracy
    };
  }

  // Obtener las coordenadas como enlace de Google Maps
  async obtenerEnlaceMaps(): Promise<string> {
    const ubicacion = await this.obtenerUbicacion();

    return `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;
  }

  // Obtener la última posición conocida
  async obtenerUltimaUbicacion(): Promise<Coordenadas> {
    const posicion = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precision: posicion.coords.accuracy
    };
  }
}
