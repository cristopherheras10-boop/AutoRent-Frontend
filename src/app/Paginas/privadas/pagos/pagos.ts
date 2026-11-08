import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Pago, Reserva } from '../../../../Modelos/modelos';
import { PagoServicio } from '../../../Servicios/pago-servicio';
import { ReservaServicio } from '../../../Servicios/reserva-servicio';
import { AuthServicio } from '../../../Servicios/auth-servicio';
import { mensajeError } from '../../../Servicios/error-util';

@Component({selector:'app-pagos', standalone: true, imports: [ReactiveFormsModule], templateUrl: './pagos.html' })
export class Pagos implements OnInit {
  lista = signal<Pago[]>([]);
  reservas = signal<Reserva[]>([]);
  error = signal('');
  edit: number | null = null;
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    reservaId: [0, [Validators.required, Validators.min(1)]],
    fechaPago: [''],
    metodoPago: ['EFECTIVO', Validators.required],
    estado: ['PAGADO', Validators.required]
  });

  // La cantidad se consulta de la reserva, nunca se escribe manualmente.
  montoCalculado(): number | null {
    const id = Number(this.form.controls.reservaId.value);
    return this.reservas().find(r => r.id === id)?.total ?? null;
  }

  constructor(
    private fb: FormBuilder,
    private s: PagoServicio,
    private rs: ReservaServicio,
    public auth: AuthServicio,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargar();
    if (this.auth.esAdmin()) this.rs.listar().subscribe({
      next: x => {this.reservas.set(x);const id=Number(this.route.snapshot.queryParamMap.get('reserva')||0);if(id&&x.some(r=>r.id===id))this.form.patchValue({reservaId:id});},
      error: e => this.error.set(mensajeError(e))
    });
  }

  cargar(): void {
    const consulta = this.auth.esAdmin() ? this.s.listar() : this.s.mios();
    consulta.subscribe({ next: x => this.lista.set(x), error: e => this.error.set(mensajeError(e)) });
  }

  guardar(): void {
    this.error.set('');
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const reserva = this.reservas().find(r => r.id === Number(raw.reservaId));
    if (!reserva || reserva.total == null || reserva.total <= 0) {
      this.error.set('Selecciona una reserva con un total válido.');
      return;
    }
    // El servidor vuelve a calcular el monto desde la reserva, sin confiar en este valor.
    const payload = {
      reservaId: Number(raw.reservaId),
      fechaPago: raw.fechaPago || null,
      monto: null,
      metodoPago: raw.metodoPago,
      estado: raw.estado
    };
    this.guardando.set(true);
    const consulta = this.edit !== null
      ? this.s.actualizar(this.edit, payload)
      : this.s.crear(payload);
    consulta.subscribe({
      next: () => { this.guardando.set(false); this.cancelar(); this.cargar(); },
      error: e => { this.guardando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  editar(x: Pago): void {
    this.edit = x.id;
    this.error.set('');
    this.form.patchValue({
      reservaId: x.reservaId,
      fechaPago: x.fechaPago,
      metodoPago: x.metodoPago,
      estado: x.estado
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(x: Pago): void {
    if (confirm('¿Eliminar el registro de pago?')) {
      this.s.eliminar(x.id).subscribe({
        next: () => { this.error.set(''); this.cargar(); },
        error: e => this.error.set(mensajeError(e))
      });
    }
  }

  cancelar(): void {
    this.edit = null;
    this.form.reset({ reservaId: 0, fechaPago: '', metodoPago: 'EFECTIVO', estado: 'PAGADO' });
  }
}
