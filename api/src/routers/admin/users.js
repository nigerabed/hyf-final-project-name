import express from "express";
import knex from "../../db.mjs";
import { authenticateToken, requireRole } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validation.js";
import { adminUserUpdateSchema } from "../../validation/schemas.js";
import { adminCreateUserSchema } from "../../validation/schemas.js";
import bcrypt from "bcryptjs";

const adminUsersRouter = express.Router();
adminUsersRouter.use(authenticateToken, requireRole(["admin"]));

adminUsersRouter.get("/", async (req, res) => {
  try {
    const {
      search = "",
      sort = "created_at-desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = knex("users").select(
      "id",
      "first_name",
      "last_name",
      "email",
      "username",
      "mobile",
      "role",
      "is_active",
      "created_at"
    );
    const countQuery = knex("users");

    if (search) {
      const searchTerm = `%${search}%`;
      const searchFilter = (builder) =>
        builder
          .where("first_name", "ilike", searchTerm)
          .orWhere("last_name", "ilike", searchTerm)
          .orWhere("email", "ilike", searchTerm)
          .orWhere("username", "ilike", searchTerm);
      query.andWhere(searchFilter);
      countQuery.andWhere(searchFilter);
    }

    const [sortField, sortOrder] = sort.split("-");
    if (
      ["username", "email", "created_at"].includes(sortField) &&
      ["asc", "desc"].includes(sortOrder)
    ) {
      query.orderBy(sortField, sortOrder);
    }

    const offset = (page - 1) * limit;
    query.limit(limit).offset(offset);

    const users = await query;
    const totalResult = await countQuery.count("* as count").first();
    const total = parseInt(totalResult.count);

    res.json({
      message: "Users list retrieved successfully.",
      data: users,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("Admin error fetching users:", error);
    res.status(500).json({ error: "Failed to retrieve users." });
  }
});

adminUsersRouter.put(
  "/:id",
  validateRequest(adminUserUpdateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [updatedUser] = await knex("users")
        .where({ id })
        .update(req.validatedData)
        .returning("*");
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found." });
      }
      res
        .status(200)
        .json({
          message: "User updated successfully by admin.",
          data: updatedUser,
        });
    } catch (error) {
      console.error("Admin error updating user:", error);
      res.status(500).json({ error: "Failed to update user." });
    }
  }
);

// Admin: create a new user
adminUsersRouter.post(
  "/",
  validateRequest(adminCreateUserSchema),
  async (req, res) => {
    try {
      const { first_name, last_name, email, username, mobile, password, role } =
        req.validatedData;

      // Check duplicates
      const existing = await knex("users")
        .where(function () {
          this.where({ email }).orWhere({ username }).orWhere({ mobile });
        })
        .first();
      if (existing) {
        return res.status(400).json({ error: "User already exists." });
      }

      const insert = {
        first_name,
        last_name,
        email,
        username,
        mobile,
        role: role || "user",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      if (password) {
        const saltRounds = 12;
        insert.password = await bcrypt.hash(password, saltRounds);
      } else {
        // If admin doesn't provide password, set a random placeholder and require password reset by user flow
        insert.password = ""; // consider sending reset link in production
      }

      const [created] = await knex("users").insert(insert).returning(["id", "first_name", "last_name", "email", "username", "mobile", "role", "is_active", "created_at"]);

      res.status(201).json({ message: "User created", data: created });
    } catch (error) {
      console.error("Admin create user error:", error);
      res.status(500).json({ error: "Failed to create user." });
    }
  }
);

adminUsersRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const count = await knex("users").where({ id }).del();

    if (count === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User and all their content deleted successfully." });
  } catch (error) {
    console.error("Admin error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

export default adminUsersRouter;
