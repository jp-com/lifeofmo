import type { Client, InStatement, InValue, ResultSet } from "@libsql/client";

// Keep the existing SQLite queries usable on both Cloudflare D1 and Turso.
// In particular, webhook batches must commit or roll back as one transaction.
function result<T>(set: ResultSet): D1Result<T> {
  return {
    success: true,
    results: set.rows.map((row) => Object.fromEntries(set.columns.map((column, i) => [column, row[i]]))) as T[],
    meta: { changes: set.rowsAffected, last_row_id: Number(set.lastInsertRowid ?? 0),
      changed_db: set.rowsAffected > 0, duration: 0, size_after: 0, rows_read: set.rows.length, rows_written: set.rowsAffected },
  };
}

class Statement implements D1PreparedStatement {
  constructor(readonly client: Client, readonly sql: string, readonly args: InValue[] = []) {}
  bind(...values: unknown[]): Statement {
    return new Statement(this.client, this.sql, values.map((value) => {
      if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "bigint" || value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return value as InValue;
      throw new TypeError("Unsupported SQLite parameter type");
    }));
  }
  input(): InStatement { return { sql: this.sql, args: this.args }; }
  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> { return result<T>(await this.client.execute(this.input())); }
  run<T = Record<string, unknown>>(): Promise<D1Result<T>> { return this.all<T>(); }
  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const row = (await this.all<Record<string, unknown>>()).results[0];
    if (!row) return null;
    if (column !== undefined && !(column in row)) throw new Error("SQLite result column does not exist");
    return (column === undefined ? row : row[column]) as T;
  }
  raw<T = unknown[]>(options: { columnNames: true }): Promise<[string[], ...T[]]>;
  raw<T = unknown[]>(options?: { columnNames?: false }): Promise<T[]>;
  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[] | [string[], ...T[]]> {
    const set = await this.client.execute(this.input());
    const rows = set.rows.map((row) => set.columns.map((_, i) => row[i])) as T[];
    return options?.columnNames ? [set.columns, ...rows] : rows;
  }
}

export function libsqlD1(client: Client): D1Database {
  return {
    prepare: (sql) => new Statement(client, sql),
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      const inputs = statements.map((statement) => {
        if (!(statement instanceof Statement) || statement.client !== client) throw new Error("Cannot mix database clients in a batch");
        return statement.input();
      });
      if (!inputs.length) return [];
      return (await client.batch(inputs, "write")).map((set) => result<T>(set));
    },
    // DDL migrations use the libSQL migrator instead of D1-specific APIs.
    async exec() { throw new Error("Use db:migrate:turso for schema changes"); },
    withSession() { throw new Error("D1 sessions are unavailable on Turso"); },
    async dump() { throw new Error("D1 dumps are unavailable on Turso"); },
  };
}
