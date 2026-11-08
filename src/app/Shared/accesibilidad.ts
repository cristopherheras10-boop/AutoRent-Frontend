import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';

type Tema = 'claro' | 'oscuro' | 'contraste';
type Idioma = 'es' | 'en';

// Traducciones de la interfaz principal. Los datos de la BD conservan su idioma original.
const TRADUCCIONES: Record<string, string> = {
  'Inicio':'Home', 'Explorar autos':'Browse cars', 'Categorías':'Categories',
  'Cómo funciona':'How it works', 'Mi cuenta':'My account', 'Crear cuenta':'Create account',
  'Explorar vehículos':'Browse vehicles', 'Descubre cómo funciona':'See how it works',
  'Vehículos disponibles':'Available vehicles', 'Reserva a tu ritmo':'Book at your pace',
  'Explora cuando quieras':'Explore anytime', 'Todos los autos':'All cars',
  'Explora nuestra flota':'Explore our fleet', 'Descubre esta categoría':'Explore this category',
  'Todas las opciones disponibles en un solo lugar.':'All available options in one place.',
  'ENCUENTRA TU ESTILO':'FIND YOUR STYLE', 'NUESTRA COLECCIÓN':'OUR COLLECTION',
  'Un auto para':'A car for', 'cada ocasión.':'every occasion.',
  'Encuentra tu':'Find your', 'próximo auto.':'next car.',
  'Descubre tu próximo viaje entre modelos seleccionados para cada ocasión.':'Discover your next trip with cars selected for every occasion.',
  'Todos':'All', 'Disponible':'Available', 'Explorar vehículo':'Explore car',
  'Limpiar filtros':'Clear filters', 'Reintentar':'Retry',
  'No pudimos cargar los vehículos':'We could not load the cars',
  'Dashboard':'Dashboard', 'Vehículos':'Vehicles', 'Reservas':'Reservations',
  'Mis reservas':'My reservations', 'Pagos':'Payments', 'Mis pagos':'My payments',
  'Mantenimientos':'Maintenance', 'Usuarios':'Users', 'Cerrar sesión':'Log out',
  'Tu espacio personal':'Your personal space',
  'Sesión activa':'Active session', 'MENÚ PRINCIPAL':'MAIN MENU',
  'ADMINISTRACIÓN':'ADMINISTRATION', 'GESTIÓN DE FLOTA':'FLEET MANAGEMENT',
  'BIENVENIDO A AUTORENT':'WELCOME TO AUTORENT',
  'Administrador':'Administrator', 'Cliente':'Customer',
  'Todo bajo control':'Everything under control',
  'Gestiona tu movilidad en un solo lugar.':'Manage your mobility in one place.',
  'Movilidad simple. Gestión inteligente.':'Simple mobility. Smart management.',
  'Agregar vehículo':'Add vehicle', 'Guardar':'Save', 'Cancelar':'Cancel',
  'Editar':'Edit', 'Eliminar':'Delete', 'Buscar':'Search',
  'Ver detalles':'View details', 'Reservar':'Book', 'Iniciar sesión':'Sign in',
  'Correo electrónico':'Email address', 'Contraseña':'Password',
  'Nombre':'Name', 'Estado':'Status', 'Fecha':'Date', 'Total':'Total',
  'Precio':'Price', 'Acciones':'Actions', 'Confirmar':'Confirm',
  'Volver':'Back', 'Siguiente':'Next', 'Anterior':'Previous',
  'ACCESOS DIRECTOS':'QUICK LINKS', '¿Qué necesitas hacer?':'What would you like to do?',
  'Administrar vehículos':'Manage vehicles', 'Gestionar reservas':'Manage reservations',
  'Controlar pagos':'Manage payments', 'Selecciona una reserva':'Select a reservation',
  'Total a cobrar':'Amount due', 'Nueva reserva':'New reservation',
  'Sin resultados':'No results', 'No hay registros':'No records',
  'Cargando...':'Loading...', 'Verificar correo':'Verify email',
  'Registrar pago':'Record payment', 'Registrar':'Register',
  'Accesibilidad':'Accessibility', 'Saltar al contenido principal':'Skip to main content',
  'Saltar al catálogo de vehículos':'Skip to car catalog'
};

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  template: `
    <aside class="accessibility-tools" [attr.aria-label]="idioma()==='es'?'Opciones de accesibilidad':'Accessibility options'">
      <button type="button" class="accessibility-trigger" (click)="abierto.set(!abierto())" [attr.aria-expanded]="abierto()" aria-controls="opciones-accesibilidad">♿ <span>{{idioma()==='es'?'Accesibilidad':'Accessibility'}}</span></button>
      @if(abierto()){
        <section class="accessibility-panel" id="opciones-accesibilidad" [attr.aria-label]="idioma()==='es'?'Configuración de accesibilidad':'Accessibility settings'">
          <div class="accessibility-head"><strong>{{idioma()==='es'?'Personalizar visualización':'Display settings'}}</strong><button type="button" (click)="abierto.set(false)" [attr.aria-label]="idioma()==='es'?'Cerrar opciones':'Close settings'">✕</button></div>
          <p>{{idioma()==='es'?'Elige el aspecto que te resulte más cómodo para leer.':'Choose the display settings that work best for you.'}}</p>
          <fieldset class="accessibility-themes"><legend>{{idioma()==='es'?'Modo de visualización':'Display mode'}}</legend>
            <label><input type="radio" name="tema-autorent" [checked]="tema()==='claro'" (change)="cambiarTema('claro')"> ☀ {{idioma()==='es'?'Claro':'Light'}}</label>
            <label><input type="radio" name="tema-autorent" [checked]="tema()==='oscuro'" (change)="cambiarTema('oscuro')"> ☾ {{idioma()==='es'?'Oscuro':'Dark'}}</label>
            <label><input type="radio" name="tema-autorent" [checked]="tema()==='contraste'" (change)="cambiarTema('contraste')"> ◐ {{idioma()==='es'?'Alto contraste':'High contrast'}}</label>
          </fieldset>
          <div class="accessibility-font"><span>{{idioma()==='es'?'Tamaño de letra':'Text size'}}</span><button type="button" (click)="cambiarTexto(-10)" aria-label="Reducir letra">A−</button><strong aria-live="polite">{{tamano()}}%</strong><button type="button" (click)="cambiarTexto(10)" aria-label="Aumentar letra">A+</button></div>
          <div class="a11y-enhancements" role="group" [attr.aria-label]="idioma()==='es'?'Herramientas visuales':'Visual accessibility tools'">
            <button type="button" [attr.aria-pressed]="resaltarEnlaces()" (click)="resaltarEnlaces.set(!resaltarEnlaces());aplicar()">🔗 {{idioma()==='es'?'Resaltar enlaces':'Highlight links'}}</button>
            <button type="button" [attr.aria-pressed]="filtro()==='grises'" (click)="alternarFiltro('grises')">◑ {{idioma()==='es'?'Escala de grises':'Grayscale'}}</button>
            <button type="button" [attr.aria-pressed]="filtro()==='invertir'" (click)="alternarFiltro('invertir')">◐ {{idioma()==='es'?'Invertir colores':'Invert colors'}}</button>
            <button type="button" [attr.aria-pressed]="filtro()==='sepia'" (click)="alternarFiltro('sepia')">☕ Sepia</button>
            <button type="button" [attr.aria-pressed]="filtro()==='monocromo'" (click)="alternarFiltro('monocromo')">◧ {{idioma()==='es'?'Monocromático':'Monochrome'}}</button>
            <button type="button" [attr.aria-pressed]="cursorGrande()" (click)="cursorGrande.set(!cursorGrande());aplicar()">➕ {{idioma()==='es'?'Cursor destacado':'Enhanced cursor'}}</button>
            <button type="button" [attr.aria-pressed]="movimiento()" (click)="movimiento.set(!movimiento());aplicar()">◎ {{idioma()==='es'?'Reducir animaciones':'Reduce motion'}}</button>
          </div>
          <div class="a11y-divider"></div>
          <label class="a11y-label" for="idioma-autorent">🌐 {{idioma()==='es'?'Idioma de la interfaz':'Interface language'}}</label>
          <select id="idioma-autorent" class="a11y-select" [value]="idioma()" (change)="cambiarIdioma($event)"><option value="es">Español</option><option value="en">English</option></select>
          <small>{{idioma()==='es'?'Se traducen los controles principales; los datos registrados por usuarios no se traducen.':'Main controls are translated; user-entered data is not translated.'}}</small>
          <div class="a11y-divider"></div>
          <strong class="a11y-label">🔊 {{idioma()==='es'?'Lectura en voz alta':'Read aloud'}}</strong>
          <div class="a11y-actions">
            <button type="button" (click)="leer()" [disabled]="!vozDisponible">▶ {{idioma()==='es'?'Leer página':'Read page'}}</button>
            <button type="button" (click)="detenerLectura()" [disabled]="!vozDisponible">■ {{idioma()==='es'?'Detener':'Stop'}}</button>
          </div>
          <small aria-live="polite">{{!vozDisponible?(idioma()==='es'?'Este navegador no admite lectura por voz.':'Speech is not supported in this browser.'):(leyendo()?(idioma()==='es'?'Lectura activa':'Reading aloud'):(idioma()==='es'?'Selecciona texto para leer solo esa parte; si no, se leerá la página.':'Select text to read only that part, or read the whole page.'))}}</small>
          <div class="a11y-divider"></div>
          <strong class="a11y-label">⌨ {{idioma()==='es'?'Atajos de teclado':'Keyboard shortcuts'}}</strong>
          <ul class="a11y-shortcuts">
            <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> — {{idioma()==='es'?'Abrir accesibilidad':'Accessibility panel'}}</li>
            <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> — {{idioma()==='es'?'Inicio':'Home'}}</li>
            <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> — {{idioma()==='es'?'Vehículos':'Vehicles'}}</li>
            <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> — {{idioma()==='es'?'Leer o detener':'Read / stop'}}</li>
            <li><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>+</kbd> / <kbd>-</kbd> — {{idioma()==='es'?'Tamaño de texto':'Text size'}}</li>
            <li><kbd>Esc</kbd> — {{idioma()==='es'?'Cerrar panel y detener voz':'Close panel and stop speech'}}</li>
          </ul>
          <button type="button" (click)="restablecer()">↺ {{idioma()==='es'?'Restablecer ajustes':'Reset settings'}}</button>
          <small>{{idioma()==='es'?'Las preferencias se guardan en este navegador.':'Preferences are saved in this browser.'}}</small>
        </section>
      }
    </aside>
  `
})
export class Accesibilidad implements AfterViewInit, OnDestroy {
  abierto=signal(false);
  tema=signal<Tema>('claro');
  idioma=signal<Idioma>('es');
  tamano=signal(100);
  movimiento=signal(false);
  resaltarEnlaces=signal(false);
  cursorGrande=signal(false);
  filtro=signal<'ninguno'|'grises'|'invertir'|'sepia'|'monocromo'>('ninguno');
  leyendo=signal(false);
  vozDisponible=typeof window!=='undefined' && 'speechSynthesis' in window;
  private observador?:MutationObserver;
  private originales=new WeakMap<Text,string>();
  private atributos=new WeakMap<Element,Map<string,string>>();
  private actualizando=false;
  private readonly teclado=(e:KeyboardEvent)=>this.atajo(e);
  private readonly ruta=()=>queueMicrotask(()=>this.traducir());
  constructor(private router:Router){
    try{
      const t=localStorage.getItem('autorent-tema');
      if(t==='claro'||t==='oscuro'||t==='contraste')this.tema.set(t);
      this.movimiento.set(localStorage.getItem('autorent-movimiento')==='true');
      this.resaltarEnlaces.set(localStorage.getItem('autorent-enlaces')==='true');
      this.cursorGrande.set(localStorage.getItem('autorent-cursor')==='true');
      const f=localStorage.getItem('autorent-filtro');
      if(f==='grises'||f==='invertir'||f==='sepia'||f==='monocromo')this.filtro.set(f);
      const n=Number(localStorage.getItem('autorent-texto')||100);
      this.tamano.set(Number.isFinite(n)?Math.min(200,Math.max(100,n)):100);
      this.idioma.set(localStorage.getItem('autorent-idioma')==='en'?'en':'es');
    }catch{}
    this.aplicar();
  }
  ngAfterViewInit(){
    document.addEventListener('keydown',this.teclado);
    this.observador=new MutationObserver(()=>{
      if(this.actualizando)return;
      this.traducir();
    });
    this.observador.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:false});
    this.router.events.subscribe(()=>this.ruta());
    queueMicrotask(()=>this.traducir());
  }
  ngOnDestroy(){document.removeEventListener('keydown',this.teclado);this.observador?.disconnect();this.detenerLectura();}
  cambiarTema(t:Tema){this.tema.set(t);this.aplicar();}
  cambiarTexto(delta:number){this.tamano.set(Math.min(200,Math.max(100,this.tamano()+delta)));this.aplicar();}
  cambiarIdioma(event:Event){
    this.idioma.set((event.target as HTMLSelectElement).value==='en'?'en':'es');
    this.detenerLectura();this.aplicar();this.traducir();
  }
  alternarFiltro(f:'grises'|'invertir'|'sepia'|'monocromo'){this.filtro.set(this.filtro()===f?'ninguno':f);this.aplicar();}
  restablecer(){this.resaltarEnlaces.set(false);this.cursorGrande.set(false);this.filtro.set('ninguno');this.tema.set('claro');this.tamano.set(100);this.movimiento.set(false);this.idioma.set('es');this.detenerLectura();this.aplicar();this.traducir();}
  aplicar(){
    if(typeof document==='undefined')return;
    const root=document.documentElement;
    root.classList.toggle('modo-contraste',this.tema()==='contraste');
    root.classList.toggle('modo-oscuro',this.tema()==='oscuro');
    root.classList.toggle('sin-animaciones',this.movimiento());
    root.classList.toggle('a11y-highlight-links',this.resaltarEnlaces());
    root.classList.toggle('a11y-big-cursor',this.cursorGrande());
    for(const nombre of ['grises','invertir','sepia','monocromo'])root.classList.toggle('a11y-'+nombre,this.filtro()===nombre);
    root.style.colorScheme=this.tema()==='claro'?'light':'dark';
    root.style.zoom='';document.body.style.zoom='';
    root.style.setProperty('--a11y-text-scale',String(this.tamano()/100));
    root.style.fontSize=`${16*this.tamano()/100}px`;
    root.lang=this.idioma();
    try{
      localStorage.setItem('autorent-tema',this.tema());
      localStorage.setItem('autorent-texto',String(this.tamano()));
      localStorage.setItem('autorent-movimiento',String(this.movimiento()));
      localStorage.setItem('autorent-enlaces',String(this.resaltarEnlaces()));
      localStorage.setItem('autorent-cursor',String(this.cursorGrande()));
      localStorage.setItem('autorent-filtro',this.filtro());
      localStorage.setItem('autorent-idioma',this.idioma());
    }catch{}
  }
  private traducir(){
    if(typeof document==='undefined'||this.actualizando)return;
    this.actualizando=true;
    this.observador?.disconnect();
    try{
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      let n:Node|null;
      while((n=walker.nextNode())){
        const node=n as Text;
        const el=node.parentElement;
        if(!el||el.closest('script,style,code,pre,kbd,.accessibility-tools'))continue;
        const current=node.textContent||'';
        let original=this.originales.get(node);
        if(original===undefined){original=current;this.originales.set(node,original);}
        else if(current!==original && current!==this.convertir(original)){
          // Angular actualizó contenido dinámico: conservar su nuevo texto de origen.
          original=current;this.originales.set(node,original);
        }
        const translated=this.idioma()==='en'?this.convertir(original):original;
        if(current!==translated)node.textContent=translated;
      }
      for(const el of Array.from(document.querySelectorAll<HTMLElement>('input[placeholder],textarea[placeholder],a[aria-label],button[aria-label]'))){
        if(el.closest('.accessibility-tools'))continue;
        let map=this.atributos.get(el);
        if(!map){map=new Map();this.atributos.set(el,map);}
        for(const attr of ['placeholder','aria-label']){
          if(!el.hasAttribute(attr))continue;
          const val=el.getAttribute(attr)||'';
          let orig=map.get(attr);
          if(orig===undefined||val!==orig&&val!==this.convertir(orig)){orig=val;map.set(attr,orig);}
          const result=this.idioma()==='en'?this.convertir(orig):orig;
          if(val!==result)el.setAttribute(attr,result);
        }
      }
    }finally{
      this.actualizando=false;
      this.observador?.observe(document.body,{subtree:true,childList:true,characterData:true});
    }
  }
  private convertir(s:string){
    const trimmed=s.trim();
    const value=TRADUCCIONES[trimmed];
    if(!value)return s;
    const start=s.indexOf(trimmed);
    return s.slice(0,start)+value+s.slice(start+trimmed.length);
  }
  private atajo(e:KeyboardEvent){
    if(e.key==='Escape'){
      if(this.abierto()){this.abierto.set(false);e.preventDefault();}
      if(this.leyendo())this.detenerLectura();
      return;
    }
    if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||e.repeat)return;
    const k=e.key.toLowerCase();
    if(!['a','h','v','l','+','=','-','_'].includes(k))return;
    // No interceptar escritura en formularios.
    const target=e.target as HTMLElement|null;
    if(target?.closest('input,textarea,select,[contenteditable="true"]'))return;
    e.preventDefault();
    if(k==='a')this.abierto.set(!this.abierto());
    else if(k==='h')void this.router.navigateByUrl('/');
    else if(k==='v'){
      const url='/';
      void this.router.navigateByUrl(url).then(()=>{if(url==='/')document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});});
    }
    else if(k==='l')this.leyendo()?this.detenerLectura():this.leer();
    else this.cambiarTexto(k==='-'||k==='_'?-10:10);
  }
  leer(){
    if(!this.vozDisponible)return;
    this.detenerLectura();
    const selected=window.getSelection()?.toString().trim();
    const main=document.querySelector('main');
    const content=(selected||(main?.textContent||'')).replace(/\s+/g,' ').trim();
    if(!content)return;
    const speech=new SpeechSynthesisUtterance(content.slice(0,12000));
    speech.lang=this.idioma()==='en'?'en-US':'es-ES';
    speech.rate=0.95;
    speech.onend=()=>this.leyendo.set(false);
    speech.onerror=()=>this.leyendo.set(false);
    this.leyendo.set(true);
    window.speechSynthesis.speak(speech);
  }
  detenerLectura(){
    if(this.vozDisponible)window.speechSynthesis.cancel();
    this.leyendo.set(false);
  }
}
