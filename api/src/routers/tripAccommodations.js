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
  req.trip = trip;
  next();
};

// POST a new accommodation to a destination
router.post("/", checkTripPermissions, async (req, res) => {
  const { tripId } = req.params;
  const { destination_id, name, type, rating } = req.body;

  if (!destination_id || !name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const [newAccommodation] = await knex("travel_plan_accommodations")
      .insert({
        travel_plan_id: tripId,
        destination_id,
        name,
        type,
        rating,
      })
      .returning("*");
    res.status(201).json({
      message: "Accommodation added successfully.",
      data: newAccommodation,
    });
  } catch (error) {
    console.error("Error adding accommodation:", error);
    res.status(500).json({ error: "Failed to add accommodation." });
  }
});

// DELETE an accommodation
router.delete("/:accommodationId", checkTripPermissions, async (req, res) => {
  const { tripId, accommodationId } = req.params;

  try {
    const deleteCount = await knex("travel_plan_accommodations")
      .where({ id: accommodationId, travel_plan_id: tripId })
      .del();
    if (deleteCount === 0) {
      return res.status(404).json({ error: "Accommodation not found." });
    }
    res.status(200).json({ message: "Accommodation removed successfully." });
  } catch (error) {
    console.error("Error removing accommodation:", error);
    res.status(500).json({ error: "Failed to remove accommodation." });
  }
});

export default router;
