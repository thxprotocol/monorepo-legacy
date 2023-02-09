import { STRIPE_SECRET_TEST_KEY } from '../config/secrets';
import Stripe from 'stripe';

export const stripe = new Stripe(STRIPE_SECRET_TEST_KEY, { apiVersion: null });
