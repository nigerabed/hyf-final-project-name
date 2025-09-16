import "dotenv/config";

const config = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./src/seeds",
    },
  },
  production: {
    client: "pg",
    // Use DATABASE_URL if available (Render provides a full connection string)
    // When connecting to hosted Postgres with SSL, pass ssl config to allow
    // connections where the server certificate may not be verifiable in the
    // Node environment (e.g. some managed DB setups). This sets
    // `rejectUnauthorized: false` to avoid self-signed certificate errors.
    connection: process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
    migrations: {
      directory: "./src/migrations",
    },
    seeds: {
      directory: "./src/seeds",
    },
  },
};

export default config;
