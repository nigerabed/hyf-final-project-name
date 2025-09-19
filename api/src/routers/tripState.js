import express from "express";
import knex from "../db.mjs";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const { tripId } = req.params;
  try {
    const state = await knex("trip_states").where({ trip_id: tripId }).first();
    if (!state) {
      return res.status(404).json({ error: "Trip state not found." });
    }
    res.json({ data: state });
  } catch (error) {
    res.status(500).json({ error: "Failed to get trip state." });
  }
});

router.put("/", async (req, res) => {
  const { tripId } = req.params;
  const { phase } = req.body;
  const userId = req.user.id || req.user.sub;

  if (!phase) {
    return res.status(400).json({ error: "A 'phase' is required." });
  }

  try {
    const trip = await knex("travel_plans").where({ id: tripId }).first();
    if (trip.owner_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the trip owner can change the planning phase." });
    }

    const [newState] = await knex("trip_states")
      .where({ trip_id: tripId })
      .update({
        planning_phase: phase,
        updated_at: new Date(),
      })
      .returning("*");

    res.json({ message: "Trip state updated.", data: newState });
  } catch (error) {
    res.status(500).json({ error: "Failed to update trip state." });
  }
});

export default router;
