import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
export interface Notificacion {id:number;titulo:string;mensaje:string;tipo:string;reservaId:number|null;leida:boolean;fecha:string;}
@Injectable({providedIn:'root'}) export class NotificacionServicio{
 private url=`${API_URL}/notificaciones`;
 constructor(private http:HttpClient){}
 listar(){return this.http.get<Notificacion[]>(this.url);}
 leer(id:number){return this.http.put<Notificacion>(`${this.url}/${id}/leer`,{});}
 leerTodas(){return this.http.put<void>(`${this.url}/leer-todas`,{});}
}
