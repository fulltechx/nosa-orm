// To run this example:
// 1. Ensure you have ts-node installed (npm install -g ts-node)
// 2. Ensure you have the necessary database drivers installed (npm install mongodb mysql2 pg redis)
// 3. From the root of the project, run: ts-node examples/simple-usage.ts

import { 
  ORM, 
  DatabaseAdapterFactory, 
  DatabaseType,
  MongoDBAdapter, // For instanceof checks
  MySQLAdapter,   // For instanceof checks
  PostgresAdapter, // For instanceof checks
  RedisAdapter // Added RedisAdapter for instanceof check
} from '../src'; // Adjusted import path

// Example: Configuration for MongoDB
const mongoConfig = {
  url: 'mongodb://localhost:27017',
  dbName: 'testdb',
};

// Example: Configuration for MySQL
const mysqlConfig = {
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'testdb',
};

// Example: Configuration for PostgreSQL
const postgresConfig = {
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'testdb',
  port: 5432,
};

// Example: Configuration for Redis
const redisConfig = {
  url: process.env.TEST_REDIS_URL || 'redis://localhost:6379', // Use environment variable if available
};

async function main() {
  console.log('Demonstrating DatabaseAdapterFactory from library exports...');

  // --- MongoDB Example ---
  try {
    console.log('\n--- MongoDB Example ---');
    const mongoAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.MONGODB,
      {} 
    );
    
    if (mongoAdapter instanceof MongoDBAdapter) {
      console.log('MongoDBAdapter created successfully via factory.');
      const ormWithMongo = new ORM(mongoAdapter);
      console.log('ORM instantiated with MongoDBAdapter.');
      // await mongoAdapter.connect(mongoConfig);
      // console.log('Connected to MongoDB (example).');
      // await mongoAdapter.disconnect();
    } else {
      console.error('Failed to create MongoDBAdapter correctly.');
    }
  } catch (error) {
    console.error('Error in MongoDB example:', error);
  }

  // --- MySQL Example ---
  try {
    console.log('\n--- MySQL Example ---');
    const mysqlAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.MYSQL,
      {}
    );

    if (mysqlAdapter instanceof MySQLAdapter) {
      console.log('MySQLAdapter created successfully via factory.');
      const ormWithMysql = new ORM(mysqlAdapter);
      console.log('ORM instantiated with MySQLAdapter.');
      // await mysqlAdapter.connect(mysqlConfig);
      // console.log('Connected to MySQL (example).');
      // await mysqlAdapter.disconnect();
    } else {
      console.error('Failed to create MySQLAdapter correctly.');
    }
  } catch (error) {
    console.error('Error in MySQL example:', error);
  }

  // --- PostgreSQL Example ---
  try {
    console.log('\n--- PostgreSQL Example ---');
    const postgresAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.POSTGRESQL,
      {}
    );
    
    if (postgresAdapter instanceof PostgresAdapter) {
      console.log('PostgresAdapter created successfully via factory.');
      const ormWithPostgres = new ORM(postgresAdapter);
      console.log('ORM instantiated with PostgresAdapter.');
      // await postgresAdapter.connect(postgresConfig);
      // console.log('Connected to PostgreSQL (example).');
      // await postgresAdapter.disconnect();
    } else {
      console.error('Failed to create PostgresAdapter correctly.');
    }
  } catch (error) {
    console.error('Error in PostgreSQL example:', error);
  }

  // --- Redis Example ---
  try {
    console.log('\n--- Redis Example ---');
    const redisAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.REDIS,
      {} // Config is for connect method, not constructor here
    );

    if (redisAdapter instanceof RedisAdapter) {
      console.log('RedisAdapter created successfully via factory.');
      const ormWithRedis = new ORM(redisAdapter);
      console.log('ORM instantiated with RedisAdapter.');

      // Example usage (optional, requires Redis server)
      // console.log('Attempting to connect to Redis (example)...');
      // await redisAdapter.connect(redisConfig); // Pass full config here
      // console.log('Connected to Redis (example).');

      // const PKey = 'exampleUser'; // Key prefix for this example
      // const userId = 'user123';
      
      // console.log(`Inserting item with ID ${userId} into Redis...`);
      // await ormWithRedis.insert(PKey, { id: userId, name: 'Redis User', email: 'redis@example.com' });
      // console.log('Item inserted.');

      // console.log(`Finding item with ID ${userId} from Redis...`);
      // const userFromRedis = await ormWithRedis.findOne(PKey, { id: userId });
      // console.log('Found item:', userFromRedis);

      // await redisAdapter.disconnect();
      // console.log('Disconnected from Redis (example).');
    } else {
      console.error('Failed to create RedisAdapter correctly.');
    }
  } catch (error) {
    console.error('Error in Redis example:', error);
  }

  // --- Error Handling Example for Unsupported Type ---
  try {
    console.log('\n--- Unsupported Type Example ---');
    const unsupportedAdapter = DatabaseAdapterFactory.createAdapter(
      'unsupported_db_type' as DatabaseType, 
      {},
    );
    console.log('Created adapter for unsupported type (this indicates an issue):', unsupportedAdapter);
  } catch (error: any) {
    console.log('Correctly caught error for unsupported type:');
    console.error(error.message); 
  }
  
  console.log('\nFactory demonstration complete.');
}

main().catch(error => {
  console.error('Unhandled error in main execution:', error);
});
