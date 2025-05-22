import { Express } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { isAuthenticated } from './auth';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// Define subscription plans
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    currency: 'eur',
    priceMonthly: 29,
    priceYearly: 290,
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    currency: 'eur',
    priceMonthly: 79,
    priceYearly: 790,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    currency: 'eur',
    priceMonthly: 199,
    priceYearly: 1990,
  },
};

export function setupStripe(app: Express) {
  // Get plan details
  app.get('/api/subscription/plans/:planId', (req, res) => {
    const planId = req.params.planId;
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  });

  // Create a payment intent for subscription checkout
  app.post('/api/subscription/create-intent', isAuthenticated, async (req, res) => {
    try {
      const { planId } = req.body;
      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
      
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      // Get user
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create or retrieve customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(req.userId, { stripeCustomerId: customerId });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.priceMonthly * 100, // Convert to cents
        currency: plan.currency,
        customer: customerId,
        metadata: {
          planId,
          userId: req.userId,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
    }
  });

  // Create a subscription
  app.post('/api/create-subscription', isAuthenticated, async (req, res) => {
    try {
      const { planId, billingInfo } = req.body;
      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
      
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      // Get user
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create or retrieve customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: billingInfo.email,
          name: billingInfo.name,
          address: {
            line1: billingInfo.address,
            city: billingInfo.city,
            postal_code: billingInfo.postalCode,
            country: billingInfo.country,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(req.userId, { stripeCustomerId: customerId });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.priceMonthly * 100, // Convert to cents
        currency: plan.currency,
        customer: customerId,
        metadata: {
          planId,
          userId: req.userId,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
  });

  // Handle Stripe webhook events
  app.post('/api/webhook', async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig || '',
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, planId } = paymentIntent.metadata;
        
        if (userId && planId) {
          // Create subscription
          const subscription = await stripe.subscriptions.create({
            customer: paymentIntent.customer as string,
            items: [
              {
                price: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS].priceId,
              },
            ],
            metadata: {
              userId,
              planId,
            },
          });
          
          // Update user with subscription ID
          await storage.updateUser(userId, { stripeSubscriptionId: subscription.id });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;
        
        if (userId) {
          // Update user subscription status
          await storage.updateUser(userId, { stripeSubscriptionId: null });
        }
        break;
      }
      
      // Add more event handlers as needed
    }
    
    res.status(200).json({ received: true });
  });
}
