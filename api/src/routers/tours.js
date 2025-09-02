import express from "express";
import knex from "../database_client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { search, sort, page, limit } = req.query;
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limit;

    let query = knex("tours");

    if (search) {
      query = query
        .where("name", "ilike", `%${search}%`)
        .orWhere("destination", "ilike", `%${search}%`);
    }

    if (sort) {
      const [field, order] = sort.split("-");
      const sortMapping = {
        price: "price_usd",
        duration: "duration_days",
        name: "name",
        destination: "destination",
        rating: "average_rating",
      };
      const column = sortMapping[field];
      if (column && (order === "asc" || order === "desc")) {
        query = query.orderBy(column, order);
      }
    } else {
      query = query.orderBy("name", "asc");
    }

    // Clear order for count query to avoid GROUP BY issues
    const totalResult = await query
      .clone()
      .clearOrder()
      .count("* as count")
      .first();
    const totalItems = parseInt(totalResult.count, 10);
    const tours = await query.offset(offset).limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      tours,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default router;
