# ConversIA - WhatsApp Chatbot Platform

## Overview

ConversIA is a comprehensive WhatsApp chatbot platform designed for businesses to create, manage, and analyze chatbots. It enables businesses to automate customer service, boost sales, and improve client relationships through WhatsApp chatbots.

The application follows a modern web architecture with a React frontend and Node.js Express backend. It uses Drizzle ORM with PostgreSQL for data storage and includes Stripe integration for subscription management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React with functional components and hooks
- **State Management**: React Query for server state and local component state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: TailwindCSS with shadcn/ui components for consistent UI
- **Form Handling**: React Hook Form with Zod for validation

The frontend is organized into feature-based directories within the `client/src` folder:
- `/pages`: Main application pages
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and shared code

### Backend Architecture

- **Framework**: Express.js running on Node.js
- **API Design**: RESTful API endpoints 
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Database Access**: Drizzle ORM for type-safe database queries

The backend is organized in the `server` directory with a clear separation of concerns:
- `index.ts`: Server entry point and middleware setup
- `routes.ts`: API route definitions
- `auth.ts`: Authentication logic
- `db.ts`: Database connection and configuration
- `storage.ts`: Data access layer
- `stripe.ts`: Payment processing integration

### Database Architecture

- **Database**: PostgreSQL (via Neon Serverless)
- **ORM**: Drizzle ORM with a type-safe schema
- **Schema**: Defined in `shared/schema.ts` with proper relationships between entities

The schema includes tables for:
- Users and authentication
- Subscription management
- Chatbot configuration
- WhatsApp integration
- Customer contacts and conversations
- Analytics data

### Authentication System

- JWT-based authentication
- Cookie-based token storage for web clients
- Role-based access control (user/admin roles)

## Key Components

### Chatbot Builder

A visual interface for creating and configuring chatbots with:
- Conversation flow design
- Response templates
- Integration with WhatsApp API
- Natural language understanding capabilities

### Dashboard

A comprehensive overview dashboard showing:
- Chatbot performance metrics
- Message volume analytics
- User engagement statistics
- Subscription status

### Client Management

Features for managing business contacts:
- Contact database
- Conversation history
- Customer segmentation
- Automated messaging

### Analytics

Detailed analytics for chatbot performance:
- Message volume tracking
- Conversion rates
- Response time metrics
- User engagement analysis

### Subscription Management

Integrated payment system with:
- Tiered subscription plans
- Stripe payment processing
- Usage quotas and limits
- Billing management

## Data Flow

1. **Authentication Flow**:
   - User submits credentials
   - Server validates and issues JWT token
   - Frontend stores token for authenticated requests

2. **Chatbot Creation Flow**:
   - User designs chatbot through builder interface
   - Configuration saved to database
   - Chatbot deployed to WhatsApp integration

3. **Message Handling Flow**:
   - WhatsApp messages received through integration
   - Processed by appropriate chatbot logic
   - Responses sent back to user
   - Conversations logged for analysis

4. **Analytics Flow**:
   - User actions and chatbot interactions logged
   - Data aggregated for analytics
   - Visualized in dashboard and reports

5. **Subscription Flow**:
   - User selects subscription plan
   - Redirected to Stripe for payment
   - Webhook confirms successful payment
   - Account upgraded with new limits

## External Dependencies

### Frontend Dependencies
- React and React DOM
- Wouter for routing
- TanStack React Query for data fetching
- React Hook Form with Zod for form validation
- Radix UI components (via shadcn/ui)
- TailwindCSS for styling
- Recharts for data visualization
- Stripe JS for payment processing

### Backend Dependencies
- Express for API server
- Drizzle ORM for database access
- Neon Serverless for PostgreSQL connection
- Bcrypt for password hashing
- JWT for authentication
- Stripe for payment processing

### Third-Party Services
- Stripe for payment processing
- WhatsApp Business API for messaging integration

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Mode**:
   - Run with `npm run dev`
   - Uses Vite dev server for HMR
   - Express backend runs concurrently

2. **Production Build**:
   - Frontend built with Vite (`npm run build`)
   - Backend bundled with esbuild
   - Static assets served by Express

3. **Database Provisioning**:
   - PostgreSQL via Replit's postgresql-16 module
   - Schema migrations via Drizzle Kit

4. **Environment Configuration**:
   - Environment variables for API keys and secrets
   - Different configurations for development and production

5. **Scaling Considerations**:
   - Stateless API design for horizontal scaling
   - Connection pooling for database access
   - Caching strategy for frequent queries

## Getting Started

1. Ensure the PostgreSQL database is provisioned
2. Run `npm install` to install dependencies
3. Set up required environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT signing
   - `STRIPE_SECRET_KEY`: Stripe API secret key
   - `STRIPE_PUBLIC_KEY`: Stripe API public key
   - WhatsApp Master API (optional for full functionality):
     - `WHATSAPP_MASTER_TOKEN`: Meta access token
     - `WHATSAPP_APP_ID`: Facebook app ID
     - `WHATSAPP_APP_SECRET`: Facebook app secret
     - `WHATSAPP_VERIFY_TOKEN`: Webhook verification token
     - `WHATSAPP_BUSINESS_ACCOUNT_ID`: Meta Business Account ID
4. Run `npm run db:push` to set up the database schema
5. Run `npm run dev` to start the development server
6. Access the application at the provided URL

## Current State (January 5, 2025)
- **Status**: Individual WhatsApp configuration per chatbot implemented with enhanced stealth technology
- **Test User**: prueba@botmaster.com / password: 123456
- **Active Chatbots**: Suplemento Vitamina D3 (ID: 26), Kit Diosa Negra (ID: 24) with dedicated WhatsApp numbers
- **Products**: Multiple configured with individual AI personalities
- **WhatsApp Integration**: Enhanced WhatsApp Web with per-chatbot number assignment
- **New Architecture**: Each chatbot can have its own WhatsApp number with specific AI responses
- **System Dependencies**: Puppeteer with stealth plugin for improved QR generation

## Recent Changes
- **January 7, 2025 (Night - 10:22 PM)**: Professional AI Instruction System Implemented
- **STRUCTURED AI SERVICE**: Created complete structured AI service with professional sales framework
- **CONVERSATION STAGES**: Greeting, qualifying, presenting, objection handling, closing stages
- **DYNAMIC PROMPTS**: System prompts built dynamically from chatbot configuration
- **SALES METHODOLOGY**: Implements proper lead qualification and sales progression
- **OBJECTIVE-BASED RESPONSES**: Different responses for sales, appointments, and information goals
- **PERSONALITY ADAPTATION**: Responses adapt to configured personality (friendly, formal, direct, balanced)

- **January 7, 2025 (Night - 10:14 PM)**: AI Now Uses Product Knowledge Intelligently
- **CRITICAL FIX**: AI now uses product description as INTERNAL KNOWLEDGE only
- **SMART RESPONSES**: AI responds specifically to client questions, not information dumping
- **GRADUAL CONVERSATION**: System answers only what client asks (price, benefits, usage, etc.)
- **NATURAL FLOW**: Conversations now build gradually based on client interest
- **CLIENT-FOCUSED**: No more overwhelming clients with entire product descriptions

- **January 7, 2025 (Night - 10:07 PM)**: Enhanced Conversational AI Response System
- **FIXED**: Removed repetitive "Hola! Bienvenido a 29" from AI responses  
- **IMPROVED**: AI responses now format long product descriptions into conversational snippets
- **ENHANCED**: Added intelligent question generation at end of responses for engagement
- **OPTIMIZED**: Messages now limited to ~500 characters with key product highlights
- **NATURAL**: Conversation flow now more organic with proper follow-up questions

- **January 7, 2025 (Night - 9:40 PM)**: Fixed Critical Frontend Cache Update Issue
- **FIXED**: Configuration no longer disappears when changing products
- **FIXED**: Frontend cache now updates immediately after save operations
- **FIXED**: Auto-save filter prevents empty fields from overwriting existing data
- **IMPROVED**: Server data synchronization with frontend form state
- **RESOLVED**: User frustration with data persistence - changes now appear instantly

- **January 7, 2025 (Evening)**: Major WhatsApp Integration UX Overhaul
- **Removed Confusing Demo Mode**: Eliminated demo/real WhatsApp toggle that was confusing users
- **Honest Connection Process**: Replaced fake QR codes with clear instructions to use web.whatsapp.com
- **Simplified User Interface**: Removed non-functional verify button and streamlined connection flow
- **Improved User Communication**: Added clear step-by-step instructions for real WhatsApp Web connection
- **Enhanced Visual Feedback**: Better status indicators showing chatbot readiness and connection states
- **Transparent Approach**: System now clearly explains that users need to connect via official WhatsApp Web
- **Better Button Labels**: Changed "Conectar WhatsApp" to "Activar Chatbot" for clarity

- **January 7, 2025 (Late Evening)**: WhatsApp Real Connection System Fixed
- **Fixed QR Generation**: Resolved issue where QR codes were generated but not returned to frontend
- **Eliminated Route Conflicts**: Removed duplicate API routes that caused authentication issues
- **Improved Session Management**: Enhanced session status tracking and debugging
- **Successful Connection**: WhatsApp now connects properly and shows phone number when connected
- **Working Status**: System now shows connected status with phone number after successful QR scan

- **January 7, 2025 (Night)**: Complete Chatbot Editor and AI Response System Fixed
- **Fixed Form Data Persistence**: Resolved critical issue where chatbot configuration wasn't saving
- **Added Missing Database Column**: Added welcome_message column to chatbots table
- **Complete Storage Mapping**: Fixed backend mapping for all chatbot fields including triggerKeywords and welcomeMessage
- **Implemented AI Message Processing**: Added complete message handling system with trigger word detection
- **Working Auto-Responses**: Chatbots now properly respond to WhatsApp messages when trigger words are detected
- **Full Integration**: WhatsApp connection + chatbot configuration + AI responses all working together
- **Smart Conversation Flow**: First message needs trigger keyword, then maintains 30-minute active conversation
- **Flexible Trigger Words**: Any words configured in "Palabras Clave de Activación" work as triggers
- **Complete Database Integration**: All WhatsApp message columns properly configured and working

## Development Workflow

1. Frontend code changes in `client/src`
2. Backend API changes in `server/`
3. Database schema changes in `shared/schema.ts`
4. Run `npm run db:push` after schema changes
5. Test changes locally before deployment