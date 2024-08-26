const express = require('express');
const { Event, Operator } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Create a new event as unpublished
router.post('/events', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
    const { operatorId, title, start, end, shift, job } = req.body;

    try {
        const operator = await Operator.findByPk(operatorId);
        if (!operator) {
            return res.status(404).send({ error: 'Operator not found' });
        }

        const event = await Event.create({
            operatorId,
            title,
            start,
            end,
            shift,
            job,
            published: false // Save as unpublished
        });
        res.status(201).send(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(400).send({ error: 'Failed to create event' });
    }
});

// Publish an event
// Update an event by ID
router.put('/events/:id', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }

        await event.update(req.body);  // Update the event with new data

        res.send(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(400).send({ error: 'Failed to update event' });
    }
});

router.put('/events/:id/publish', authenticate, authorize(['Clerk', 'OLMC', 'APS']), async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }

        event.published = true;
        await event.save();

        res.send(event);
    } catch (error) {
        console.error('Error publishing event:', error);
        res.status(400).send({ error: 'Failed to publish event' });
    }
});


// Fetch all events
router.get('/events', authenticate, async (req, res) => {
try {
    const events = await Event.findAll({ include: Operator });
    res.send(events);
} catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send({ error: 'Error fetching events' });
}
});

module.exports = router;
