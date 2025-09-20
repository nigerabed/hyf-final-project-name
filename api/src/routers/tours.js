import express from "express";
import knex from "../db.mjs";
import reviewsRouter from "./reviews.js";

const router = express.Router();

// GET /api/tours - Get all tours with real-time availability
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      sort = "name-asc",
      page = 1,
      limit = 9,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      currency,
    } = req.query;

    const bookedSeatsSubquery = knex("tour_bookings")
      .select("tour_id")
      .sum("num_travelers as booked")
      .groupBy("tour_id")
      .as("bs");

    let query = knex("travel_plans as tp")
      .select(
        "tp.id",
        "tp.name",
        "tp.description",
        "tp.duration_days",
        "tp.price_minor",
        "tp.currency_code",
        "tp.capacity",
        "tp.cover_image_url",
        "tp.rating",
        "tp.rating_count",
        "c.symbol as currency_symbol",
        knex.raw("tp.capacity - COALESCE(bs.booked, 0) as available_seats")
      )
      .leftJoin("currencies as c", "tp.currency_code", "c.code")
      .leftJoin(bookedSeatsSubquery, "tp.id", "bs.tour_id")
      .where("tp.plan_type", "tour");

    if (search) {
      query = query.where(function () {
        this.where("tp.name", "ilike", `%${search}%`)
          .orWhere("tp.description", "ilike", `%${search}%`)
          .orWhereExists(function () {
            this.select(1)
              .from("travel_plan_destinations as tpd")
              .whereRaw("tpd.travel_plan_id = tp.id")
              .andWhere(function () {
                this.where("tpd.city_name", "ilike", `%${search}%`).orWhere(
                  "tpd.country_name",
                  "ilike",
                  `%${search}%`
                );
              });
          });
      });
    }

    if (minPrice !== undefined) {
      query = query.where("tp.price_minor", ">=", parseInt(minPrice));
    }
    if (maxPrice !== undefined) {
      query = query.where("tp.price_minor", "<=", parseInt(maxPrice));
    }
    if (minDuration !== undefined) {
      query = query.where("tp.duration_days", ">=", parseInt(minDuration));
    }
    if (maxDuration !== undefined) {
      query = query.where("tp.duration_days", "<=", parseInt(maxDuration));
    }
    if (currency) {
      query = query.where("tp.currency_code", currency);
    }

    const countQuery = query
      .clone()
      .clearSelect()
      .clearOrder()
      .count("* as count")
      .first();
    const totalItems = await countQuery;
    const total = parseInt(totalItems.count);

    const [sortField, sortOrder] = sort.split("-");
    const validSortFields = ["name", "price_minor", "duration_days", "rating"];
    if (
      validSortFields.includes(sortField) &&
      ["asc", "desc"].includes(sortOrder)
    ) {
      query = query.orderBy(`tp.${sortField}`, sortOrder);
    } else {
      query = query.orderBy("tp.name", "asc");
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.offset(offset).limit(parseInt(limit));
    const tours = await query;

    res.json({
      totalItems: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      tours: tours,
    });
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch tours",
    });
  }
});

// GET /api/tours/:id - Get a specific tour by ID with real-time availability
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await knex("travel_plans as tp")
      .select(
        "tp.*",
        "c.symbol as currency_symbol",
        "c.name as currency_name",
        knex.raw(
          "(SELECT SUM(num_travelers) FROM tour_bookings WHERE tour_id = tp.id) as booked_seats"
        )
      )
      .leftJoin("currencies as c", "tp.currency_code", "c.code")
      .where("tp.id", id)
      .where("tp.plan_type", "tour")
      .first();

    if (!tour) {
      return res.status(404).json({
        error: "Tour not found",
        message: "The requested tour does not exist",
      });
    }

    const available_seats = tour.capacity - (tour.booked_seats || 0);

    const [destinations, accommodations, flights, reviews] = await Promise.all([
      knex("travel_plan_destinations")
        .where("travel_plan_id", id)
        .orderBy("stop_order", "asc"),
      knex("travel_plan_accommodations").where("travel_plan_id", id),
      knex("travel_plan_flights").where("travel_plan_id", id),
      knex("tour_reviews as tr")
        .select("tr.*", "u.first_name", "u.last_name", "u.profile_image")
        .leftJoin("users as u", "tr.user_id", "u.id")
        .where("tr.tour_id", id)
        .orderBy("tr.created_at", "desc"),
    ]);

    res.json({
      ...tour,
      available_seats,
      destinations,
      accommodations,
      flights,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch tour details",
    });
  }
});

// POST /api/tours and other routes (PUT, DELETE) remain unchanged
// ... (rest of your file)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      duration_days,
      price_minor,
      currency_code,
      capacity,
      cover_image_url,
      destinations,
    } = req.body;

    if (
      !name ||
      !description ||
      !duration_days ||
      !price_minor ||
      !currency_code ||
      !capacity
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message:
          "Name, description, duration_days, price_minor, currency_code, and capacity are required",
      });
    }

    const currency = await knex("currencies")
      .where("code", currency_code)
      .first();
    if (!currency) {
      return res.status(400).json({
        error: "Invalid currency",
        message: "The specified currency code does not exist",
      });
    }

    await knex.transaction(async (trx) => {
      const [tour] = await trx("travel_plans")
        .insert({
          name,
          description,
          start_date: start_date ? new Date(start_date) : null,
          duration_days,
          price_minor,
          currency_code,
          capacity,
          cover_image_url,
          plan_type: "tour",
        })
        .returning("*");

      if (
        destinations &&
        Array.isArray(destinations) &&
        destinations.length > 0
      ) {
        const destinationData = destinations.map((dest, index) => ({
          travel_plan_id: tour.id,
          city_name: dest.city_name,
          country_name: dest.country_name,
          stop_order: index + 1,
          duration_days:
            dest.duration_days ||
            Math.ceil(duration_days / destinations.length),
        }));

        await trx("travel_plan_destinations").insert(destinationData);
      }

      const newTour = await trx("travel_plans as tp")
        .select("tp.*", "c.symbol as currency_symbol")
        .leftJoin("currencies as c", "tp.currency_code", "c.code")
        .where("tp.id", tour.id)
        .first();

      res.status(201).json({
        message: "Tour created successfully",
        tour: {
          id: newTour.id,
          name: newTour.name,
          description: newTour.description,
          price_minor: newTour.price_minor,
          duration_days: newTour.duration_days,
          cover_image_url: newTour.cover_image_url,
          rating: newTour.rating,
          currency_code: newTour.currency_code,
          currency_symbol: newTour.currency_symbol,
          capacity: newTour.capacity,
          available_seats: newTour.capacity, // Initially, all seats are available
        },
      });
    });
  } catch (error) {
    console.error("Error creating tour:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create tour",
      });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      start_date,
      duration_days,
      price_minor,
      currency_code,
      capacity,
      cover_image_url,
      destinations,
    } = req.body;

    const existingTour = await knex("travel_plans")
      .where({ id, plan_type: "tour" })
      .first();

    if (!existingTour) {
      return res.status(404).json({
        error: "Tour not found",
        message: "The requested tour does not exist",
      });
    }

    if (currency_code) {
      const currency = await knex("currencies")
        .where("code", currency_code)
        .first();
      if (!currency) {
        return res.status(400).json({
          error: "Invalid currency",
          message: "The specified currency code does not exist",
        });
      }
    }

    await knex.transaction(async (trx) => {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (start_date !== undefined)
        updateData.start_date = start_date ? new Date(start_date) : null;
      if (duration_days !== undefined) updateData.duration_days = duration_days;
      if (price_minor !== undefined) updateData.price_minor = price_minor;
      if (currency_code !== undefined) updateData.currency_code = currency_code;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (cover_image_url !== undefined)
        updateData.cover_image_url = cover_image_url;

      if (Object.keys(updateData).length > 0) {
        await trx("travel_plans").where("id", id).update(updateData);
      }

      if (destinations && Array.isArray(destinations)) {
        await trx("travel_plan_destinations").where("travel_plan_id", id).del();
        if (destinations.length > 0) {
          const destinationData = destinations.map((dest, index) => ({
            travel_plan_id: id,
            city_name: dest.city_name,
            country_name: dest.country_name,
            stop_order: index + 1,
            duration_days:
              dest.duration_days ||
              Math.ceil(
                (duration_days || existingTour.duration_days) /
                  destinations.length
              ),
          }));
          await trx("travel_plan_destinations").insert(destinationData);
        }
      }

      const updatedTourResult = await trx("travel_plans as tp")
        .select(
          "tp.*",
          "c.symbol as currency_symbol",
          knex.raw(
            "(SELECT SUM(num_travelers) FROM tour_bookings WHERE tour_id = tp.id) as booked_seats"
          )
        )
        .leftJoin("currencies as c", "tp.currency_code", "c.code")
        .where("tp.id", id)
        .first();

      res.json({
        message: "Tour updated successfully",
        tour: {
          ...updatedTourResult,
          available_seats:
            updatedTourResult.capacity - (updatedTourResult.booked_seats || 0),
        },
      });
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update tour",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingTour = await knex("travel_plans")
      .where({ id, plan_type: "tour" })
      .first();

    if (!existingTour) {
      return res.status(404).json({
        error: "Tour not found",
        message: "The requested tour does not exist",
      });
    }

    const deletedCount = await knex("travel_plans").where({ id }).del();

    if (deletedCount > 0) {
      res.json({
        message: "Tour and all related data deleted successfully.",
      });
    } else {
      res.status(404).json({ error: "Tour not found during deletion." });
    }
  } catch (error) {
    console.error("Error deleting tour:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete tour",
    });
  }
});

router.use("/:id/reviews", reviewsRouter);

export default router;
