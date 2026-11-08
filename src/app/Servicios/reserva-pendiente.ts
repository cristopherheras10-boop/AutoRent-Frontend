import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReservaPendiente {
  private clave = 'autorent_vehiculo_elegido';

  guardar(id: number): void {
    sessionStorage.setItem(this.clave, String(id));
  }

  obtener(): number | null {
    const id = Number(sessionStorage.getItem(this.clave));
    return id > 0 ? id : null;
  }

  limpiar(): void {
    sessionStorage.removeItem(this.clave);
  }
}
