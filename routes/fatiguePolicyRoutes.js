const express = require("express");
const router = express.Router();
const { FatiguePolicy } = require("../models");
const { authenticate, checkAdmin } = require("../middleware/auth"); // Import authenticate and checkAdmin

// Fetch the current fatigue policy
router.get("/config/fatigue-policy", async (req, res) => {
  try {
    const policy = await FatiguePolicy.findOne(); // Assuming there's only one policy record
    if (!policy) {
      return res.status(404).json({ message: "Fatigue policy not found" });
    }
    res.json(policy);
  } catch (error) {
    console.error("Server error fetching fatigue policy:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update the fatigue policy (Admin, OLMC, APS Only)
router.put("/config/fatigue-policy", authenticate, checkAdmin, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // Debugging: Check if user is authenticated

    const {
      maxConsecutiveShifts,
      minRestAfterMaxShifts,
      maxConsecutiveNightShifts,
      minRestAfterNightShifts,
      minRestAfter3Shifts,
      shiftLengthHours,
      maxHoursInDay,
    } = req.body;

    console.log("Received data for updating fatigue policy:", req.body);

    let policy = await FatiguePolicy.findOne(); // Assuming there's only one policy record

    if (!policy) {
      // If no policy exists, create a new one
      policy = await FatiguePolicy.create({
        maxConsecutiveShifts,
        minRestAfterMaxShifts,
        maxConsecutiveNightShifts,
        minRestAfterNightShifts,
        minRestAfter3Shifts,
        shiftLengthHours,
        maxHoursInDay,
      });
    } else {
      // Update the existing policy
      policy.maxConsecutiveShifts = maxConsecutiveShifts;
      policy.minRestAfterMaxShifts = minRestAfterMaxShifts;
      policy.maxConsecutiveNightShifts = maxConsecutiveNightShifts;
      policy.minRestAfterNightShifts = minRestAfterNightShifts;
      policy.minRestAfter3Shifts = minRestAfter3Shifts;
      policy.shiftLengthHours = shiftLengthHours;
      policy.maxHoursInDay = maxHoursInDay;

      await policy.save();
    }

    res.json({ message: "Fatigue policy updated successfully", policy });
  } catch (error) {
    console.error("Server error updating fatigue policy:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
