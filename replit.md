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

## Current State (January 9, 2025)
- **Status**: Fully functional WhatsApp Web system with improved QR code interface
- **Test User**: prueba@botmaster.com / password: 123456
- **Active Chatbot**: Suplemento Vitamina D3 (ID: 26) with advanced AI personality
- **Products**: 1 configured (Vitamina D3)
- **WhatsApp Integration**: WhatsApp Web with QR code scanning (working)
- **System Dependencies**: Chromium installed and configured for Puppeteer

## Recent Changes
- **January 9, 2025 (Evening)**: Complete cleanup of obsolete WhatsApp Master API system
- **WhatsApp Web Focus**: Eliminated all Meta Cloud API references, simplified to WhatsApp Web only
- **QR Code Improvements**: Enhanced interface with step-by-step instructions and better visual design
- **System Dependencies**: Fixed Chromium path detection for QR code generation
- **UI Cleanup**: Removed duplicate QR components, streamlined integration flow

## Development Workflow

1. Frontend code changes in `client/src`
2. Backend API changes in `server/`
3. Database schema changes in `shared/schema.ts`
4. Run `npm run db:push` after schema changes
5. Test changes locally before deployment