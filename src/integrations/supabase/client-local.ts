// Local PostgreSQL Database Client Configuration
// This file is for local development with PostgreSQL instead of Supabase

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Local PostgreSQL connection details
const LOCAL_DB_URL = "http://localhost:5432";
const LOCAL_DB_KEY = "local-development-key";

// For local development, we'll use a mock Supabase client
// In a real implementation, you might want to use a direct PostgreSQL client
export const supabase = createClient<Database>(LOCAL_DB_URL, LOCAL_DB_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Note: This is a placeholder implementation
// For full local development, you might want to:
// 1. Use a direct PostgreSQL client (like 'pg' or 'postgres')
// 2. Implement your own authentication system
// 3. Create local equivalents of Supabase functions

console.log('Using local database configuration'); 