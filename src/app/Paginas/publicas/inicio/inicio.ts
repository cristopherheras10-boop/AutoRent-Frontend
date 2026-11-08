import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Reservas } from '../../privadas/reservas/reservas';
import { Pagos } from '../../privadas/pagos/pagos';
import { Vehiculos } from '../../privadas/vehiculos/vehiculos';
import { Categorias } from '../../privadas/categorias/categorias';
import { Mantenimientos } from '../../privadas/mantenimientos/mantenimientos';
import { Usuarios } from '../../privadas/usuarios/usuarios';
import { Dashboard } from '../../privadas/dashboard/dashboard';
import { CampanaCliente } from '../../../Shared/campana-cliente';
import { Vehiculo, Categoria } from '../../../../Modelos/modelos';
import { VehiculoServicio } from '../../../Servicios/vehiculo-servicio';
import { CategoriaServicio } from '../../../Servicios/categoria-servicio';
import { AuthServicio } from '../../../Servicios/auth-servicio';
import { ReservaPendiente } from '../../../Servicios/reserva-pendiente';
import { mensajeError } from '../../../Servicios/error-util';

@Component({
  standalone: true,
  imports: [RouterLink, Reservas, Pagos, CampanaCliente, Vehiculos, Categorias, Mantenimientos, Usuarios, Dashboard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  @ViewChild(Vehiculos) gestorVehiculos?:Vehiculos;
  readonly adminSecciones=['dashboard','reservas','pagos','categorias','mantenimientos','usuarios'] as const;
  seccionAdmin=signal('');
  abrirCrearVehiculo(){this.gestorVehiculos?.nuevo();}
  abrirEditarVehiculo(v:Vehiculo){this.cerrar();this.gestorVehiculos?.editar(v);}
  eliminarVehiculo(v:Vehiculo){if(!this.auth.esAdmin()||!confirm(`¿Eliminar ${v.marca} ${v.modelo}?`))return;this.vehiculoServicio.eliminar(v.id).subscribe({next:()=>this.cargar(),error:e=>this.error.set(mensajeError(e))});}

  vehiculos = signal<Vehiculo[]>([]);
  categorias = signal<Categoria[]>([]);
  buscando = signal('');
  categoriaActiva = signal(0);
  cargando = signal(true);
  error = signal('');
  detalle = signal<Vehiculo | null>(null);
  fotoActual = signal(0);
  menuAbierto = signal(false);
  seccion = signal<string>('catalogo');
  favoritos = signal<number[]>([]);
  visibles = computed(() => {
    const texto = this.buscando().trim().toLowerCase();
    return this.vehiculos().filter(v =>
      (this.categoriaActiva() === 0 || v.categoriaId === this.categoriaActiva()) &&
      `${v.marca} ${v.modelo} ${v.anio} ${v.categoriaNombre}`.toLowerCase().includes(texto)
    );
  });

  constructor(
    private vehiculoServicio: VehiculoServicio,
    private categoriaServicio: CategoriaServicio,
    public auth: AuthServicio,
    private pendiente: ReservaPendiente,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params=>{
      const seccion=params.get('seccion');
      const categoria=Number(params.get('categoria')||0);if(categoria>0)this.categoriaActiva.set(categoria);
      const permitido=this.auth.esAdmin()?['catalogo',...this.adminSecciones]:this.auth.esUser()?['catalogo','reservas','pagos']:['catalogo'];
      this.seccion.set(seccion&&permitido.includes(seccion as any)?seccion:'catalogo');
      this.menuAbierto.set(false);
    });
    this.cargar();
  }
  ir(seccion:string):void {
    if(seccion!=='catalogo'&&!this.auth.autenticado()){this.router.navigateByUrl('/login');return;}
    if(this.auth.esUser()&&!['catalogo','reservas','pagos'].includes(seccion))return;
    if(this.auth.esAdmin()&&!['catalogo',...this.adminSecciones].includes(seccion as any))return;
    this.menuAbierto.set(false);
    this.router.navigate(['/'],{queryParams:seccion==='catalogo'?{}:{seccion}});
    if(seccion==='catalogo')queueMicrotask(()=>document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'}));
    else window.scrollTo({top:0,behavior:'smooth'});
  }
  cerrarSesion():void {this.auth.salir();this.seccion.set('catalogo');this.router.navigateByUrl('/');}


  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    (this.auth.esAdmin()?this.vehiculoServicio.listar():this.vehiculoServicio.disponibles()).subscribe({
      next: datos => { this.vehiculos.set(datos); this.cargando.set(false); },
      error: e => { this.error.set(mensajeError(e)); this.cargando.set(false); }
    });
    this.categoriaServicio.listar().subscribe({
      next: datos => this.categorias.set(datos.filter(c => c.activa)),
      error: () => { /* El catálogo sigue visible aunque las categorías no carguen. */ }
    });
  }

  errorFoto(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    // Nunca ocultar el elemento: Angular lo reutiliza al navegar por la galería.
    // Una imagen oculta hacía que todas las fotos siguientes parecieran rotas.
    if (img.src.startsWith('data:image/svg+xml')) return;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22480%22 viewBox=%220 0 800 480%22%3E%3Crect width=%22800%22 height=%22480%22 fill=%22%23e8edf5%22/%3E%3Cpath d=%22M350 185h100v85H350z M330 280h140%22 stroke=%22%236b7b91%22 stroke-width=%2212%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3Ctext x=%22400%22 y=%22330%22 font-family=%22Arial%22 font-size=%2228%22 fill=%22%23263750%22 text-anchor=%22middle%22%3EFotograf%C3%ADa no disponible%3C/text%3E%3C/svg%3E';
    img.classList.add('photo-fallback');
  }

  filtrar(evento: Event): void {
    this.buscando.set((evento.target as HTMLInputElement).value);
  }

  fotos(v: Vehiculo): string[] {
    const urls = [v.imagenUrl, ...(v.imagenes || [])].filter((x): x is string => !!x);
    return [...new Set(urls)];
  }

  abrir(v: Vehiculo): void { this.detalle.set(v); this.fotoActual.set(0); document.body.style.overflow = 'hidden'; }
  cerrar(): void { this.detalle.set(null); document.body.style.overflow = ''; }
  siguiente(direccion: number): void {
    const total = this.detalle() ? this.fotos(this.detalle()!).length : 0;
    if (total) this.fotoActual.set((this.fotoActual() + direccion + total) % total);
  }

  favorito(id: number): void {
    const anteriores = this.favoritos();
    this.favoritos.set(anteriores.includes(id) ? anteriores.filter(x => x !== id) : [...anteriores, id]);
  }

  entrarCuenta(): void {
    if(this.auth.esAdmin())this.ir('dashboard');
    else if(this.auth.esUser())this.ir('reservas');
    else this.router.navigateByUrl('/login');
  }

  reservar(v: Vehiculo): void {
    this.pendiente.guardar(v.id);
    this.cerrar();
    this.router.navigate(this.auth.autenticado()&&!this.auth.esAdmin()?['/']:['/registro'],this.auth.autenticado()&&!this.auth.esAdmin()?{queryParams:{seccion:'reservas'}}:{});
  }
}
