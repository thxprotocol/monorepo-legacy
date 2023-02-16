import { STRIPE_SECRET_KEY } from '../config/secrets';
import Stripe from 'stripe';

export const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: null });
