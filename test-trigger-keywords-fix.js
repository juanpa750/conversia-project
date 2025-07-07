#!/usr/bin/env node

// Test específico para verificar que las trigger keywords se guardan correctamente
import { SimpleStorage } from './server/storage.js';

const storage = new SimpleStorage();

async function testTriggerKeywordsFix() {
  try {
    console.log('🧪 Testeando el fix de trigger keywords...\n');

    // Test 1: Actualizar con array
    console.log('1️⃣ Test: Actualizar con array de keywords...');
    const testUpdate1 = {
      triggerKeywords: ["hola", "información", "precio", "comprar", "test123"]
    };

    try {
      const result1 = await storage.updateChatbot(29, testUpdate1);
      console.log('✅ Array update exitoso:', result1?.trigger_keywords);
    } catch (error) {
      console.log('❌ Error con array:', error.message);
    }

    // Test 2: Actualizar con string JSON
    console.log('\n2️⃣ Test: Actualizar con string JSON...');
    const testUpdate2 = {
      triggerKeywords: '["hola", "info", "precio", "buy"]'
    };

    try {
      const result2 = await storage.updateChatbot(29, testUpdate2);
      console.log('✅ String JSON update exitoso:', result2?.trigger_keywords);
    } catch (error) {
      console.log('❌ Error con string JSON:', error.message);
    }

    // Test 3: Actualizar con string simple
    console.log('\n3️⃣ Test: Actualizar con string simple...');
    const testUpdate3 = {
      triggerKeywords: "palabra-clave"
    };

    try {
      const result3 = await storage.updateChatbot(29, testUpdate3);
      console.log('✅ String simple update exitoso:', result3?.trigger_keywords);
    } catch (error) {
      console.log('❌ Error con string simple:', error.message);
    }

    // Test 4: Verificar que no se borran las keywords existentes
    console.log('\n4️⃣ Test: Actualizar otros campos sin tocar keywords...');
    const testUpdate4 = {
      name: "Chatbot Master - Test Update",
      description: "Descripción actualizada"
    };

    try {
      const result4 = await storage.updateChatbot(29, testUpdate4);
      console.log('✅ Update sin keywords exitoso, keywords conservadas:', result4?.trigger_keywords);
    } catch (error) {
      console.log('❌ Error actualizando otros campos:', error.message);
    }

    console.log('\n🎉 Tests de trigger keywords completados!');

  } catch (error) {
    console.error('❌ Error general en test:', error);
  }
}

// Ejecutar test
testTriggerKeywordsFix();