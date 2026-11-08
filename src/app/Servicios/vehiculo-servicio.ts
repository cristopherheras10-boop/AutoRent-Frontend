import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { Vehiculo } from '../../Modelos/modelos';

@Injectable({providedIn:'root'})
export class VehiculoServicio {
  private u=`${API_URL}/vehiculos`;
  constructor(private h:HttpClient){}

  listar(){ return this.h.get<Vehiculo[]>(this.u); }
  disponibles(){ return this.h.get<Vehiculo[]>(`${this.u}/disponibles`); }
  crear(x:any){ return this.h.post<Vehiculo>(this.u,x); }
  actualizar(id:number,x:any){ return this.h.put<Vehiculo>(`${this.u}/${id}`,x); }
  seleccionarPortada(id:number, indice:number){ return this.h.put<Vehiculo>(`${this.u}/${id}/imagenes/${indice}/portada`,{}); }
  eliminarImagenPrincipal(id:number){ return this.h.delete<Vehiculo>(`${this.u}/${id}/imagen`); }
  eliminarImagen(id:number, indice:number){ return this.h.delete<Vehiculo>(`${this.u}/${id}/imagenes/${indice}`); }
  eliminar(id:number){ return this.h.delete(`${this.u}/${id}`); }

  subirImagen(id:number, archivo:File){
    const fd=new FormData();
    fd.append('imagen',archivo);
    return this.h.post<Vehiculo>(`${this.u}/${id}/imagen`,fd);
  }
  agregarImagenes(id:number, archivos:File[]){
    const datos = new FormData();
    archivos.forEach(archivo => datos.append('imagenes', archivo));
    return this.h.post<Vehiculo>(`${this.u}/${id}/imagenes`, datos);
  }
}
