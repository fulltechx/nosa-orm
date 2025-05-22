export interface DatabaseAdapter {
  connect(config: any): Promise<void>;
  disconnect(): Promise<void>;
  insert(tableName: string, data: any): Promise<any>; // Returns generated ID or similar
  find(tableName: string, criteria: any): Promise<any[]>;
  findOne(tableName: string, criteria: any): Promise<any | null>;
  update(tableName: string, criteria: any, data: any): Promise<number>; // Returns number of affected rows
  delete(tableName: string, criteria: any): Promise<number>; // Returns number of affected rows
  query(queryString: string, params?: any[]): Promise<any[]>; // For SQL-like DBs
  // For NoSQL DBs like MongoDB, query might be different,
  // e.g., query(collectionName: string, filter: any, options?: any): Promise<any[]>;
  // For now, we'll keep it generic and adapt in implementations.
}
