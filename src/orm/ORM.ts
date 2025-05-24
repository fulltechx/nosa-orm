import { DatabaseAdapter } from '../adapters/DatabaseAdapter';
import { Model, setORMInstance } from './Model'; // Assuming Model and setORMInstance are exported from Model.ts

export class ORM {
  private adapter: DatabaseAdapter;
  private models: Map<typeof Model, string> = new Map(); // Maps Model class to table/collection name

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
    setORMInstance(this); // Inject this ORM instance into the Model base class
  }

  defineModel(modelClass: typeof Model, tableName: string): void {
    modelClass.tableName = tableName; // Set static tableName property on the model
    this.models.set(modelClass, tableName);
    console.log(`Model ${modelClass.name} defined for table/collection ${tableName}`);
  }

  private getTableName(modelClass: typeof Model): string {
    const tableName = this.models.get(modelClass) || modelClass.tableName;
    if (!tableName) {
      throw new Error(`Model ${modelClass.name} not defined or tableName not set.`);
    }
    return tableName;
  }

  async insert<T extends Model>(modelClass: typeof Model, data: Partial<T>): Promise<T> {
    const tableName = this.getTableName(modelClass);
    // Remove undefined fields from data before insertion, as some DBs might error
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as Partial<T>);

    const insertedId = await this.adapter.insert(tableName, cleanData);
    
    // Construct a new model instance with the original data and the new ID
    // The adapter's insert method should return the ID in a way that can be assigned.
    // For SQL, it's often `insertId`. For Mongo, `insertedId`.
    // We'll assume the adapter's insert method returns an object if multiple fields (like _id for Mongo) are generated or just the id.
    // Or, more simply, it returns the primary key value.
    
    const resultData: any = { ...cleanData };
    if (typeof insertedId === 'object' && insertedId !== null) {
        Object.assign(resultData, insertedId); // If insert returns an object (e.g. MongoDB _id)
    } else if (insertedId !== undefined && insertedId !== null) {
        // Try to determine PK field: id (SQL) or _id (Mongo)
        // This is a simplification. A more robust ORM might need explicit PK configuration on the model.
        // For now, if 'id' is in data, assume that's not the one we want to overwrite with a potentially different PK name.
        // If 'id' isn't in data, or if adapter specifically returns something named 'id' or '_id'.
        // This part is tricky without knowing the exact return shape of adapter.insert
        // Let's assume adapter.insert returns the ID value directly for SQL, or an object containing the ID for Mongo.
        // And the Model's save method will handle assigning it.
        // The ORM's insert method primarily ensures data goes to DB and gets back an ID.
        // The Model's save method (which calls this) should handle updating the instance.
        
        // For now, let's assume the `insert` method of the adapter returns the generated ID (e.g., `id` or `_id`)
        // And the `Model.save()` method will be responsible for updating the instance with this ID.
        // So, this ORM method can return the data including the ID.
        
        // A common pattern is for `adapter.insert` to return the primary key value.
        // We need to know what field to assign it to.
        // Let's assume the model has an `id` or `_id` field that should receive this value.
        // This is heuristic. A better ORM would have explicit PK mapping.
        if (this.adapter.constructor.name === 'MongoDBAdapter') {
            resultData._id = insertedId;
        } else {
            resultData.id = insertedId;
        }
    }
    return new modelClass(resultData) as T;
  }

  async find<T extends Model>(modelClass: typeof Model, criteria: any): Promise<T[]> {
    const tableName = this.getTableName(modelClass);
    const results = await this.adapter.find(tableName, criteria);
    return results.map(data => new modelClass(data) as T);
  }

  async findOne<T extends Model>(modelClass: typeof Model, criteria: any): Promise<T | null> {
    const tableName = this.getTableName(modelClass);
    const result = await this.adapter.findOne(tableName, criteria);
    return result ? new modelClass(result) as T : null;
  }

  async update<T extends Model>(modelClass: typeof Model, criteria: any, data: Partial<T>): Promise<number> {
    const tableName = this.getTableName(modelClass);
    // Remove undefined fields from data to prevent issues with $set operations or SQL updates
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as Partial<T>);
    // Don't allow updating primary key fields through this generic update.
    // Users should not typically change primary keys.
    delete (cleanData as any).id;
    delete (cleanData as any)._id;

    return this.adapter.update(tableName, criteria, cleanData);
  }

  async delete(modelClass: typeof Model, criteria: any): Promise<number> {
    const tableName = this.getTableName(modelClass);
    return this.adapter.delete(tableName, criteria);
  }

  // Direct query access (mainly for SQL)
  async query(queryString: string, params?: any[]): Promise<any[]> {
    // This method is more aligned with SQL databases.
    // For MongoDB, the adapter's query method is adapted.
    // Consider how to expose MongoDB's specific query if needed, perhaps through a different method or by checking adapter type.
    if (typeof this.adapter.query !== 'function') {
        throw new Error('The configured adapter does not support raw query strings in this manner.');
    }
    return this.adapter.query(queryString, params);
  }
  
  // Potentially add a way to access the adapter directly if needed for specific DB operations
  getAdapter(): DatabaseAdapter {
    return this.adapter;
  }
}
