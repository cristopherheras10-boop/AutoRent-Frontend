import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthServicio } from '../../../Servicios/auth-servicio';
import { CampanaCliente } from '../../../Shared/campana-cliente';
@Component({standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,CampanaCliente],templateUrl:'./layout.html'})
export class Layout {
 menuAbierto=false;
 constructor(public auth:AuthServicio,private r:Router){}
 alternarMenu(){this.menuAbierto=!this.menuAbierto;}
 cerrarMenu(){this.menuAbierto=false;}
 salir(){this.cerrarMenu();this.auth.salir();this.r.navigate(['/login']);}
}
