import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { DatabaseAdapter } from './DatabaseAdapter';
import { v4 as uuidv4 } from 'uuid';

export class RedisAdapter implements DatabaseAdapter {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor() { /* Constructor */ }
  private _getKey(prefix: string, id: string): string { return `${prefix}:${id}`; }
  
  async connect(config: RedisClientOptions | { url: string } | undefined): Promise<void> { 
    if (this.isConnected && this.client) return;
    try {
      this.client = createClient(config);
      this.client.on('error', (err) => { console.error('Redis Client Error', err); this.isConnected = false; });
      this.client.on('ready', () => { this.isConnected = true; console.log('Redis client connected and ready.'); });
      this.client.on('end', () => { this.isConnected = false; console.log('Redis client connection closed.'); });
      await this.client.connect();
    } catch (error) { console.error('Failed to connect to Redis:', error); this.isConnected = false; this.client = null; throw error; }
  }
  
  async disconnect(): Promise<void> { 
    if (this.client && this.isConnected) {
      try { await this.client.quit(); console.log('Disconnected from Redis.'); }
      catch (error) { console.error('Error during Redis disconnection:', error); }
      finally { this.isConnected = false; this.client = null; }
    }
  }
  
  async insert(keyPrefix: string, data: any): Promise<any> { 
    if (!this.client || !this.isConnected) throw new Error('Redis client not connected.');
    const id = data.id || uuidv4();
    const key = this._getKey(keyPrefix, id);
    const dataToStore = { ...data, id };
    try { await this.client.set(key, JSON.stringify(dataToStore)); return id; }
    catch (error) { console.error(`Error inserting data for key ${key}:`, error); throw error; }
  }
  
  async findOne(keyPrefix: string, criteria: any): Promise<any | null> { 
    if (!this.client || !this.isConnected) throw new Error('Redis client not connected.');
    if (!criteria || typeof criteria.id === 'undefined') throw new Error('findOne requires "id" in criteria.');
    const key = this._getKey(keyPrefix, criteria.id);
    try { const result = await this.client.get(key); return result ? JSON.parse(result) : null; }
    catch (error) { console.error(`Error finding data for key ${key}:`, error); throw error; }
  }
  
  async find(keyPrefix: string, criteria: any): Promise<any[]> { 
    if (!this.client || !this.isConnected) throw new Error('Redis client not connected.');
    try {
      const keys = await this.client.keys(`${keyPrefix}:*`);
      if (!keys || keys.length === 0) return [];
      const results = await this.client.mGet(keys);
      const objects = results.filter(res => res !== null).map(res => JSON.parse(res!));
      if (criteria && Object.keys(criteria).length > 0) {
        return objects.filter(obj => Object.entries(criteria).every(([k, v]) => obj.hasOwnProperty(k) && obj[k] === v));
      }
      return objects;
    } catch (error) { console.error(`Error finding data for prefix ${keyPrefix}:`, error); throw error; }
  }

  /**
   * Updates a record in Redis, identified by ID in criteria.
   * @param keyPrefix Prefix for the key.
   * @param criteria Must contain an 'id' field to identify the record.
   * @param data Data to update. This will overwrite the existing record.
   * @returns Number of records updated (1 if successful and ID found, 0 otherwise).
   */
  async update(keyPrefix: string, criteria: any, data: any): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected.');
    }
    if (!criteria || typeof criteria.id === 'undefined') {
      throw new Error('Update in RedisAdapter requires an "id" in criteria.');
    }

    const key = this._getKey(keyPrefix, criteria.id);
    
    try {
      // Check if key exists to report accurate "updated" count
      const exists = await this.client.exists(key);
      if (exists === 0) { // client.exists returns number of keys that exist
        return 0; // Record not found, nothing to update
      }
      
      // Ensure the ID from criteria is preserved in the new data
      const dataToStore = { ...data, id: criteria.id }; 
      await this.client.set(key, JSON.stringify(dataToStore));
      return 1; // Successfully updated 1 record
    } catch (error) {
      console.error(`Error updating data in Redis for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a record from Redis by ID.
   * @param keyPrefix Prefix for the key.
   * @param criteria Must contain an 'id' field.
   * @returns Number of records deleted (1 if successful, 0 if key not found).
   */
  async delete(keyPrefix: string, criteria: any): Promise<number> {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected.');
    }
    if (!criteria || typeof criteria.id === 'undefined') {
      throw new Error('Delete in RedisAdapter requires an "id" in criteria.');
    }

    const key = this._getKey(keyPrefix, criteria.id);
    try {
      const result = await this.client.del(key);
      return result; // Returns the number of keys that were removed.
    } catch (error) {
      console.error(`Error deleting data in Redis for key ${key}:`, error);
      throw error;
    }
  }

  async query(queryString: string, params?: any[]): Promise<any[]> {
    // To be implemented (could be for raw Redis commands)
    // For now, let's make it clear it's not the same as SQL query
    console.warn('The "query" method in RedisAdapter is intended for raw Redis commands and is not fully implemented for general purpose querying like SQL adapters.');
    throw new Error('Method not implemented or not applicable for general queries in RedisAdapter.');
  }
}
