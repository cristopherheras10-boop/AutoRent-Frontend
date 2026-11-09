
import { Component, OnInit, signal } from '@angular/core';
import { Usuario } from '../../../../Modelos/modelos';
import { UsuarioServicio } from '../../../Servicios/usuario-servicio';
import { mensajeError } from '../../../Servicios/error-util';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.html'
})
export class Usuarios implements OnInit {

  lista = signal<Usuario[]>([]);
  error = signal('');
  msg = signal('');

  constructor(private s: UsuarioServicio) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.s.listar().subscribe({
      next: x => this.lista.set(x),
      error: e => this.error.set(mensajeError(e))
    });
  }

  // APROBAR USUARIO PENDIENTE
  aprobar(x: Usuario) {

    if (x.rol === 'ADMIN' || x.estado !== 'PENDIENTE') {
      return;
    }

    if (!confirm(
      `¿Aprobar y activar la cuenta de ${x.nombre} sin verificar su correo?`
    )) {
      return;
    }

    this.error.set('');
    this.msg.set('');

    this.s.aprobar(x.id).subscribe({
      next: () => {
        this.msg.set(
          `La cuenta de ${x.nombre} fue aprobada correctamente.`
        );
        this.cargar();
      },
      error: e => this.error.set(mensajeError(e))
    });
  }

  // BLOQUEAR USUARIO
  bloquear(x: Usuario) {

    if (x.rol === 'ADMIN') {
      return;
    }

    if (!confirm(`¿Bloquear la cuenta de ${x.nombre}?`)) {
      return;
    }

    this.error.set('');
    this.msg.set('');

    this.s.bloquear(x.id).subscribe({
      next: () => {
        this.msg.set('Cuenta bloqueada correctamente.');
        this.cargar();
      },
      error: e => this.error.set(mensajeError(e))
    });
  }

  // REACTIVAR USUARIO
  activar(x: Usuario) {

    if (x.rol === 'ADMIN') {
      return;
    }

    if (!confirm(`¿Reactivar la cuenta de ${x.nombre}?`)) {
      return;
    }

    this.error.set('');
    this.msg.set('');

    this.s.activar(x.id).subscribe({
      next: () => {
        this.msg.set('Cuenta activada correctamente.');
        this.cargar();
      },
      error: e => this.error.set(mensajeError(e))
    });
  }
}
