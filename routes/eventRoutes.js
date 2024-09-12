const express = require("express");
const { Event, Operator } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const { Op } = require('sequelize');

// Helper function to check for overlapping events
const isOverlapping = async (operatorId, start, end, eventId = null) => {
  const overlappingEvents = await Event.findAll({
    where: {
      operatorId,
      start: { [Op.lt]: end }, // Event starts before the new event's end
      end: { [Op.gt]: start }, // Event ends after the new event's start
      ...(eventId && { id: { [Op.ne]: eventId } }), // Exclude the current event being updated
    },
  });
  return overlappingEvents.length > 0;
};

// Create a new event
router.post(
  "/events",
  authenticate,
  authorize(["Clerk", "OLMC", "APS"]),
  async (req, res) => {
    const { operatorId, title, start, end, shift, job } = req.body;

    try {
      console.log("Request body:", req.body); // Log the incoming request
      const operator = await Operator.findByPk(operatorId);
      if (!operator) {
        return res.status(404).send({ error: "Operator not found" });
      }

      // Check if the event overlaps with existing events
      const overlapping = await isOverlapping(operatorId, start, end);
      if (overlapping) {
        return res.status(400).send({
          error: "Operator already has an event scheduled during this time.",
        });
      }

      const event = await Event.create({
        operatorId,
        title,
        start,
        end,
        shift,
        job,
        published: false,
      });
      res.status(201).send(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).send({ error: "Failed to create event" });
    }
  }
);

// Update an event by ID
router.put(
  "/events/:id",
  authenticate,
  authorize(["Clerk", "OLMC", "APS"]),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

      const { start, end, operatorId } = req.body;

      // Check if the updated event overlaps with other events
      const overlapping = await isOverlapping(operatorId, start, end, event.id);
      if (overlapping) {
        return res.status(400).send({
          error: "Operator already has an event scheduled during this time.",
        });
      }

      await event.update(req.body); // Update the event with new data

      res.send(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(400).send({ error: "Failed to update event" });
    }
  }
);

// Publish an event
router.put(
  "/events/:id/publish",
  authenticate,
  authorize(["Clerk", "OLMC", "APS"]),
  async (req, res) => {
    console.log("Request received to publish event:", req.params.id);
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

      await event.update({ published: true }); // Ensure published is set to true

      res.send(event);
    } catch (error) {
      console.error("Error publishing event:", error);
      res.status(400).send({ error: "Failed to publish event" });
    }
  }
);


// Fetch all events
router.get("/events", authenticate, async (req, res) => {
  try {
    const events = await Event.findAll({ include: Operator });
    res.send(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send({ error: "Error fetching events" });
  }
});

// Get all events from a specific operator
router.get("/events/operator/:id", authenticate, async (req, res) => {
  const operatorId = req.params.id;
  try {
    const events = await Event.findAll({ where: { operatorId } });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Server error");
  }
});

// Get a specific event by ID
router.get("/events/:id", authenticate, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, { include: Operator });
    if (!event) {
      return res.status(404).send({ error: "Event not found" });
    }
    res.send(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).send({ error: "Server error fetching event" });
  }
});

// Delete an event by ID
router.delete(
  "/events/:id",
  authenticate,
  authorize(["Clerk", "OLMC", "APS"]),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).send({ error: "Event not found" });
      }

      await event.destroy(); // Delete the event from the database

      res.send({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).send({ error: "Server error while deleting event" });
    }
  }
);

module.exports = router;
