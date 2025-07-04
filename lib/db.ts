import {PrismaClient} from "@prisma/client";
import {PrismaLibSQL} from "@prisma/adapter-libsql";
import {createClient} from "@libsql/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({adapter});
  } else {
    return new PrismaClient();
  }
}

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
