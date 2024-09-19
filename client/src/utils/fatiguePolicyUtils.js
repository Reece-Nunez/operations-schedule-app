import axios from "axios";
import moment from "moment-timezone";

// Exporting checkFatiguePolicy so it can be used in other components
export const checkFatiguePolicy = async (
  operatorId,
  newShiftStart,
  newShiftEnd,
  shiftType,
  allShifts,
  fatiguePolicyConfig,
  newEvent
) => {
  newShiftStart = new Date(newShiftStart);
  newShiftEnd = new Date(newShiftEnd);

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  // Fetch operator's existing events within the current work-set
  const startDate = moment(newShiftStart).startOf("week").format("YYYY-MM-DD");
  const endDate = moment(newShiftEnd).endOf("week").format("YYYY-MM-DD");

  // Fetch published events
  const publishedResponse = await axios.get(
    `/api/events/operator/${operatorId}?from=${startDate}&to=${endDate}&published=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const publishedShifts = publishedResponse.data;

  // Fetch unpublished events
  const unpublishedResponse = await axios.get(
    `/api/events/operator/${operatorId}?from=${startDate}&to=${endDate}&published=false`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const unpublishedShifts = unpublishedResponse.data;

  // Merge published, unpublished events, and shifts created in the current submission
  const combinedShifts = [
    ...publishedShifts,
    ...unpublishedShifts,
    ...allShifts,
  ];

  combinedShifts.push({
    id: null,
    operatorId,
    title: `${newEvent.shift} Shift`,
    start: newShiftStart.toISOString(),
    end: newShiftEnd.toISOString(),
    shift: newEvent.shift,
    job: newEvent.job,
  });

  // Ensure no duplicates and sort by start time
  const allShiftsUnique = [
    ...new Map(combinedShifts.map((shift) => [shift.id, shift])).values(),
  ];
  allShiftsUnique.sort((a, b) => new Date(a.start) - new Date(b.start));

  let consecutiveShifts = 0;
  let consecutiveNightShifts = 0;
  let lastShiftEnd = null;

  console.log("Existing and current shifts: ", allShiftsUnique);

  // Iterate through each shift
  for (let index = 0; index < allShiftsUnique.length; index++) {
    const shift = allShiftsUnique[index];
    const shiftStart = new Date(shift.start);
    const shiftEnd = new Date(shift.end);

    console.log(
      `Processing shift ${index}: Start - ${shiftStart}, End - ${shiftEnd}`
    );

    if (lastShiftEnd) {
      const timeGap =
        (shiftStart.getTime() - lastShiftEnd.getTime()) / (60 * 60 * 1000); // Convert gap to hours

      console.log(
        `Time gap between last shift and current shift: ${timeGap} hours`
      );

      // If time gap is more than 12 hours, a new set begins
      if (timeGap >= 12) {
        console.log(
          `New set detected between shifts at index ${index}. Checking if rest period meets fatigue policy requirements.`
        );

        // Fatigue policy check for the previous set before starting a new one
        if (
          consecutiveNightShifts >= 4 &&
          timeGap < 48
        ) {
          alert(
            `Fatigue policy violation: Operator has worked ${consecutiveNightShifts} or more consecutive night shifts and needs at least 48 hours of rest.`
          );
          return false;
        }

        // Start a new set
        consecutiveShifts = 1;
        consecutiveNightShifts = shift.shift === "Night" ? 1 : 0;
      } else {
        consecutiveShifts += 1;
        if (shift.shift === "Night") {
          consecutiveNightShifts += 1;
        }
      }
    } else {
      // First shift in the list
      consecutiveShifts = 1;
      consecutiveNightShifts = shift.shift === "Night" ? 1 : 0;
    }

    lastShiftEnd = shiftEnd;

    console.log(`Consecutive shifts: ${consecutiveShifts}`);
    console.log(`Consecutive night shifts: ${consecutiveNightShifts}`);

    // Immediate check for maximum consecutive shifts (violation regardless of time gap)
    if (consecutiveShifts > fatiguePolicyConfig.maxConsecutiveShifts) {
      alert(
        `Fatigue policy violation: Operator has exceeded the maximum number of consecutive shifts (${fatiguePolicyConfig.maxConsecutiveShifts}).`
      );
      return false;
    }
  }

  return true;
};

export const fetchFatiguePolicy = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/config/fatigue-policy", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fatigue policy:", error);
    return null;
  }
};
