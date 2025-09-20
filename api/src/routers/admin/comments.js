import express from "express";
import knex from "../../db.mjs";
import { authenticateToken, requireRole } from "../../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken, requireRole(["admin", "moderator"]));

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "created_at-desc",
      status,
    } = req.query;

    const query = knex("comments as c")
      .join("users as u", "c.user_id", "u.id")
      .leftJoin("user_posts as up", function () {
        this.on("up.id", "=", "c.commentable_id").andOn(
          "c.commentable_type",
          "=",
          knex.raw("'post'")
        );
      })
      .leftJoin("attraction_posts as ap", function () {
        this.on("ap.id", "=", "c.commentable_id").andOn(
          "c.commentable_type",
          "=",
          knex.raw("'attraction'")
        );
      })
      .select(
        "c.*",
        "u.username",
        "u.first_name",
        "u.last_name",
        knex.raw("COALESCE(up.title, ap.title) as parent_title")
      );

    const countQuery = knex("comments");

    if (status) {
      query.where("c.status", status);
      countQuery.where("c.status", status);
    }

    const [sortField, sortOrder] = sort.split("-");
    if (
      ["content", "status", "created_at"].includes(sortField) &&
      ["asc", "desc"].includes(sortOrder)
    ) {
      query.orderBy(`c.${sortField}`, sortOrder);
    }

    const totalResult = await countQuery.count("* as count").first();
    const total = parseInt(totalResult.count);

    const offset = (page - 1) * limit;
    const comments = await query.limit(limit).offset(offset);

    res.json({
      message: "All comments retrieved successfully.",
      data: comments,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("Error fetching all comments:", error);
    res.status(500).json({
      error: "Failed to retrieve comments.",
      message: "We encountered an error while loading comments.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, content } = req.body;

    const updatePayload = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updatePayload.status = status;
    }
    if (content) {
      updatePayload.content = content;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        error: "Invalid update data.",
        message: "Please provide a valid 'status' or 'content'.",
      });
    }

    const [updatedComment] = await knex("comments")
      .where({ id })
      .update(updatePayload)
      .returning("*");

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    res.json({
      message: "Comment updated successfully.",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await knex("comments").where({ id }).del();

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Comment not found." });
    }

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment." });
  }
});

export default router;