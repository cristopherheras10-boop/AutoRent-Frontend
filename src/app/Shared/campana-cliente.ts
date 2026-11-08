import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServicio } from '../Servicios/auth-servicio';
import { Notificacion, NotificacionServicio } from '../Servicios/notificacion-servicio';

@Component({standalone:true,selector:'app-campana-cliente',template:`
<div class="notification-wrap client-notification-wrap">
  <button type="button" class="notification-bell" (click)="alternar()" [attr.aria-expanded]="abierta()" aria-controls="notificaciones-unificadas" [attr.aria-label]="'Notificaciones, '+sinLeer()+' sin leer'" title="Notificaciones">
    <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
    @if(sinLeer()>0){<span class="notification-count">{{sinLeer()>99?'99+':sinLeer()}}</span>}
  </button>
  @if(abierta()){
    <div id="notificaciones-unificadas" class="notification-dropdown" role="region" aria-label="Notificaciones de tu cuenta">
      <div class="notification-heading"><div><strong>Notificaciones</strong><small>{{sinLeer()}} sin leer</small></div><button type="button" class="notification-close" (click)="abierta.set(false)" aria-label="Cerrar notificaciones">✕</button></div>
      @if(error()){<p class="notification-error" role="status">{{error()}}</p><button type="button" class="notification-all" (click)="consultar()">Reintentar</button>}
      <div class="notification-items">
        @for(n of lista();track n.id){<button type="button" class="notification-item" [class.notification-unread]="!n.leida" (click)="abrir(n)" [attr.aria-label]="n.titulo+'. '+n.mensaje+'. Abrir '+etiquetaDestino(n)"><span class="notification-item-dot" aria-hidden="true"></span><span><strong>{{n.titulo}}</strong><small>{{n.mensaje}}</small><time>{{n.fecha ? n.fecha.replace('T',' ').slice(0,16) : ''}}</time><em class="notification-link">{{etiquetaDestino(n)}} →</em></span></button>}
        @empty{<div class="notification-empty">Estás al día. No tienes notificaciones nuevas.</div>}
      </div>
      @if(sinLeer()>0){<button type="button" class="notification-all" (click)="marcarTodas()">Marcar todas como leídas</button>}
    </div>
  }
</div>
@if(aviso();as n){<div class="notification-toast" role="status" aria-live="polite"><span class="toast-icon" aria-hidden="true">🔔</span><div><strong>{{n.titulo}}</strong><p>{{n.mensaje}}</p><button type="button" class="notification-toast-link" (click)="abrir(n)">Ver {{etiquetaDestino(n).toLowerCase()}} →</button></div><button type="button" (click)="aviso.set(null)" aria-label="Cerrar aviso">✕</button></div>}
`})
export class CampanaCliente implements OnInit,OnDestroy {
  lista=signal<Notificacion[]>([]);
  sinLeer=computed(()=>this.lista().filter(n=>!n.leida).length);
  abierta=signal(false); aviso=signal<Notificacion|null>(null); error=signal('');
  private intervalo?:ReturnType<typeof setInterval>;
  private timeout?:ReturnType<typeof setTimeout>;
  private conocidos=new Set<number>();
  private primera=true;
  constructor(private noti:NotificacionServicio,private router:Router,private auth:AuthServicio){}
  ngOnInit(){this.consultar();this.intervalo=setInterval(()=>this.consultar(),15000);}
  ngOnDestroy(){if(this.intervalo)clearInterval(this.intervalo);if(this.timeout)clearTimeout(this.timeout);}
  alternar(){this.abierta.update(v=>!v);if(this.abierta())this.consultar();}
  consultar(){if(!this.auth.autenticado())return;this.noti.listar().subscribe({next:lista=>{
    const nuevos=lista.filter(n=>!n.leida&&!this.conocidos.has(n.id));
    this.lista.set(lista);this.error.set('');this.conocidos=new Set(lista.map(n=>n.id));
    // No lanzar avisos emergentes por notificaciones antiguas al abrir la aplicación.
    if(!this.primera&&nuevos.length){this.aviso.set(nuevos[0]);if(this.timeout)clearTimeout(this.timeout);this.timeout=setTimeout(()=>this.aviso.set(null),6500);}
    this.primera=false;
  },error:()=>this.error.set('No fue posible actualizar las notificaciones.')});}
  destino(n:Notificacion):string{
    const t=`${n.tipo||''} ${n.titulo||''}`.toLowerCase();
    if(n.reservaId||/reserva|solicitud|alquiler/.test(t))return 'reservas';
    if(/pago|cobro|factur/.test(t))return 'pagos';
    if(/mantenim|revisi[oó]n|taller/.test(t))return 'mantenimientos';
    if(/categor/.test(t))return 'categorias';
    if(/usuario|cuenta|registro|aprobaci[oó]n/.test(t))return 'usuarios';
    if(/veh[ií]culo|carro|auto|flota/.test(t))return 'catalogo';
    return this.auth.esAdmin()?'dashboard':'catalogo';
  }
  etiquetaDestino(n:Notificacion){const etiquetas:Record<string,string>={reservas:'Reservas',pagos:'Pagos',mantenimientos:'Mantenimientos',categorias:'Categorías',usuarios:'Usuarios',catalogo:'Catálogo',dashboard:'Resumen'};return etiquetas[this.destino(n)]||'Inicio';}
  abrir(n:Notificacion){this.abierta.set(false);this.aviso.set(null);if(!n.leida)this.noti.leer(n.id).subscribe({next:()=>this.consultar(),error:()=>this.consultar()});
    let destino=this.destino(n);
    if(!this.auth.esAdmin()&&!['catalogo','reservas','pagos'].includes(destino))destino='catalogo';
    this.router.navigate(['/'],{queryParams:destino==='catalogo'?{}:{seccion:destino}});
  }
  marcarTodas(){this.noti.leerTodas().subscribe({next:()=>this.consultar(),error:()=>this.error.set('No se pudieron marcar las notificaciones.')});}
}
