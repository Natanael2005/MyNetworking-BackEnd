# MyNetworking Backend

Este proyecto implementa la lógica de registro y pagos para la aplicación.

## Configuración
Copia el archivo `.env.example` a `.env` y completa cada variable con tus valores.

## Requisitos previos

- [Node.js](https://nodejs.org/) y npm instalados en tu entorno.

Instala las dependencias ejecutando:

```bash
npm install
```

## Ejecución en desarrollo

Inicia el servidor con **nodemon** para recargar cambios automáticamente:

```bash
npm run dev
```

## Pruebas

Lanza la suite de pruebas con:

```bash
npm test
```

## Flujo de registro y pago

1. **PreUser**
   - Al verificar los datos de contacto en `/registro/contacto` se crea un documento `PreUser` con la información básica.
   - Este registro tiene un índice de expiración de 24 h (`models/PreUser.js`) para eliminar automáticamente los pre-registros que no completen el proceso.
2. **Inicio de pago**
   - Con el `preUserId` devuelto se llama a `/registro/pago` indicando el plan deseado (`monthly` o `yearly`).
   - El backend utiliza **Stripe Elements** para generar el `client_secret` de la intención de suscripción, el cual se envía al cliente para completar el pago en el navegador.
3. **Webhook de Stripe**
   - Una vez que el pago es exitoso, Stripe envía un evento al endpoint `/webhook/stripe`.
   - El webhook consulta el `preUserId` y crea/actualiza el `User`, eliminando el `PreUser` correspondiente y marcando el estado como `pago_realizado`.

Este flujo evita crear cuentas definitivas hasta que el pago se procese correctamente y limpia los intentos incompletos automáticamente.

## Estructura del proyecto

- **config/**: conexiones y credenciales para servicios externos (MongoDB, Stripe, Firebase).
- **controllers/**: lógica de los endpoints de registro y webhooks.
- **models/**: esquemas de Mongoose para `User` y `PreUser`.
- **routes/**: define las rutas de Express agrupadas por funcionalidad.
- **services/**: capa de servicios para autenticación, pagos y gestión de usuarios.
- **tests/**: pruebas automatizadas con Jest y Supertest.
- **app.js**: configuración principal de Express.
- **server.js**: arranque del servidor y conexión a la base de datos.
