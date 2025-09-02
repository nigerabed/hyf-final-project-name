import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import knex from "./database_client.js";
import nestedRouter from "./routers/nested.js";
import authRouter from "./routers/auth.js";
import postsRouter from "./routers/posts.js";
import usersRouter from "./routers/users.js";
import toursRouter from "./routers/tours.js";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Create API router
const apiRouter = express.Router();

// Health check route
apiRouter.get("/", async (req, res) => {
  const SHOW_TABLES_QUERY =
    process.env.DB_CLIENT === "pg"
      ? "SELECT * FROM pg_catalog.pg_tables;"
      : "SHOW TABLES;";
  const tables = await knex.raw(SHOW_TABLES_QUERY);
  res.json({
    message: "API is running",
    tables,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
      tours: "/api/tours",
      nested: "/api/nested",
    },
  });
});

// Register routes
apiRouter.use("/auth", authRouter); // Authentication routes
apiRouter.use("/users", usersRouter); // User management routes
apiRouter.use("/posts", postsRouter); // CRUD routes for posts
apiRouter.use("/nested", nestedRouter); // Nested routes example
apiRouter.use("/tours", toursRouter); // Tours endpoint

// Mount API router
app.use("/api", apiRouter);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`API listening on port ${process.env.PORT}`);
});
