// Local PostgreSQL Database Client
// Direct connection to local PostgreSQL database

import { Pool, PoolClient } from 'pg';
import type { Database } from '../supabase/types';

// Local PostgreSQL connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'smartuniit_db',
  user: 'postgres',
  password: 'smartuniit123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database client interface
export interface LocalDBClient {
  query: (text: string, params?: any[]) => Promise<any>;
  getClient: () => Promise<PoolClient>;
  close: () => Promise<void>;
}

// Create database client
export const localDB: LocalDBClient = {
  async query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },

  async getClient() {
    return await pool.connect();
  },

  async close() {
    await pool.end();
  }
};

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const result = await localDB.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database connection
export async function initializeDB() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('Local database initialized successfully');
    } else {
      console.error('Failed to initialize local database');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default localDB; 