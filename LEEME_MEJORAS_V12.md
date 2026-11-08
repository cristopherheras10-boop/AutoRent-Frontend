# AutoRent Angular V12 — mejora de experiencia móvil y administración

Este paquete se preparó a partir de la versión AutoRentAngular que proporcionaste el 8 de noviembre de 2026. Conserva `API_URL = '/api'`, `proxy.conf.json` y el host permitido de Tailscale Funnel en `angular.json`.

## Cambios principales

- Encabezado móvil: marca, campana y menú de tres barras en una sola fila, sin desbordamiento lateral; menú desplegable con acceso a iniciar sesión, registro y cerrar sesión.
- Navegación integrada: el administrador entra a la misma página de AutoRent y utiliza las secciones Resumen, Reservas, Pagos, Categorías, Mantenimientos y Usuarios desde el encabezado. El catálogo principal sirve también para administrar vehículos.
- Vehículos: botón de creación y acciones de edición/eliminación en las tarjetas del catálogo principal; formulario de gestión reutilizado sin mostrar un segundo catálogo.
- Alta rápida de categorías: desde el formulario de vehículo, sin perder lo escrito. La categoría recién creada queda seleccionada.
- Notificaciones: campana SVG consistente, indicador de no leídas, consulta periódica, marcar como leídas, acceso contextual a la sección correspondiente según `tipo` y `reservaId`, y enlace directo desde los avisos emergentes.
- Atajos: desde reservas de administración a registro de pagos con la reserva precargada; desde pagos a reservas y desde secciones de cliente al catálogo.
- Fotografías: `object-fit: contain` y ajustes de altura en tarjetas y galería móvil, para reducir recortes y deformaciones.
- Diseño: encabezados, tablas, formularios, modales y espacios móviles más coherentes.

## Cómo instalar

1. Haz una copia de seguridad de tu carpeta `AutoRentAngular` anterior.
2. Extrae este ZIP en una carpeta nueva. No mezcles archivos con otra versión.
3. Abre una terminal en la carpeta `AutoRentAngular` y ejecuta `npm install`.
4. Asegúrate de que la API Spring Boot esté funcionando en el puerto 8080.
5. Inicia Angular: `npm start -- --host 0.0.0.0 --proxy-config proxy.conf.json`.
6. Comprueba primero `http://localhost:4200` en laptop y luego el enlace público de Funnel desde un celular sin VPN.
7. Inicia sesión como administrador y comprueba creación de categoría desde el formulario de vehículo, edición, eliminación y notificaciones.

## Limitación importante: notificaciones de nuevos eventos

Este ZIP contiene **solo Angular**. Las notificaciones persistentes y entre usuarios dependen del backend Spring Boot (`GET /api/notificaciones`, `PUT /api/notificaciones/{id}/leer` y `PUT /api/notificaciones/leer-todas`). La interfaz ahora ofrece navegación contextual y mejor presentación para las notificaciones que la API entregue. Para garantizar que **cada evento** (reserva, pago, mantenimiento, cuenta, etc.) genere una notificación, hay que revisar y ampliar el backend y sus reglas de destinatarios. No se han inventado notificaciones que el servidor no genere.

## Verificación

Se ejecutó satisfactoriamente el compilador Angular (`ngc`) sobre el proyecto actualizado, incluyendo validación de plantillas. La compilación completa con Angular CLI no se pudo realizar en este entorno Linux porque el ZIP incluye `node_modules` compilados para Windows; por eso el ZIP entregado no contiene `node_modules`. Se recomienda `npm install` y `npm run build` en Windows antes de subirlo a GitHub/Vercel.

## Futuro despliegue Vercel

La ruta `/api` se mantiene para el proxy local/Tailscale. En Vercel habrá que configurar la URL pública de Railway o una reescritura equivalente; el `proxy.conf.json` de Angular **solo funciona con el servidor de desarrollo**.
