// To run this example:
// 1. Ensure you have ts-node installed (npm install -g ts-node)
// 2. Ensure you have the necessary database drivers installed (npm install mongodb mysql2 pg)
// 3. From the root of the project, run: ts-node examples/simple-usage.ts

import { 
  ORM, 
  DatabaseAdapterFactory, 
  DatabaseType,
  MongoDBAdapter, // For instanceof checks
  MySQLAdapter,   // For instanceof checks
  PostgresAdapter // For instanceof checks
  // Model is not directly used in this basic example but would be in a real app
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

async function main() {
  console.log('Demonstrating DatabaseAdapterFactory from library exports...');

  // --- MongoDB Example ---
  try {
    console.log('\n--- MongoDB Example ---');
    // Config is for the adapter's connect method, not the factory's createAdapter method.
    const mongoAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.MONGODB,
      {} // Pass empty config or specific config if adapter constructor needs it
    );
    
    if (mongoAdapter instanceof MongoDBAdapter) {
      console.log('MongoDBAdapter created successfully via factory.');
      const ormWithMongo = new ORM(mongoAdapter);
      console.log('ORM instantiated with MongoDBAdapter.');
      
      // To actually connect (optional, for demonstration):
      // console.log('Attempting to connect to MongoDB (example)...');
      // await mongoAdapter.connect(mongoConfig);
      // console.log('Connected to MongoDB (example).');
      // await mongoAdapter.disconnect();
      // console.log('Disconnected from MongoDB (example).');
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
      // To actually connect (optional, for demonstration):
      // console.log('Attempting to connect to MySQL (example)...');
      // await mysqlAdapter.connect(mysqlConfig);
      // console.log('Connected to MySQL (example).');
      // await mysqlAdapter.disconnect();
      // console.log('Disconnected from MySQL (example).');
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
      // To actually connect (optional, for demonstration):
      // console.log('Attempting to connect to PostgreSQL (example)...');
      // await postgresAdapter.connect(postgresConfig);
      // console.log('Connected to PostgreSQL (example).');
      // await postgresAdapter.disconnect();
      // console.log('Disconnected from PostgreSQL (example).');
    } else {
      console.error('Failed to create PostgresAdapter correctly.');
    }
  } catch (error) {
    console.error('Error in PostgreSQL example:', error);
  }

  // --- Error Handling Example for Unsupported Type ---
  try {
    console.log('\n--- Unsupported Type Example ---');
    const unsupportedAdapter = DatabaseAdapterFactory.createAdapter(
      'unsupported_db_type' as DatabaseType, // Force type for testing
      {},
    );
    // This line should not be reached if error handling in the factory works.
    console.log('Created adapter for unsupported type (this indicates an issue):', unsupportedAdapter);
  } catch (error: any) {
    console.log('Correctly caught error for unsupported type:');
    console.error(error.message); // Displaying the error message
  }
  
  console.log('\nFactory demonstration complete.');
}

main().catch(error => {
  console.error('Unhandled error in main execution:', error);
});
