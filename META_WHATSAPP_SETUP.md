# Configuración Meta WhatsApp Business API - Master Account

## Paso 1: Crear App en Facebook Developers

### 1.1 Crear la Aplicación
1. Ve a https://developers.facebook.com
2. Haz clic en "Mis Apps" → "Crear App"
3. Selecciona tipo: **"Business"**
4. Completa:
   - Nombre de la app: "BotMaster WhatsApp API"
   - Email de contacto: tu email
   - Propósito comercial: "Provide customer support and marketing services"

### 1.2 Agregar Producto WhatsApp
1. En el panel de la app, busca "WhatsApp Business API"
2. Haz clic en "Configurar"
3. Te llevará a la configuración de WhatsApp

## Paso 2: Configurar WhatsApp Business API

### 2.1 Verificar Número de Teléfono (Tu número maestro)
1. En WhatsApp → "API Setup"
2. Sección "From phone number": 
   - Selecciona o agrega tu número comercial
   - Completa verificación por SMS
   - **Copia el Phone Number ID** (ejemplo: 123456789012345)

### 2.2 Generar Access Token
1. En "API Setup", busca "Access tokens"
2. Haz clic en "Generate token"
3. **Copia el token temporal** (válido 24h para pruebas)

**Para producción:**
1. Ve a "Business Settings" → "System Users"
2. Crea un System User: "BotMaster API User"
3. Asigna permisos: "whatsapp_business_management", "whatsapp_business_messaging"
4. Genera token permanente

### 2.3 Configurar Webhook
1. En WhatsApp → "Configuration"
2. Webhook URL: `https://tu-proyecto.replit.app/webhook/whatsapp`
3. Verify token: crea uno personalizado (ej: "mi_verify_token_secreto_123")
4. Suscríbete a: **"messages"**

## Paso 3: Variables de Entorno en Replit

Agrega estas variables en Secrets de Replit:

```bash
# WhatsApp Master API (TUS credenciales únicas)
WHATSAPP_MASTER_TOKEN=EAAxxxxxxxxxxxxx  # Tu access token
WHATSAPP_APP_ID=123456789012345         # App ID de Facebook
WHATSAPP_APP_SECRET=abcdef123456        # App Secret
WHATSAPP_VERIFY_TOKEN=mi_verify_token_secreto_123  # Tu verify token personalizado

# Opcional para futuras mejoras
OPENAI_API_KEY=tu_openai_key_opcional
```

## Paso 4: Configurar Business Manager

### 4.1 Crear Business Manager
1. Ve a https://business.facebook.com
2. Crea cuenta comercial o usa existente
3. Agrega tu app a Business Manager

### 4.2 Permisos y Roles
1. En Business Manager → "Configuración del negocio"
2. "Apps" → Agrega tu app BotMaster
3. Asigna permisos: WhatsApp Business API

## Paso 5: Proceso para Agregar Números de Clientes

### Método 1: Via API (Automático)
```javascript
// Tu sistema hará esto automáticamente
const response = await fetch(`https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}/phone_numbers`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${WHATSAPP_MASTER_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cc: "57",  // código de país
    phone_number: "3001234567",  // número sin código
    migrated_number: "+573001234567"  // número completo
  })
});
```

### Método 2: Manual (Backup)
1. En WhatsApp Business API → "Phone Numbers"
2. "Add phone number"
3. Ingresa número del cliente
4. Completa verificación
5. Copia el Phone Number ID generado

## Paso 6: Testing y Validación

### 6.1 Verificar Webhook
```bash
# Meta enviará GET request para verificar
GET /webhook/whatsapp?hub.verify_token=mi_verify_token_secreto_123&hub.challenge=CHALLENGE&hub.mode=subscribe

# Tu app debe responder con el challenge
```

### 6.2 Enviar Mensaje de Prueba
```bash
curl -X POST \
  https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages \
  -H 'Authorization: Bearer WHATSAPP_MASTER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+573001234567",
    "text": { "body": "Hola! Este es un mensaje de prueba desde BotMaster." }
  }'
```

## Límites y Costos

### Mensajes Gratuitos por Número
- **1,000 conversaciones gratis por mes** por cada número
- Conversaciones iniciadas por clientes = GRATIS (dentro de 24h)
- Ventana de 24h para responder gratis

### Conversaciones de Pago
- Después de 1,000 gratis: ~$0.05 USD por conversación
- Template messages para marketing: costo adicional

## Solución de Problemas

### Error: "Invalid access token"
- Regenera el token en Facebook Developers
- Verifica que el token tenga permisos correctos

### Error: "Phone number not found"
- Asegúrate que el número esté verificado en WhatsApp Business
- Confirma el Phone Number ID correcto

### Webhook no recibe mensajes
- Verifica la URL del webhook
- Confirma que el verify token coincida
- Revisa suscripciones a "messages"

### Rate Limits
- Máximo 1,000 mensajes por segundo
- Para más volumen, solicita upgrade a Meta

## Próximos Pasos

1. **Configura las variables de entorno**
2. **Verifica el webhook** (debe aparecer como configurado)
3. **Registra tu primer cliente** en `/master/dashboard`
4. **Agrega su número WhatsApp** al sistema
5. **Prueba enviando mensajes** desde cualquier WhatsApp al número

El sistema manejará automáticamente:
- Enrutamiento de mensajes por cliente
- Respuestas de IA personalizadas
- Conteo de mensajes gratuitos
- Gestión de ventanas de conversación

---

¿Necesitas ayuda con algún paso específico? El Dashboard Master en `/master/dashboard` te mostrará el estado de la configuración en tiempo real.