import express from "express";
import knex from "../db.mjs";
import crypto from "crypto";
import { authenticateToken as authenticate } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id || req.user.sub;

  try {
    const trip = await knex("travel_plans").where({ id: tripId }).first();

    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.owner_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the trip owner can create invitation links." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await knex("trip_invitations").insert({
      trip_id: tripId,
      created_by_user_id: userId,
      token: token,
      expires_at: expiresAt,
    });

    const shareableLink = `${process.env.FRONTEND_URL}/join-trip?token=${token}`;

    res.status(201).json({ shareableLink });
  } catch (error) {
    console.error("Error creating invitation link:", error);
    res.status(500).json({ error: "Failed to create invitation link." });
  }
});

router.post("/accept", authenticate, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id || req.user.sub;

  if (!token) {
    return res.status(400).json({ error: "Invitation token is required." });
  }

  try {
    const userExists = await knex("users").where({ id: userId }).first();
    if (!userExists) {
      return res
        .status(403)
        .json({ error: "User account not found. Cannot accept invitation." });
    }

    let tripIdForRedirect;

    await knex.transaction(async (trx) => {
      const invitation = await trx("trip_invitations")
        .where({ token })
        .andWhere("expires_at", ">", new Date())
        .first();

      if (!invitation) {
        throw new Error("Invitation not found or has expired.");
      }

      tripIdForRedirect = invitation.trip_id;

      const isOwner = await trx("travel_plans")
        .where({ id: invitation.trip_id, owner_id: userId })
        .first();

      const isCollaborator = await trx("trip_collaborators")
        .where({ trip_id: invitation.trip_id, user_id: userId })
        .first();

      if (isOwner || isCollaborator) {
        await trx("trip_invitations").where({ token }).del();
        throw new Error("You are already a member of this trip.");
      }

      await trx("trip_collaborators").insert({
        trip_id: invitation.trip_id,
        user_id: userId,
        permission_level: "editor",
      });

      await trx("trip_invitations").where({ token }).del();
    });

    res.status(200).json({
      message: "You have successfully joined the trip!",
      data: { tripId: tripIdForRedirect },
    });
  } catch (error) {
    if (error.message === "Invitation not found or has expired.") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "You are already a member of this trip.") {
      const invitation = await knex("trip_invitations")
        .where({ token })
        .first();
      const tripId = invitation ? invitation.trip_id : null;
      return res.status(200).json({ message: error.message, data: { tripId } });
    }
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation." });
  }
});

export default router;
