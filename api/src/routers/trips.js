import express from "express";
import knex from "../db.mjs";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";
import { validateRequest } from "../middleware/validation.js";

import tripDestinationsRouter from "./tripDestinations.js";
import tripAccommodationsRouter from "./tripAccommodations.js";
import tripFlightsRouter from "./tripFlights.js";
import aiPlannerRouter from "./aiPlanner.js";
import shortlistRouter from "./shortlist.js";
import itineraryRouter from "./itinerary.js";
import chatRouter from "./chat.js";
import invitationsRouter from "./invitations.js";

const router = express.Router();
router.use(authenticateToken);

const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required."),
  description: z.string().optional(),
  start_date: z.string().optional(),
  duration_days: z.number().int().optional(),
  destinations: z
    .array(
      z.object({
        city_name: z.string().min(1),
        country_name: z.string().min(1),
        stop_order: z.number().int(),
        duration_days: z.number().int(),
      })
    )
    .optional(),
});

const checkPermissions = async (req, res, next) => {
  const { tripId } = req.params;
  const userId = req.user.id || req.user.sub;
  const trip = await knex("travel_plans").where({ id: tripId }).first();
  if (!trip) {
    return res.status(404).json({ error: "Trip not found." });
  }
  const isOwner = trip.owner_id === userId;
  const isCollaborator = await knex("trip_collaborators")
    .where({ trip_id: tripId, user_id: userId })
    .first();
  if (!isOwner && !isCollaborator) {
    return res
      .status(403)
      .json({ error: "You do not have permission for this trip." });
  }
  req.trip = trip;
  next();
};

router.get("/", async (req, res) => {
  const userId = req.user.id || req.user.sub;
  try {
    const trips = await knex("travel_plans")
      .select("id", "name", "description", "cover_image_url")
      .where({ owner_id: userId, plan_type: "user" });
    const collaboratorTrips = await knex("trip_collaborators as tc")
      .join("travel_plans as tp", "tc.trip_id", "tp.id")
      .where("tc.user_id", userId)
      .andWhere("tp.plan_type", "user")
      .select("tp.id", "tp.name", "tp.description", "tp.cover_image_url");

    const allTrips = [...trips, ...collaboratorTrips];
    res.json({ message: "Trips retrieved successfully.", data: allTrips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Failed to retrieve trips." });
  }
});

router.get("/:tripId", checkPermissions, async (req, res) => {
  const { trip } = req;
  try {
    const destinations = await knex("travel_plan_destinations")
      .where({ travel_plan_id: trip.id })
      .orderBy("stop_order", "asc");

    const collaborators = await knex("trip_collaborators as tc")
      .join("users as u", "tc.user_id", "u.id")
      .where("tc.trip_id", trip.id)
      .select("u.id", "u.first_name", "u.last_name", "u.profile_image");

    const owner = await knex("users")
      .where({ id: trip.owner_id })
      .select("id", "first_name", "last_name", "profile_image")
      .first();

    const accommodations = await knex("travel_plan_accommodations")
      .where({ travel_plan_id: trip.id })
      .orderBy("name", "asc");

    const flights = await knex("travel_plan_flights")
      .where({ travel_plan_id: trip.id })
      .orderBy("airline", "asc");

    res.json({
      message: "Trip retrieved successfully.",
      data: {
        ...trip,
        owner,
        destinations,
        collaborators,
        accommodations,
        flights,
      },
    });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ error: "Failed to retrieve trip details." });
  }
});

router.post("/", validateRequest(createTripSchema), async (req, res) => {
  const { name, description, start_date, duration_days } = req.validatedData;
  const userId = req.user.id || req.user.sub;
  try {
    const [newTrip] = await knex("travel_plans")
      .insert({
        name,
        description,
        start_date,
        duration_days,
        owner_id: userId,
        plan_type: "user",
      })
      .returning("*");
    res.status(201).json({
      message: "Trip created successfully.",
      data: newTrip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Failed to create trip." });
  }
});

router.post("/build", validateRequest(createTripSchema), async (req, res) => {
  const { name, description, destinations } = req.validatedData;
  const userId = req.user.id || req.user.sub;

  if (!destinations || destinations.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one destination is required." });
  }

  try {
    await knex.transaction(async (trx) => {
      const [newTrip] = await trx("travel_plans")
        .insert({
          name,
          description,
          owner_id: userId,
          plan_type: "user",
        })
        .returning("*");

      const destinationData = destinations.map((d) => ({
        travel_plan_id: newTrip.id,
        city_name: d.city_name,
        country_name: d.country_name,
        stop_order: d.stop_order,
        duration_days: d.duration_days,
      }));

      await trx("travel_plan_destinations").insert(destinationData);

      res.status(201).json({
        message: "Trip created and built successfully.",
        data: newTrip,
      });
    });
  } catch (error) {
    console.error("Error building trip:", error);
    res.status(500).json({ error: "Failed to build trip." });
  }
});

router.put("/:tripId", checkPermissions, async (req, res) => {
  const { tripId } = req.params;
  const { name, description } = req.body;
  try {
    const [updatedTrip] = await knex("travel_plans")
      .where({ id: tripId })
      .update({ name, description })
      .returning("*");
    res.json({
      message: "Trip updated successfully.",
      data: updatedTrip,
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Failed to update trip." });
  }
});

router.delete("/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id || req.user.sub;
  try {
    const trip = await knex("travel_plans")
      .where({ id: tripId, owner_id: userId })
      .first();
    if (!trip) {
      return res
        .status(404)
        .json({ error: "Trip not found or you are not the owner." });
    }
    await knex.transaction(async (trx) => {
      await trx("travel_plans").where({ id: tripId }).del();
    });
    res.status(200).json({ message: "Trip deleted successfully." });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Failed to delete trip." });
  }
});

router.use("/:tripId/destinations", checkPermissions, tripDestinationsRouter);
router.use(
  "/:tripId/accommodations",
  checkPermissions,
  tripAccommodationsRouter
);
router.use("/:tripId/flights", checkPermissions, tripFlightsRouter);
router.use("/:tripId/ai-suggestions", checkPermissions, aiPlannerRouter);
router.use("/:tripId/shortlist", checkPermissions, shortlistRouter);
router.use("/:tripId/itinerary", checkPermissions, itineraryRouter);
router.use("/:tripId/chat", checkPermissions, chatRouter);
router.use("/:tripId/invite", checkPermissions, invitationsRouter);

export default router;
