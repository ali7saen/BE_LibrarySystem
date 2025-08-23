// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'booksData',
            password: process.env.DB_PASSWORD || 'root',
            port: process.env.DB_PORT || 5432,
            max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });

        console.log('Database pool created successfully');
    }

    // Get a client from the pool
    getClient() {
        return this.pool.connect();
    }

    // Execute a single query
    async query(text, params = []) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Executed query', { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            console.error('Database query error:', { text, params, error: error.message });
            throw error;
        }
    }

    // Close all connections
    async close() {
        try {
            await this.pool.end();
            console.log('Database pool closed');
        } catch (error) {
            console.error('Error closing database pool:', error);
        }
    }
}

// Create singleton instance
const db = new Database();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing database connections...');
    await db.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing database connections...');
    await db.close();
    process.exit(0);
});

module.exports = db;