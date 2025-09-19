import express from "express";
import knex from "../db.mjs";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });
router.use(authenticateToken);

// Helper to check ownership or collaboration of the parent trip
const checkTripPermissions = async (req, res, next) => {
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
  req.trip = trip; // Pass the trip to the next handler
  next();
};

// POST a new destination to a trip
router.post("/", checkTripPermissions, async (req, res) => {
  const { tripId } = req.params;
  const { city_name, country_name, duration_days, stop_order } = req.body;

  if (!city_name || !country_name || !duration_days || !stop_order) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const [newDestination] = await knex("travel_plan_destinations")
      .insert({
        travel_plan_id: tripId,
        city_name,
        country_name,
        duration_days,
        stop_order,
      })
      .returning("*");
    res.status(201).json({
      message: "Destination added successfully.",
      data: newDestination,
    });
  } catch (error) {
    console.error("Error adding destination:", error);
    res.status(500).json({ error: "Failed to add destination." });
  }
});

// DELETE a destination from a trip
router.delete("/:destinationId", checkTripPermissions, async (req, res) => {
  const { tripId, destinationId } = req.params;

  try {
    const deleteCount = await knex("travel_plan_destinations")
      .where({ id: destinationId, travel_plan_id: tripId })
      .del();

    if (deleteCount === 0) {
      return res.status(404).json({ error: "Destination not found." });
    }

    res.status(200).json({ message: "Destination removed successfully." });
  } catch (error) {
    console.error("Error removing destination:", error);
    res.status(500).json({ error: "Failed to remove destination." });
  }
});

export default router;
