# Tu Socio Logístico SL — PWA

Aplicación web progresiva para recepción, cotización y seguimiento de pedidos de Sandino Emprendimientos.

## Incluye
- Registro de pedidos con datos de cliente, retiro, entrega y observaciones.
- Cotización automática: **tarifa = precio de Bolt × 0,95**.
- Estados: Recibido, Preparando, En camino, Entregado y Cancelado.
- Búsqueda, filtros, panel de indicadores y exportación CSV.
- Acceso a WhatsApp con un mensaje preparado.
- PWA instalable, manifest, iconos y service worker para caché offline.

## Importante: tarifas y datos
La app **no consulta Bolt automáticamente**. El operador debe introducir el precio mostrado por Bolt para el mismo recorrido y confirmar que la comparación sea válida. El 5 % se descuenta de ese valor. Ejemplo: Bolt Gs. 20.000 → Tu Socio Gs. 19.000.

Los pedidos se guardan en `localStorage` del navegador/dispositivo. Esta versión es un MVP local: los pedidos no se sincronizan entre distintos teléfonos ni usuarios y pueden perderse si se borran los datos del navegador. Para operación multiusuario se debe incorporar un backend con autenticación, base de datos, copias de seguridad y reglas de acceso.

## Publicar en GitHub
1. Crear un repositorio nuevo en https://github.com (por ejemplo `tu-socio-logistico`).
2. Descomprimir este ZIP y subir **el contenido** de la carpeta (index.html, app.js, styles.css, manifest.webmanifest, service-worker.js y assets) a la raíz del repositorio.
3. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Elegir la rama `main` y carpeta `/ (root)`, guardar y esperar la URL publicada.
5. Verificar que abre por HTTPS y que el logo, el formulario y la instalación funcionan.

## Convertir a Android con PWABuilder
1. Abrir https://www.pwabuilder.com/
2. Pegar la URL HTTPS de GitHub Pages.
3. Revisar el análisis de PWA; manifest e iconos ya están incluidos.
4. Elegir **Package for Stores → Android** (el flujo puede variar según la versión de PWABuilder).
5. Completar los datos de paquete, nombre, versión y firma siguiendo el asistente.
6. Descargar el paquete Android generado y probarlo en un dispositivo antes de distribuirlo.

## Probar localmente
No abrir `index.html` directamente con `file://` para probar instalación/offline. Servir la carpeta mediante un servidor HTTP local. Por ejemplo, con Python:
`python -m http.server 8000`
Luego abrir `http://localhost:8000`.

## Estructura
- `index.html` — interfaz.
- `styles.css` — diseño adaptable a móvil y escritorio.
- `app.js` — registro, cálculo, estados, exportación y WhatsApp.
- `manifest.webmanifest` — configuración PWA.
- `service-worker.js` — caché offline.
- `assets/` — logo suministrado e iconos.
