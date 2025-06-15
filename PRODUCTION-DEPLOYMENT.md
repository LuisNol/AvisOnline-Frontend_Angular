# 🚀 Guía de Deployment en Producción - AvisOnline Frontend

## 📋 **ESTADO ACTUAL DEL CÓDIGO**

✅ **Configuración Correcta:**
- Environment de producción: `https://apis.avisonline.store/api`
- Angular.json configurado para fileReplacements
- Servicios HTTP usando environment.apiUrl
- Manejo de errores implementado
- Interceptor HTTP agregado

## 🛠️ **COMANDOS PARA DEPLOYMENT**

### **1. Instalar Dependencias**
```bash
cd AvisOnline-Frontend_Angular
npm install
```

### **2. Build para Producción**
```bash
# Build optimizado para producción
npm run build:prod

# O directamente con Angular CLI
ng build --configuration production
```

### **3. Verificar Build**
```bash
# Los archivos estarán en:
ls dist/AvisOnline-Frontend/
```

### **4. Probar Localmente (Opcional)**
```bash
# Servir en modo producción para testing
npm run serve:prod
```

## 🌐 **CONFIGURACIÓN DEL SERVIDOR WEB**

### **Para Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Headers de seguridad
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# CORS para desarrollo (remover en producción)
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### **Para Nginx**
```nginx
server {
    listen 80;
    server_name www.avisonline.store avisonline.store;
    root /var/www/avisonline-frontend/dist/AvisOnline-Frontend;
    index index.html;

    # Configuración para Angular Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # CORS headers (si es necesario)
    add_header Access-Control-Allow-Origin "https://apis.avisonline.store";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}
```

## 🔧 **VERIFICACIÓN POST-DEPLOYMENT**

### **1. Verificar URLs**
- ✅ Frontend: `https://www.avisonline.store`
- ✅ Backend: `https://apis.avisonline.store/api`
- ✅ Admin: `https://www.admin.avisonline.store`

### **2. Probar Endpoints**
```bash
# Probar endpoint principal
curl -X GET "https://apis.avisonline.store/api/ecommerce/home" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"

# Probar endpoint de filtros
curl -X GET "https://apis.avisonline.store/api/ecommerce/config-filter-advance" \
  -H "Accept: application/json"
```

### **3. Verificar en DevTools**
1. Abrir `https://www.avisonline.store`
2. Abrir DevTools (F12)
3. Ir a Network tab
4. Recargar página
5. Verificar que las peticiones van a `https://apis.avisonline.store`

## ⚠️ **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: Cannot read properties of undefined**
**Causa:** El frontend no puede conectar con el backend
**Solución:**
1. Verificar que el backend esté funcionando
2. Verificar CORS en Laravel
3. Verificar SSL/HTTPS

### **Error 404 en rutas**
**Causa:** Servidor web no configurado para SPA
**Solución:** Configurar rewrite rules (ver arriba)

### **Error de CORS**
**Causa:** Backend no permite el dominio del frontend
**Solución:** Actualizar `config/cors.php` en Laravel:
```php
'allowed_origins' => [
    'https://www.avisonline.store',
    'https://avisonline.store',
],
```

### **Assets no cargan**
**Causa:** Rutas incorrectas o servidor mal configurado
**Solución:** Verificar configuración del servidor web

## 📊 **CHECKLIST DE DEPLOYMENT**

- [ ] ✅ Environment de producción configurado
- [ ] ✅ Build exitoso sin errores
- [ ] ✅ Archivos subidos al servidor
- [ ] ⚠️ Servidor web configurado (Apache/Nginx)
- [ ] ⚠️ CORS configurado en backend Laravel
- [ ] ⚠️ SSL/HTTPS funcionando
- [ ] ⚠️ Headers de seguridad configurados
- [ ] ⚠️ Funcionalidades probadas

## 🎯 **PRÓXIMOS PASOS**

1. **Ejecutar build de producción**
2. **Subir archivos al servidor**
3. **Configurar servidor web**
4. **Verificar CORS en backend**
5. **Probar funcionalidades**

## 📞 **SOPORTE**

Si encuentras problemas:
1. Revisar logs del servidor web
2. Revisar DevTools del navegador
3. Verificar logs de Laravel
4. Contactar al equipo de desarrollo 