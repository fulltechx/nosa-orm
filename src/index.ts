import { ORM } from './orm/ORM';
import { DatabaseAdapterFactory, DatabaseType } from './factories/DatabaseAdapterFactory';
import { MongoDBAdapter } from './adapters/MongoDBAdapter'; // For type checking example
import { MySQLAdapter } from './adapters/MySQLAdapter';   // For type checking example
import { PostgresAdapter } from './adapters/PostgresAdapter'; // For type checking example
import { DatabaseAdapter } from './adapters/DatabaseAdapter';

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
  console.log('Demonstrating DatabaseAdapterFactory...');

  // --- MongoDB Example ---
  try {
    console.log('\n--- MongoDB Example ---');
    const mongoAdapter = DatabaseAdapterFactory.createAdapter(
      DatabaseType.MONGODB,
      mongoConfig, // Config is for connect method, not constructor
    );
    
    if (mongoAdapter instanceof MongoDBAdapter) {
      console.log('MongoDBAdapter created successfully via factory.');
      const ormWithMongo = new ORM(mongoAdapter);
      console.log('ORM instantiated with MongoDBAdapter.');
      // Example usage (optional, depends on adapter's connect method being called)
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
      mysqlConfig, // Config is for connect method, not constructor
    );

    if (mysqlAdapter instanceof MySQLAdapter) {
      console.log('MySQLAdapter created successfully via factory.');
      const ormWithMysql = new ORM(mysqlAdapter);
      console.log('ORM instantiated with MySQLAdapter.');
      // Example usage (optional)
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
      postgresConfig, // Config is for connect method, not constructor
    );
    
    if (postgresAdapter instanceof PostgresAdapter) {
      console.log('PostgresAdapter created successfully via factory.');
      const ormWithPostgres = new ORM(postgresAdapter);
      console.log('ORM instantiated with PostgresAdapter.');
      // Example usage (optional)
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
    console.log('This should not be reached if error handling works.');
  } catch (error: any) {
    console.log('Correctly caught error for unsupported type:');
    console.error(error.message);
  }
  
  console.log('\nFactory demonstration complete.');
}

main().catch(console.error);

// To run this example, you would typically compile the TS to JS (e.g., using tsc)
// and then run the output JS file (e.g., node dist/index.js).
// Make sure you have the necessary database drivers installed (mongodb, mysql2, pg).
// For example: npm install mongodb mysql2 pg
// The example code itself does not perform actual database connections unless uncommented,
// so it can be run without live database instances for basic factory demonstration.
