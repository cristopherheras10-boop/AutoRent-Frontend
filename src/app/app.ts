import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Accesibilidad } from './Shared/accesibilidad';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,Accesibilidad],template:'<router-outlet /><app-accesibilidad />'})
export class App {}
