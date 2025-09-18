import express from "express";
import knex from "../db.mjs";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";
import { validateRequest } from "../middleware/validation.js";

const router = express.Router();

router.use(authenticateToken);

const tourBookingSchema = z.object({
  tour_id: z.string().uuid("A valid tour ID is required."),
  num_travelers: z
    .number()
    .int()
    .min(1, "You must book for at least one traveler."),
});

const customTripBookingSchema = z.object({
  trip_id: z.string().uuid("A valid trip ID is required."),
  num_travelers: z
    .number()
    .int()
    .min(1, "You must book for at least one traveler."),
});

async function resolveDbUserId(dbOrTrx, user) {
  if (!user) return null;
  const candidateId = user.id || user.sub;
  const username = user.username;
  const email = user.email;
  const q = dbOrTrx("users").where(function () {
    if (candidateId) this.where("id", candidateId);
    if (username) this.orWhere("username", username);
    if (email) this.orWhere("email", email);
  });
  const row = await q.first();
  return row ? row.id : null;
}

router.post("/tour", validateRequest(tourBookingSchema), async (req, res) => {
  const { tour_id, num_travelers } = req.validatedData;
  try {
    let newBooking;
    await knex.transaction(async (trx) => {
      const dbUserId = await resolveDbUserId(trx, req.user);
      if (!dbUserId) {
        return res.status(401).json({ error: "Authenticated user not found." });
      }
      const userId = dbUserId;
      const tour = await trx("travel_plans")
        .where({ id: tour_id, plan_type: "tour" })
        .forUpdate()
        .first();
      if (!tour) {
        return res
          .status(404)
          .json({ error: "The requested tour does not exist." });
      }
      const bookings = await trx("tour_bookings")
        .where({ tour_id })
        .whereRaw("COALESCE(LOWER(booking_status), '') != 'cancelled'");
      const bookedSpots = bookings.reduce(
        (sum, booking) => sum + booking.num_travelers,
        0
      );
      if (bookedSpots + num_travelers > tour.capacity) {
        return res.status(409).json({
          error: "Sorry, there are not enough available spots on this tour.",
        });
      }
      const totalPrice = tour.price_minor * num_travelers;
      const existing = await trx("tour_bookings")
        .where({ tour_id, user_id: userId })
        .first();
      const existingStatus = existing
        ? String(existing.booking_status || "").toLowerCase()
        : "";
      if (existing && !existingStatus.includes("cancel")) {
        return res
          .status(409)
          .json({ error: "You have already booked this tour." });
      }
      if (existing && existingStatus.includes("cancel")) {
        const nowValue =
          trx && trx.client && trx.client.fn && trx.client.fn.now
            ? trx.client.fn.now()
            : new Date();
        const [updated] = await trx("tour_bookings")
          .where({ id: existing.id })
          .update({
            num_travelers,
            total_price_minor: totalPrice,
            booking_status: "confirmed",
            booked_at: nowValue,
          })
          .returning("*");
        newBooking = updated;
      } else {
        [newBooking] = await trx("tour_bookings")
          .insert({
            user_id: userId,
            tour_id,
            num_travelers,
            total_price_minor: totalPrice,
          })
          .returning("*");
      }
    });
    if (newBooking) {
      res
        .status(201)
        .json({ message: "Tour successfully booked!", data: newBooking });
    }
  } catch (error) {
    console.error(
      "Error booking tour:",
      error && error.message,
      error && error.stack
    );
    if (!res.headersSent) {
      if (error && (error.code === "23505" || error.code === 23505)) {
        return res
          .status(409)
          .json({ error: "You have already booked this tour." });
      }
      const msg =
        error && error.message
          ? error.message
          : "An error occurred while booking the tour.";
      return res.status(500).json({ error: msg });
    }
  }
});

router.post(
  "/custom-trip",
  validateRequest(customTripBookingSchema),
  async (req, res) => {
    const { trip_id, num_travelers } = req.validatedData;
    const userId = req.user.id || req.user.sub;

    try {
      let newBooking;
      await knex.transaction(async (trx) => {
        const trip = await trx("travel_plans").where({ id: trip_id }).first();
        if (!trip) {
          return res.status(404).json({ error: "Custom trip not found." });
        }
        const isOwner = trip.owner_id === userId;
        const isCollaborator = await trx("trip_collaborators")
          .where({ trip_id, user_id: userId })
          .first();
        if (!isOwner && !isCollaborator) {
          return res
            .status(403)
            .json({ error: "You do not have permission to book this trip." });
        }

        // Calculate prices from the related tables
        const accommodations = await trx("travel_plan_accommodations")
          .where({ travel_plan_id: trip_id })
          .sum("price_minor as total_price_minor");

        const flights = await trx("travel_plan_flights")
          .where({ travel_plan_id: trip_id })
          .sum("price_minor as total_price_minor");

        const accommodationPrice = accommodations[0].total_price_minor || 0;
        const flightPrice = flights[0].total_price_minor || 0;

        const finalPrice = accommodationPrice + flightPrice * num_travelers;

        // Check if an existing custom booking exists
        const existingCustomBooking = await trx("custom_trip_bookings")
          .where({ trip_id, user_id: userId })
          .first();

        if (existingCustomBooking) {
          await trx("custom_trip_bookings")
            .where({ id: existingCustomBooking.id })
            .update({
              num_travelers,
              total_price_minor: finalPrice,
              booking_status: "confirmed",
              booked_at: new Date(),
            });
          newBooking = await trx("custom_trip_bookings")
            .where({ id: existingCustomBooking.id })
            .first();
        } else {
          [newBooking] = await trx("custom_trip_bookings")
            .insert({
              user_id: userId,
              trip_id,
              num_travelers,
              total_price_minor: finalPrice,
            })
            .returning("*");
        }
      });

      if (newBooking) {
        res.status(201).json({
          message: "Your custom trip has been successfully reserved!",
          data: newBooking,
        });
      }
    } catch (error) {
      console.error("Error booking custom trip:", error);
      if (!res.headersSent)
        res
          .status(500)
          .json({ error: "An error occurred while reserving your trip." });
    }
  }
);

router.get("/my-bookings", async (req, res) => {
  const dbUserId = await resolveDbUserId(knex, req.user);
  const userId = dbUserId || (req.user && (req.user.id || req.user.sub));
  try {
    const tourBookings = await knex("tour_bookings as tb")
      .leftJoin("travel_plans as tp", "tb.tour_id", "tp.id")
      .select(
        "tb.id as booking_id",
        "tb.tour_id as tour_id",
        "tp.name as trip_name",
        "tb.booked_at",
        "tp.plan_type",
        "tp.cover_image_url",
        "tp.price_minor",
        "tp.currency_code",
        "tb.total_price_minor",
        "tb.booking_status"
      )
      .where("tb.user_id", userId);
    const customTripBookings = await knex("custom_trip_bookings as ctb")
      .leftJoin("travel_plans as tp", "ctb.trip_id", "tp.id")
      .select(
        "ctb.id as booking_id",
        "ctb.trip_id as trip_id",
        "tp.name as trip_name",
        "ctb.booked_at",
        "tp.plan_type",
        "tp.cover_image_url",
        "tp.price_minor",
        "tp.currency_code",
        "ctb.total_price_minor",
        "ctb.booking_status"
      )
      .where("ctb.user_id", userId);
    const allBookings = [...tourBookings, ...customTripBookings].sort(
      (a, b) => new Date(b.booked_at) - new Date(a.booked_at)
    );
    res.json({
      message: "Your bookings have been retrieved successfully.",
      data: allBookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to retrieve your bookings." });
  }
});

router.patch("/:type/:id/cancel", async (req, res) => {
  const dbUserId = await resolveDbUserId(knex, req.user);
  const userId = dbUserId || (req.user && (req.user.id || req.user.sub));
  try {
    const { type, id } = req.params;
    const table =
      type === "tour"
        ? "tour_bookings"
        : type === "custom"
          ? "custom_trip_bookings"
          : null;
    if (!table) return res.status(400).json({ error: "Invalid booking type." });
    const booking = await knex(table).where({ id, user_id: userId }).first();
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.booking_status === "cancelled") {
      return res.json({ message: "Booking already cancelled.", data: booking });
    }
    const [updated] = await knex(table)
      .where({ id })
      .update({ booking_status: "cancelled" })
      .returning("*");
    res.json({ message: "Booking cancelled successfully.", data: updated });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking." });
  }
});

export default router;
