export type Rol='USER'|'ADMIN';
export type EstadoUsuario='PENDIENTE'|'APROBADO'|'RECHAZADO'|'BLOQUEADO';
export type EstadoVehiculo='DISPONIBLE'|'MANTENIMIENTO'|'INACTIVO';
export type EstadoReserva='PENDIENTE'|'CONFIRMADA'|'CANCELADA'|'EN_CURSO'|'FINALIZADA';
export type MetodoPago='EFECTIVO'|'TARJETA'|'TRANSFERENCIA';
export type EstadoPago='PENDIENTE'|'PAGADO'|'REEMBOLSADO';
export type EstadoMantenimiento='PROGRAMADO'|'EN_PROCESO'|'FINALIZADO';

export interface AuthResponse{token:string;rol:Rol;id:number;nombre:string;correo:string}
export interface Usuario{id:number;nombre:string;cedula?:string|null;telefono?:string|null;correo:string;rol:Rol;estado:EstadoUsuario;verificado:boolean;fechaRegistro:string}
export interface Categoria{id:number;nombre:string;descripcion:string;activa:boolean}
export interface Vehiculo{id:number;placa:string;marca:string;modelo:string;anio:number;color:string;tarifaDiaria:number;estado:EstadoVehiculo;categoriaId:number;categoriaNombre:string;imagenUrl?:string|null;imagenes?:string[]|null}
export interface Reserva{id:number;usuarioId:number;usuarioNombre:string;usuarioCorreo:string;vehiculoId:number;vehiculo:string;placa:string;fechaInicio:string;fechaFin:string;dias:number;total:number;estado:EstadoReserva;fechaReserva:string}
export interface Pago{id:number;reservaId:number;usuario:string;vehiculo:string;fechaPago:string;monto:number;metodoPago:MetodoPago;estado:EstadoPago}
export interface Mantenimiento{id:number;vehiculoId:number;vehiculo:string;placa:string;fechaInicio:string;fechaFin?:string|null;descripcion:string;costo:number;estado:EstadoMantenimiento}
