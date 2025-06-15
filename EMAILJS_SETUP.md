# 📧 Configuración de EmailJS para AvisOnline

## 🚀 Pasos para configurar el envío de emails

### 1. Crear cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en "Sign Up" y crea una cuenta gratuita
3. Verifica tu email

### 2. Configurar servicio de email
1. En el dashboard, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado)
   - **Outlook**
   - **Yahoo**
   - Otros
4. Sigue las instrucciones para conectar tu cuenta
5. **Copia el Service ID** que aparece

### 3. Crear plantilla de email
1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Usa esta plantilla de ejemplo:

```html
Asunto: Nuevo mensaje de contacto - {{subject}}

Hola,

Has recibido un nuevo mensaje de contacto desde AvisOnline:

Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}
Asunto: {{subject}}

Mensaje:
{{message}}

---
Este mensaje fue enviado desde el formulario de contacto de AvisOnline.
```

4. **Copia el Template ID** que aparece

### 4. Obtener Public Key
1. Ve a **"Account"** → **"General"**
2. En la sección **"Public Key"**, copia la clave

### 5. Configurar en tu proyecto
Edita los archivos de environment:

**src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  // ... otras configuraciones
  emailjs: {
    publicKey: 'TU_PUBLIC_KEY_AQUI',
    serviceId: 'TU_SERVICE_ID_AQUI', 
    templateId: 'TU_TEMPLATE_ID_AQUI'
  }
};
```

**src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  emailjs: {
    publicKey: 'TU_PUBLIC_KEY_AQUI',
    serviceId: 'TU_SERVICE_ID_AQUI',
    templateId: 'TU_TEMPLATE_ID_AQUI'
  }
};
```

### 6. Variables de la plantilla
Asegúrate de que tu plantilla de EmailJS use estas variables:
- `{{from_name}}` - Nombre del remitente
- `{{from_email}}` - Email del remitente
- `{{phone}}` - Teléfono del remitente
- `{{subject}}` - Asunto del mensaje
- `{{message}}` - Contenido del mensaje
- `{{to_email}}` - Email de destino (avisonlinestoreperu@gmail.com)

### 7. Probar el formulario
1. Guarda los cambios
2. Reinicia el servidor de desarrollo (`ng serve`)
3. Ve a la página de contacto
4. Llena el formulario y envía un mensaje de prueba
5. Revisa tu email para confirmar que llegó el mensaje

## 🔧 Solución de problemas

### Error: "Public key is required"
- Verifica que hayas copiado correctamente el Public Key
- Asegúrate de que no tenga espacios al inicio o final

### Error: "Service not found"
- Verifica el Service ID
- Asegúrate de que el servicio esté activo en EmailJS

### Error: "Template not found"
- Verifica el Template ID
- Asegúrate de que la plantilla esté publicada

### Los emails no llegan
- Revisa la carpeta de spam
- Verifica que el servicio de email esté correctamente configurado
- Revisa los logs en la consola del navegador

## 📊 Límites del plan gratuito
- **200 emails por mes**
- **2 servicios de email**
- **3 plantillas**

Si necesitas más, puedes actualizar a un plan de pago.

## 🎯 ¡Listo!
Una vez configurado, el formulario de contacto enviará automáticamente los mensajes a **avisonlinestoreperu@gmail.com**. 