/* eslint-disable import/no-unused-modules */
import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import { array, nullType, number, string, union } from "io-ts";
import type {
  CompiledQuery,
  DatabaseConnection,
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryResult as KyselyQueryResult,
  QueryCompiler,
  TransactionSettings,
} from "kysely";
import { SqliteAdapter, SqliteQueryCompiler } from "kysely";
import type { TqlHttpClientConfig } from "treeqlite-http-client";
import { tqlExec } from "treeqlite-http-client";
import type { ExecResult } from "treeqlite-js/bundler";

export class TreeQLiteConnection implements DatabaseConnection {
  public constructor(private readonly config: TqlHttpClientConfig) {}

  public async executeQuery<R>(
    compiledQuery: CompiledQuery,
  ): Promise<KyselyQueryResult<R>> {
    try {
      const execResult = await tqlExec(this.config, {
        query: compiledQuery.sql,
        params: fd(
          array(union([nullType, number, string])),
          compiledQuery.parameters,
        ),
      });

      switch (execResult.type) {
        case `noData`: {
          return {
            numAffectedRows: BigInt(execResult.result.changes),
            insertId: BigInt(execResult.result.lastInsertRowid),
            rows: [],
          };
        }
        case `returnedData`: {
          return { rows: execResult.data as R[] };
        }
      }
      throw new Error(
        `Unexpected execResult.type: ${(execResult as ExecResult).type}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error: ${String(error)}`);
    }
  }

  public streamQuery<R>(
    _compiledQuery: CompiledQuery,
    _chunkSize?: number | undefined,
  ): AsyncIterableIterator<KyselyQueryResult<R>> {
    throw new Error(`TreeQLiteConnection.streamQuery not implemented.`);
  }
}

export class TreeQLiteDriver implements Driver {
  public constructor(private readonly config: TqlHttpClientConfig) {}

  public init(): Promise<void> {
    return Promise.resolve();
  }

  public acquireConnection(): Promise<DatabaseConnection> {
    return Promise.resolve(new TreeQLiteConnection(this.config));
  }

  public beginTransaction(
    _connection: DatabaseConnection,
    _settings: TransactionSettings,
  ): Promise<void> {
    throw new Error(`TreeQLiteDriver.beginTransaction not implemented.`);
  }

  public commitTransaction(_connection: DatabaseConnection): Promise<void> {
    throw new Error(`TreeQLiteDriver.commitTransaction not implemented.`);
  }

  public rollbackTransaction(_connection: DatabaseConnection): Promise<void> {
    throw new Error(`TreeQLiteDriver.rollbackTransaction not implemented.`);
  }

  public releaseConnection(_connection: DatabaseConnection): Promise<void> {
    return Promise.resolve();
  }

  public destroy(): Promise<void> {
    return Promise.resolve();
  }
}

export class TreeQLiteDialect implements Dialect {
  public constructor(private readonly config: TqlHttpClientConfig) {}

  public createDriver(): Driver {
    return new TreeQLiteDriver(this.config);
  }

  public createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }

  public createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  public createIntrospector(_db: Kysely<any>): DatabaseIntrospector {
    throw new Error(`TreeQLiteDialect.createIntrospector not implemented.`);
  }
}
