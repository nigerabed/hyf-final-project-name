import "dotenv/config";

const config = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  },
};

export default config;
