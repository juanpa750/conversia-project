import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seedDatabase() {
  try {
    console.log("Inicializando base de datos con datos de prueba...");
    
    // Crear usuario de prueba
    const testUserEmail = "prueba@botmaster.com";
    const existingUser = await storage.getUserByEmail(testUserEmail);
    
    if (!existingUser) {
      const hashedPassword = await hashPassword("12345");
      
      const testUser = await storage.createUser({
        email: testUserEmail,
        password: hashedPassword,
        firstName: "Usuario",
        lastName: "Prueba"
      });
      
      console.log("✓ Usuario de prueba creado:");
      console.log("  Email: prueba@botmaster.com");
      console.log("  Contraseña: 12345");
      
      // Crear chatbot de ejemplo
      const chatbot = await storage.createChatbot({
        userId: testUser.id,
        name: "Bot de Ventas Demo",
        description: "Chatbot de demostración para ventas y atención al cliente",
        status: "active",
        type: "sales",
        flow: {
          nodes: [],
          edges: [],
          config: {
            greeting: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
            language: "es",
            enableAI: true,
            fallbackMessage: "Lo siento, no entendí tu consulta. ¿Podrías reformularla?"
          }
        }
      });
      
      console.log("✓ Chatbot de ejemplo creado");
      
      // Crear algunos contactos de ejemplo
      await storage.createContact({
        userId: testUser.id,
        name: "María González",
        phone: "+1234567890",
        email: "maria@ejemplo.com",
        status: "active",
        source: "whatsapp"
      });
      
      await storage.createContact({
        userId: testUser.id,
        name: "Carlos López",
        phone: "+1234567891",
        email: "carlos@ejemplo.com",
        status: "active",
        source: "web"
      });
      
      console.log("✓ Contactos de ejemplo creados");
    } else {
      console.log("Usuario de prueba ya existe");
    }
    
    console.log("✓ Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };