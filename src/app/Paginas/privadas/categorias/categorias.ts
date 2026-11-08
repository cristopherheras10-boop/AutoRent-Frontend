import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Categoria, Vehiculo } from '../../../../Modelos/modelos';
import { CategoriaServicio } from '../../../Servicios/categoria-servicio';
import { VehiculoServicio } from '../../../Servicios/vehiculo-servicio';
import { mensajeError } from '../../../Servicios/error-util';

@Component({selector:'app-categorias',standalone:true,imports:[ReactiveFormsModule,RouterLink],templateUrl:'./categorias.html'})
export class Categorias implements OnInit {
  lista=signal<Categoria[]>([]);
  vehiculos=signal<Vehiculo[]>([]);
  seleccionada=signal<Categoria|null>(null);
  formularioAbierto=signal(false);
  error=signal('');
  msg=signal('');
  edit:number|null=null;
  form=this.fb.nonNullable.group({
    nombre:['',[Validators.required,Validators.minLength(3)]],
    descripcion:['',[Validators.required,Validators.minLength(5)]],
    activa:[true]
  });
  constructor(private fb:FormBuilder,private s:CategoriaServicio,private vs:VehiculoServicio){}
  ngOnInit(){this.cargar();this.vs.listar().subscribe({next:x=>this.vehiculos.set(x),error:e=>this.error.set(mensajeError(e))});}
  cargar(){this.s.listar().subscribe({next:x=>this.lista.set(x),error:e=>this.error.set(mensajeError(e))});}
  carrosDe(c:Categoria){return this.vehiculos().filter(v=>v.categoriaId===c.id);}
  seleccionar(c:Categoria){this.seleccionada.set(this.seleccionada()?.id===c.id?null:c);}
  nuevo(){this.cancelar();this.formularioAbierto.set(true);}
  guardar(){
    this.error.set('');
    if(this.form.invalid){this.form.markAllAsTouched();return;}
    const o=this.edit?this.s.actualizar(this.edit,this.form.getRawValue()):this.s.crear(this.form.getRawValue());
    o.subscribe({next:()=>{this.msg.set(this.edit?'Categoría actualizada':'Categoría creada');this.cancelar();this.cargar()},error:e=>this.error.set(mensajeError(e))});
  }
  editar(x:Categoria){this.edit=x.id;this.form.patchValue(x);this.formularioAbierto.set(true);}
  eliminar(x:Categoria){if(confirm(`¿Eliminar ${x.nombre}?`))this.s.eliminar(x.id).subscribe({next:()=>{this.cargar();this.seleccionada.set(null)},error:e=>this.error.set(mensajeError(e))});}
  cancelar(){this.edit=null;this.formularioAbierto.set(false);this.form.reset({nombre:'',descripcion:'',activa:true});}
}
