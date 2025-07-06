// server/routes.ts - Integración de las rutas WhatsApp
import express from 'express';
import whatsappRoutes from './whatsappRoutes';

const router = express.Router();

// ... tus rutas existentes ...

// Agregar rutas de WhatsApp
router.use('/api', whatsappRoutes);

// ... resto de tus rutas ...

export default router;