# AutoRent Angular — versión UX/UI mejorada

Frontend de AutoRent desarrollado con Angular standalone y conectado a la API REST de Spring Boot mediante `HttpClient`. Esta versión trabaja sobre el proyecto Angular existente; no es React ni Gestión Docentes.

## Requisitos

- Node.js compatible con Angular CLI 21 (recomendado Node.js 20.19+ o 22.12+).
- Backend Spring Boot de AutoRent ejecutándose en `http://localhost:8080`.

## Ejecutar

1. Abre esta carpeta (`AutoRentAngular`) en Visual Studio Code.
2. Ejecuta `npm install`.
3. Ejecuta `npm start`.
4. Abre `http://localhost:4200`.

Para comprobar la compilación de producción: `npm run build`.

## Conexión con la API

La URL se configura en `src/app/Servicios/api.config.ts`: `http://localhost:8080/api`. Si tu backend usa otro puerto, actualiza únicamente esa constante. Los servicios existentes, los guards, el interceptor JWT, los roles ADMIN/USER y las rutas se conservan.

## Cambios UX/UI

- Identidad visual consistente con navegación lateral oscura, acento azul y acento lima.
- Menú móvil desplegable, botón accesible, enlace para saltar al contenido y foco visible.
- Dashboard con bienvenida, indicadores, accesos directos, carga y mensajes de error con opción de reintentar.
- Formularios de acceso con etiquetas, autocompletado, mensajes accesibles y mejores espacios.
- Tablas con encabezados semánticos, captions para lectores de pantalla y desplazamiento horizontal.
- Tarjetas de vehículos con jerarquía de precio, estados y transiciones discretas.
- Diseño adaptable a escritorio, tablet y móvil; respeta `prefers-reduced-motion`.

## Pruebas recomendadas

- Ejecutar `npm run build`.
- Iniciar Spring Boot y verificar el inicio de sesión, listado de vehículos, creación de reservas y permisos por rol.
- Probar el menú y las tablas en una pantalla móvil.
- Recorrer con Tab y Shift+Tab y comprobar que el foco sea visible.
- Revisar la pestaña Network del navegador y los logs del backend cuando una petición falle.

Consulta `docs/RESUMEN_CAMBIOS_UX.md` y `docs/GUIA_EVIDENCIAS_UX.md` para preparar la entrega académica.
