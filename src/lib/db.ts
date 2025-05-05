import postgres from 'postgres';

let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getSqlClient() {
  if (!sqlInstance) {
    sqlInstance = postgres(process.env.DATABASE_URL!, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    });
  }
  return sqlInstance;
}


