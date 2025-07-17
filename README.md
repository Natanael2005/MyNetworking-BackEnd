# MyNetworking Backend

Este proyecto implementa la lógica de registro y pagos para la aplicación.

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
