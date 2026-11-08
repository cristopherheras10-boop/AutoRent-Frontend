import { Router } from '@angular/router';
import { ReservaPendiente } from '../../../Servicios/reserva-pendiente';
import { Component,OnInit,signal,computed,Input,Output,EventEmitter } from '@angular/core';
import { ReactiveFormsModule,FormBuilder,Validators } from '@angular/forms';
import { Vehiculo,Categoria } from '../../../../Modelos/modelos';
import { VehiculoServicio } from '../../../Servicios/vehiculo-servicio';
import { CategoriaServicio } from '../../../Servicios/categoria-servicio';
import { AuthServicio } from '../../../Servicios/auth-servicio';
import { ActivatedRoute } from '@angular/router';
import { mensajeError } from '../../../Servicios/error-util';

@Component({selector:'app-vehiculos',standalone:true,imports:[ReactiveFormsModule],templateUrl:'./vehiculos.html'})
export class Vehiculos implements OnInit{
  @Input() soloFormulario=false;
  @Output() cambio=new EventEmitter<void>();
  categoriaNuevaAbierta=signal(false);
  categoriaGuardando=signal(false);
  categoriaForm=this.fb.nonNullable.group({nombre:['',[Validators.required,Validators.minLength(3)]],descripcion:['',[Validators.required,Validators.minLength(5)]],activa:[true]});
  guardarCategoriaRapida(){
    if(this.categoriaForm.invalid){this.categoriaForm.markAllAsTouched();return;}
    this.categoriaGuardando.set(true);this.error.set('');
    this.cs.crear(this.categoriaForm.getRawValue()).subscribe({
      next:cat=>{this.cs.listar().subscribe({next:cats=>this.cats.set(cats.filter(c=>c.activa))});this.form.patchValue({categoriaId:cat.id});this.categoriaGuardando.set(false);this.categoriaNuevaAbierta.set(false);this.categoriaForm.reset({nombre:'',descripcion:'',activa:true});this.msg.set('Categoría creada y seleccionada. Puedes seguir completando el vehículo.');},
      error:e=>{this.categoriaGuardando.set(false);this.error.set(mensajeError(e));}
    });
  }

  lista=signal<Vehiculo[]>([]);
  cats=signal<Categoria[]>([]);
  error=signal('');
  msg=signal('');
  preview=signal<string|null>(null);
  edit:number|null=null;
  formularioAbierto=signal(false);
  categoriaFiltro=signal(0);
  listaFiltrada=computed(()=>this.categoriaFiltro()===0?this.lista():this.lista().filter(v=>v.categoriaId===this.categoriaFiltro()));
  editandoImagenes=signal<string[]>([]);
  guardando=signal(false);
  eliminandoFoto=signal(false);
  archivo:File|null=null;
  imagenesAdicionales:File[]=[];
  fotosNuevasVista=signal<{archivo:File,url:string}[]>([]);
  private actualizarFotosNuevas(archivos:File[]){
    this.fotosNuevasVista().forEach(x=>URL.revokeObjectURL(x.url));
    this.fotosNuevasVista.set(archivos.map(archivo=>({archivo,url:URL.createObjectURL(archivo)})));
  }
  elegirNuevaPortada(indice:number){
    const seleccion=this.fotosNuevasVista();
    if(indice<0||indice>=seleccion.length)return;
    const elegida=seleccion[indice].archivo;
    const todas=seleccion.map(x=>x.archivo);
    todas.splice(indice,1);
    this.archivo=elegida;
    this.imagenesAdicionales=todas;
    this.actualizarFotosNuevas([elegida,...todas]);
    this.preview.set(this.fotosNuevasVista()[0].url);
    this.msg.set('Portada seleccionada. Guarda el vehículo para aplicar los cambios.');
  }
  establecerPortada(indice:number){
    if(this.edit===null||this.eliminandoFoto())return;
    this.eliminandoFoto.set(true);this.error.set('');
    this.s.seleccionarPortada(this.edit,indice).subscribe({
      next:v=>{this.preview.set(v.imagenUrl||null);this.editandoImagenes.set([...(v.imagenes||[])]);
        this.eliminandoFoto.set(false);this.msg.set('Portada actualizada correctamente');this.cargar();},
      error:e=>{this.eliminandoFoto.set(false);this.error.set(mensajeError(e));}
    });
  }

  vistaDetalle=signal<Vehiculo|null>(null);
  fotoDetalle=signal(0);
  fotosDetalle(v:Vehiculo):string[]{return [v.imagenUrl,...(v.imagenes||[])].filter((x):x is string=>!!x);}
  abrirDetalle(v:Vehiculo){this.vistaDetalle.set(v);this.fotoDetalle.set(0);}
  cerrarDetalle(){this.vistaDetalle.set(null);}
  reservarVehiculo(v:Vehiculo){this.pendiente.guardar(v.id);this.cerrarDetalle();this.router.navigateByUrl('/app/reservas');}
  cambiarFoto(paso:number){const v=this.vistaDetalle();if(!v)return;const n=this.fotosDetalle(v).length;if(n)this.fotoDetalle.set((this.fotoDetalle()+paso+n)%n);}
  elegirFoto(indice:number){this.fotoDetalle.set(indice);}


  form=this.fb.nonNullable.group({
    placa:['',[Validators.required,Validators.pattern(/^[A-Za-z]{3}-?\d{3,4}$/)]],
    marca:['',[Validators.required,Validators.minLength(2)]],
    modelo:['',[Validators.required]],
    anio:[2024,[Validators.required,Validators.min(1990),Validators.max(2035)]],
    color:['',[Validators.required,Validators.minLength(3)]],
    tarifaDiaria:[0,[Validators.required,Validators.min(.01)]],
    estado:['DISPONIBLE',Validators.required],
    categoriaId:[0,[Validators.required,Validators.min(1)]]
  });

  constructor(private router:Router,private pendiente:ReservaPendiente,private fb:FormBuilder,private s:VehiculoServicio,
              private cs:CategoriaServicio,public auth:AuthServicio,private route:ActivatedRoute){}

  ngOnInit(){
    this.route.queryParamMap.subscribe(params=>this.categoriaFiltro.set(Number(params.get('categoria')||0)));
    this.cargar();
    this.cs.listar().subscribe(x=>this.cats.set(x.filter(c=>c.activa)));
  }

  cargar(){
    const peticion=this.auth.esAdmin()?this.s.listar():this.s.disponibles();
    peticion.subscribe({
      next:x=>this.lista.set(x),
      error:e=>this.error.set(mensajeError(e))
    });
  }

  seleccionarFotos(e:Event){
    this.error.set('');
    const input=e.target as HTMLInputElement;
    const archivos=Array.from(input.files||[]);
    if(!archivos.length)return;
    if(archivos.some(a=>!['image/jpeg','image/png','image/webp'].includes(a.type)||a.size>5*1024*1024)){
      this.error.set('Solo se admiten JPG, PNG o WEBP de máximo 5 MB por fotografía.');input.value='';return;
    }
    const hayPortadaActual=this.edit!==null && !!this.preview() && !this.archivo;
    const anteriores=this.fotosNuevasVista().map(x=>x.archivo);
    const todos=[...anteriores,...archivos];
    const adicionales=hayPortadaActual?todos:todos.slice(1);
    if(adicionales.length+this.editandoImagenes().length>8){
      this.error.set('Máximo 8 fotografías adicionales por vehículo.');input.value='';return;
    }
    if(hayPortadaActual){
      this.imagenesAdicionales=todos;
      this.actualizarFotosNuevas(todos);
    }else{
      this.archivo=todos[0];this.imagenesAdicionales=todos.slice(1);
      this.actualizarFotosNuevas(todos);
      this.preview.set(this.fotosNuevasVista()[0].url);
    }
    input.value='';
  }

  guardar(){
    this.error.set('');
    this.msg.set('');
    if(!this.auth.esAdmin()||this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    if(this.edit===null && !this.archivo){
      this.error.set('Selecciona al menos una fotografía. La primera será la portada.');
      return;
    }
    this.guardando.set(true);
    const peticion=this.edit
      ?this.s.actualizar(this.edit,this.form.getRawValue())
      :this.s.crear(this.form.getRawValue());

    peticion.subscribe({
      next:v=>{
        if(this.archivo){
          this.s.subirImagen(v.id,this.archivo).subscribe({
            next:()=>this.guardarGaleria(v.id),
            error:e=>{this.guardando.set(false);this.error.set(mensajeError(e));}
          });
        }else{
          this.guardarGaleria(v.id);
        }
      },
      error:e=>{this.guardando.set(false);this.error.set(mensajeError(e));}
    });
  }

  guardarGaleria(id:number){
    if(!this.imagenesAdicionales.length){this.finalizarGuardado();return;}
    this.s.agregarImagenes(id,this.imagenesAdicionales).subscribe({
      next:()=>this.finalizarGuardado(),
      error:e=>{this.guardando.set(false);this.error.set('El vehículo se guardó, pero las fotos adicionales fallaron: '+mensajeError(e));}
    });
  }

  finalizarGuardado(){
    this.msg.set(this.edit?'Vehículo actualizado correctamente':'Vehículo creado correctamente');
    this.guardando.set(false);
    this.cancelar();
    this.cargar();
    this.cambio.emit();
  }

  editar(x:Vehiculo){
    this.edit=x.id;
    this.formularioAbierto.set(true);
    this.editandoImagenes.set([...(x.imagenes||[])]);
    this.form.patchValue({...x,estado:x.estado,categoriaId:x.categoriaId});
    this.preview.set(x.imagenUrl||null);
    this.archivo=null;
    this.imagenesAdicionales=[];
    this.actualizarFotosNuevas([]);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  nuevo(){
    this.cancelar();
    this.formularioAbierto.set(true);
  }

  quitarPrincipal(){
    if(this.edit===null)return;
    if(!confirm('¿Eliminar la imagen principal de este vehículo?'))return;
    this.error.set('');
    this.eliminandoFoto.set(true);
    this.s.eliminarImagenPrincipal(this.edit).subscribe({
      next:()=>{this.preview.set(null);this.archivo=null;this.msg.set('Imagen principal eliminada');this.eliminandoFoto.set(false);this.cargar();},
      error:e=>{this.eliminandoFoto.set(false);this.error.set('No se pudo eliminar la imagen principal: '+mensajeError(e));}
    });
  }

  quitarFoto(indice:number){
    if(this.edit===null)return;
    if(!confirm('¿Eliminar esta fotografía de la galería?'))return;
    this.error.set('');
    this.eliminandoFoto.set(true);
    this.s.eliminarImagen(this.edit,indice).subscribe({
      next:v=>{
        this.editandoImagenes.set([...(v.imagenes||[])]);
        this.msg.set('Fotografía eliminada correctamente');
        this.eliminandoFoto.set(false);
        this.cargar();
      },
      error:e=>{this.eliminandoFoto.set(false);this.error.set('No se pudo eliminar la fotografía: '+mensajeError(e));}
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

  eliminar(x:Vehiculo){
    if(confirm(`¿Eliminar ${x.marca} ${x.modelo}?`)){
      this.s.eliminar(x.id).subscribe({
        next:()=>this.cargar(),
        error:e=>this.error.set(mensajeError(e))
      });
    }
  }

  cancelar(){
    this.edit=null;
    this.formularioAbierto.set(false);
    this.editandoImagenes.set([]);
    this.archivo=null;
    this.imagenesAdicionales=[];
    this.actualizarFotosNuevas([]);
    this.preview.set(null);
    this.categoriaNuevaAbierta.set(false);
    this.form.reset({placa:'',marca:'',modelo:'',anio:2024,color:'',tarifaDiaria:0,estado:'DISPONIBLE',categoriaId:0});
  }
}
