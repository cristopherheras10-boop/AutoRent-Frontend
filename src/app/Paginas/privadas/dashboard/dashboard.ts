import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthServicio } from '../../../Servicios/auth-servicio';
import { VehiculoServicio } from '../../../Servicios/vehiculo-servicio';
import { ReservaServicio } from '../../../Servicios/reserva-servicio';
import { PagoServicio } from '../../../Servicios/pago-servicio';
import { CategoriaServicio } from '../../../Servicios/categoria-servicio';
import { MantenimientoServicio } from '../../../Servicios/mantenimiento-servicio';
import { mensajeError } from '../../../Servicios/error-util';

@Component({ selector:'app-dashboard', standalone: true, imports: [RouterLink], templateUrl: './dashboard.html' })
export class Dashboard implements OnInit {
  cards = signal<{ label: string; valor: number; icon: string }[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(
    public auth: AuthServicio,
    private v: VehiculoServicio,
    private r: ReservaServicio,
    private p: PagoServicio,
    private c: CategoriaServicio,
    private m: MantenimientoServicio
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.error.set('');
    this.cards.set([]);
    if (this.auth.esAdmin()) this.cargarAdmin();
    else this.cargarCliente();
  }

  private cargarAdmin() {
    forkJoin([
      this.v.listar(),
      this.c.listar(),
      this.r.listar(),
      this.p.listar(),
      this.m.listar()
    ]).subscribe({
      next: ([vehiculos, categorias, reservas, pagos, mantenimientos]) => {
        this.cards.set([
          { label: 'Vehículos', valor: vehiculos.length, icon: '▰' },
          { label: 'Categorías', valor: categorias.length, icon: '◇' },
          { label: 'Reservas', valor: reservas.length, icon: '▣' },
          { label: 'Pagos', valor: pagos.length, icon: '＄' },
          { label: 'Mantenimientos', valor: mantenimientos.length, icon: '⚙' }
        ]);
        this.loading.set(false);
      },
      error: e => this.fallo(e)
    });
  }

  private cargarCliente() {
    forkJoin([this.v.disponibles(), this.r.mias(), this.p.mios()]).subscribe({
      next: ([vehiculos, reservas, pagos]) => {
        this.cards.set([
          { label: 'Vehículos disponibles', valor: vehiculos.length, icon: '▰' },
          { label: 'Mis reservas', valor: reservas.length, icon: '▣' },
          { label: 'Mis pagos', valor: pagos.length, icon: '＄' }
        ]);
        this.loading.set(false);
      },
      error: e => this.fallo(e)
    });
  }

  private fallo(error: unknown) {
    this.error.set(mensajeError(error));
    this.loading.set(false);
  }
}
