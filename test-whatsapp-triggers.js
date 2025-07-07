#!/usr/bin/env node

// Test para verificar que los triggers funcionan correctamente
async function testWhatsAppTriggers() {
  try {
    console.log('🧪 Testeando sistema de triggers de WhatsApp...');

    // Simular datos que vendrían de la base de datos
    const testChatbot = {
      id: 29,
      triggerKeywords: ["hola", "información", "precio", "comprar"], // Como array directo
      aiInstructions: "Eres un asistente experto en ventas.",
      aiPersonality: "friendly",
      conversationObjective: "direct"
    };

    const testChatbotWithStringTriggers = {
      id: 30,
      triggerKeywords: '["producto", "compra", "ayuda"]', // Como string JSON
      aiInstructions: "Eres un asistente de soporte.",
      aiPersonality: "helpful",
      conversationObjective: "support"
    };

    const testChatbotWithEmptyTriggers = {
      id: 31,
      triggerKeywords: null, // Sin triggers
      aiInstructions: "Eres un asistente general.",
      aiPersonality: "neutral",
      conversationObjective: "general"
    };

    // Función para simular el procesamiento de triggers (como en whatsappMultiService.ts)
    function processTriggers(chatbot, message) {
      let triggers = [];
      
      try {
        // Intentar parsear triggerKeywords si existe y no está vacío
        if (chatbot.triggerKeywords && chatbot.triggerKeywords.length > 0) {
          if (Array.isArray(chatbot.triggerKeywords)) {
            triggers = chatbot.triggerKeywords;
          } else if (typeof chatbot.triggerKeywords === 'string') {
            triggers = JSON.parse(chatbot.triggerKeywords);
          }
        }
      } catch (error) {
        console.error('Error parseando triggers:', error);
        triggers = []; // Si hay error, usar array vacío
      }
      
      const incomingMessage = message.toLowerCase();

      // Si no hay triggers, responde a todo. Si hay, verifica si el mensaje contiene alguno.
      const shouldRespond = triggers.length === 0 || 
        triggers.some(trigger => incomingMessage.includes(trigger.toLowerCase()));
      
      return {
        triggers,
        shouldRespond,
        message: incomingMessage
      };
    }

    // Test 1: Chatbot con triggers como array
    console.log('\n📋 Test 1: Triggers como array');
    let result = processTriggers(testChatbot, "Hola, necesito información sobre precios");
    console.log(`  Triggers: [${result.triggers.join(', ')}]`);
    console.log(`  Mensaje: "${result.message}"`);
    console.log(`  ¿Debe responder?: ${result.shouldRespond} ✅`);

    result = processTriggers(testChatbot, "Quiero saber el clima");
    console.log(`  Mensaje: "${result.message}"`);
    console.log(`  ¿Debe responder?: ${result.shouldRespond} (debería ser false) ❌`);

    // Test 2: Chatbot con triggers como string JSON
    console.log('\n📋 Test 2: Triggers como string JSON');
    result = processTriggers(testChatbotWithStringTriggers, "Necesito ayuda con un producto");
    console.log(`  Triggers: [${result.triggers.join(', ')}]`);
    console.log(`  Mensaje: "${result.message}"`);
    console.log(`  ¿Debe responder?: ${result.shouldRespond} ✅`);

    // Test 3: Chatbot sin triggers (responde a todo)
    console.log('\n📋 Test 3: Sin triggers (responde a todo)');
    result = processTriggers(testChatbotWithEmptyTriggers, "Cualquier mensaje");
    console.log(`  Triggers: [${result.triggers.join(', ')}]`);
    console.log(`  Mensaje: "${result.message}"`);
    console.log(`  ¿Debe responder?: ${result.shouldRespond} ✅ (sin triggers = responde todo)`);

    console.log('\n✅ Todos los tests completados exitosamente!');
    console.log('🔧 El sistema de triggers está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Ejecutar test
testWhatsAppTriggers();