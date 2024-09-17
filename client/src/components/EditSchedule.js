import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Modal,
  TextField,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Logout from "./Logout";
import moment from "moment-timezone";
import { useUser } from "../contexts/UserContext";
import { DateRangePicker } from "react-date-range";
import axios from "axios";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const jobColors = {
  "FCC Console": "blue",
  "VRU Console": "green",
  "#1 Out": "navy",
  "#2 Out": "orange",
  "#3 Out": "lime",
  "Tank Farm": "purple",
  Vacation: "indigo",
  "Out Extra": "violet",
  Training: "#2980b9",
  Holiday: "olive",
  ERT: "maroon",
  Medical: "turquoise",
  Overtime: "yellow",
  Mandate: "red",
  TurnAround: "gold",
};

const Legend = () => {
  // Split jobColors into two halves for two rows
  const jobKeys = Object.keys(jobColors);
  const halfLength = Math.ceil(jobKeys.length / 2);
  const firstRow = jobKeys.slice(0, halfLength);
  const secondRow = jobKeys.slice(halfLength);

  return (
    <Box margin="2rem">
      {/* First Row */}
      <Box display="flex" justifyContent="space-around" marginBottom="1rem">
        {firstRow.map((job) => (
          <Box key={job} display="flex" alignItems="center">
            <Box
              sx={{
                width: 18,
                height: 18,
                backgroundColor: jobColors[job],
                marginRight: "1rem",
                borderRadius: "4px", // Adding rounded corners
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Adding shadow
              }}
            />
            <Typography variant="body1">{job}</Typography>
          </Box>
        ))}
      </Box>
      {/* Second Row */}
      <Box display="flex" justifyContent="space-around">
        {secondRow.map((job) => (
          <Box key={job} display="flex" alignItems="center">
            <Box
              sx={{
                width: 18,
                height: 18,
                backgroundColor: jobColors[job],
                marginRight: "1rem",
                borderRadius: "4px", // Adding rounded corners
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Adding shadow
              }}
            />
            <Typography variant="body1">{job}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const EditSchedule = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const [operators, setOperators] = useState([]);
  const [unpublishedEvents, setUnpublishedEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    operatorId: "",
    shift: "",
    job: "",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [vacationModalOpen, setVacationModalOpen] = useState(false);
  const [vacationData, setVacationData] = useState({
    hoursOff: "", // How many hours off: 4, 8, or 12
    partOfShift: "", // First or last 4/8 hours
    shiftType: "Day", // Day or Night shift
    remainingJob: "",
  });

  const [mandateOvertimeModalOpen, setMandateOvertimeModalOpen] =
    useState(false);
  const [mandateOvertimeJob, setMandateOvertimeJob] = useState("");
  const [mandateOvertimeType, setMandateOvertimeType] = useState(""); // Either 'Mandate' or 'Overtime'

  // State for Overtime Shift
  const [overtimeShiftLength, setOvertimeShiftLength] = useState("12");
  const [overtimeShiftPart, setOvertimeShiftPart] = useState("full");

  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingJob, setTrainingJob] = useState(""); // Job selected for training

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unpublished = response.data.filter((event) => !event.published);
      setUnpublishedEvents(unpublished);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("/api/operators", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOperators(response.data);
      } catch (error) {
        console.error("Error fetching operators", error);
      }
    };
    fetchOperators();
    fetchEvents();
  }, []);

  useEffect(() => {
    const container = timelineRef.current;

    // Create items for each event, assigning them to specific groups (operators)
    const items = new DataSet(
      unpublishedEvents.map((event) => ({
        id: event.id,
        group: event.operatorId,
        content: `${event.title}`,
        start: event.start,
        end: event.end,
        style: `background-color: ${
          jobColors[event.job] || "gray"
        }; color: white; border-radius: 5px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); border: 2px solid #333;`, // Adding styling
      }))
    );

    // Create groups for each operator
    const groups = new DataSet(
      operators.map((operator) => ({
        id: operator.id,
        content: operator.name,
      }))
    );

    const options = {
      orientation: {
        axis: "top",
        item: "bottom",
      },
      stack: true,
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24,
      zoomMax: 1000 * 60 * 60 * 24 * 31,
      groupOrder: (a, b) => a.content.localeCompare(b.content),
      width: "100%",
      zoomable: false,
      horizontalScroll: false,
      multiselect: true,
      template: function (item) {
        // Determine if the job is 'Overtime'
        const isOvertime = item.content.includes("Overtime");
        // Apply custom styling conditionally
        return `<div style="color: ${
          isOvertime ? "black" : "white"
        }; padding: 5px;">
                  ${item.content}
                </div>`;
      },
    };

    timelineInstance.current = new Timeline(container, items, groups, options);

    // Set the default zoom level to be 4 steps away from zoomMax
    const zoomLevel = options.zoomMax / 4;
    const windowStart = new Date(Date.now() - zoomLevel);
    const windowEnd = new Date(Date.now() + zoomLevel);
    timelineInstance.current.setWindow(windowStart, windowEnd);

    if (timelineInstance.current) {
      // Show the tooltip on hover
      timelineInstance.current.on("itemover", function (properties) {
        const tooltip = document.getElementById("custom-tooltip");
        const event = unpublishedEvents.find(
          (evt) => evt.id === properties.item
        );
        if (event) {
          tooltip.innerHTML = `Title: ${event.title}<br>Job: ${event.job}`;
          tooltip.style.display = "block";
        }
      });

      // Hide the tooltip when not hovering
      timelineInstance.current.on("itemout", function () {
        const tooltip = document.getElementById("custom-tooltip");
        tooltip.style.display = "none";
      });

      // Move the tooltip with the mouse
      timelineInstance.current.on("mouseMove", function (properties) {
        const tooltip = document.getElementById("custom-tooltip");
        tooltip.style.left = properties.event.pageX + 10 + "px";
        tooltip.style.top = properties.event.pageY + 10 + "px";
      });
    }

    // Add event click listener
    timelineInstance.current.on("select", (properties) => {
      const eventIds = properties.items; // This returns an array of selected event IDs

      if (eventIds.length > 0) {
        const selected = unpublishedEvents.filter((evt) =>
          eventIds.includes(evt.id)
        );
        setSelectedEvents(selected); // Track multiple selected events

        // Check if multiple events are selected, don't open the modal until user is done selecting
        if (eventIds.length > 1) {
          setModalOpen(true); // Open the modal only when multiple events are selected
        } else {
          // For single selection, open modal directly
          setSelectedEvent(selected[0]);
          setModalOpen(true);
        }
      }
    });

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
    };
  }, [unpublishedEvents, operators]);

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Perform deletion of all selected events
      await Promise.all(
        selectedEvents.map(async (event) => {
          await axios.delete(`/api/events/${event.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
      );

      console.log("Selected events deleted successfully");
      setSelectedEvents([]); // Clear selected events after deletion
      setModalOpen(false); // Close modal if it's open
      fetchEvents();
    } catch (error) {
      console.error("Error deleting selected events:", error);
      alert("Failed to delete selected events.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "job") {
      if (value === "Training") {
        setTrainingModalOpen(true); // Open the training modal
      } else if (value === "Vacation") {
        setVacationModalOpen(true);
      } else if (value === "Mandate" || value === "Overtime") {
        setMandateOvertimeType(value);
        setMandateOvertimeModalOpen(true);
      } else {
        // Handle other jobs normally
        setNewEvent((prevEvent) => ({
          ...prevEvent,
          [name]: value,
        }));
      }
    } else {
      // Handle other input changes normally
      setNewEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value,
      }));
    }
  };

  const handleDateRangeChange = (ranges) => {
    const { selection } = ranges;
    setRange([selection]);
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      startDate: selection.startDate,
      endDate: selection.endDate,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No token found, user might not be authenticated"); // Add alert for token not found
        return;
      }

      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedEvent),
      });

      if (response.ok) {
        setModalOpen(false); // Close the modal on success
        fetchEvents();
      } else {
        const data = await response.json();
        if (response.status === 400 && data.error) {
          alert(data.error); // Alert the user about the overlap issue or other custom error
        } else {
          alert("Failed to save the event due to server error");
          console.error(
            "Failed to save event",
            response.status,
            response.statusText
          );
        }
      }
    } catch (error) {
      alert("An error occurred while saving the event.");
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, user might not be authenticated");
        return;
      }

      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Event deleted successfully");
        setModalOpen(false);
        fetchEvents();
      } else {
        console.error(
          "Failed to delete event",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const checkFatiguePolicy = async (
    operatorId,
    newShiftStart,
    newShiftEnd,
    shiftType,
    allShifts // Include this parameter to pass shifts created in the current submission
  ) => {
    newShiftStart = new Date(newShiftStart);
    newShiftEnd = new Date(newShiftEnd);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    // Fetch operator's existing events within the current work-set
    const startDate = moment(newShiftStart)
      .startOf("week")
      .format("YYYY-MM-DD");
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
      operatorId: newEvent.operatorId,
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

        // If time gap is more than 12 hours, the set is considered over
        if (timeGap > 12) {
          console.log(
            `Break detected between shifts at index ${index}. Checking if rest period meets fatigue policy requirements.`
          );

          // Fatigue policy check when the set is over
          if (consecutiveShifts >= 7 && timeGap < 48) {
            alert(
              "Fatigue policy violation: Operator has worked 7 or more consecutive shifts and needs at least 48 hours of rest."
            );
            return false;
          }

          if (consecutiveNightShifts >= 4 && timeGap < 48) {
            alert(
              "Fatigue policy violation: Operator has worked 4 or more consecutive night shifts and needs at least 48 hours of rest."
            );
            return false;
          }

          if (consecutiveShifts === 3 && timeGap < 36) {
            alert(
              "Fatigue policy violation: Operator has worked 3 shifts and needs at least 36 hours of rest."
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
        consecutiveShifts = 1;
        consecutiveNightShifts = shift.shift === "Night" ? 1 : 0;
      }

      lastShiftEnd = shiftEnd;

      console.log(`Consecutive shifts: ${consecutiveShifts}`);
      console.log(`Consecutive night shifts: ${consecutiveNightShifts}`);

      // Immediate check for maximum consecutive shifts (violation regardless of time gap)
      if (consecutiveShifts > 7) {
        alert(
          "Fatigue policy violation: Operator has exceeded the maximum number of consecutive shifts."
        );
        return false;
      }
    }

    return true;
  };

  // Function to check if the job is already taken by another operator
  const isJobTaken = async (job, startDate, endDate) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Fetch all events for the specified job and date range
      const response = await axios.get(
        `/api/events?job=${job}&from=${startDate}&to=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If there are any events returned, the job is taken
      return response.data.length > 0;
    } catch (error) {
      console.error("Error checking job availability:", error);
      return false; // If there's an error, assume the job is not taken to avoid false positives
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Define jobs that require training and can't overlap
      const jobsRequiringTraining = [
        "FCC Console",
        "VRU Console",
        "#1 Out",
        "#2 Out",
        "#3 Out",
        "Tank Farm",
      ];

      // Check if the job requires training
      if (jobsRequiringTraining.includes(newEvent.job)) {
        const selectedOperator = operators.find(
          (operator) => operator.id === newEvent.operatorId
        );

        // If the job requires training, check if the operator is trained for it
        if (!selectedOperator.jobs.includes(newEvent.job)) {
          alert(`Operator is not trained for job: ${newEvent.job}`);
          return;
        }
      }

      let currentDate = moment
        .tz(newEvent.startDate, "America/Chicago")
        .startOf("day");
      const endDate = moment
        .tz(newEvent.endDate, "America/Chicago")
        .startOf("day");

      let allShifts = []; // Array to track shifts created during the current submission

      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        const startShift = currentDate.clone().set({
          hour: newEvent.shift === "Day" ? 4 : 16,
          minute: 45,
        });

        const endShift = startShift.clone().add(12, "hours");

        // Check for job conflict
        if (jobsRequiringTraining.includes(newEvent.job)) {
          const jobTaken = await isJobTaken(
            newEvent.job,
            startShift.toISOString(),
            endShift.toISOString()
          );

          if (jobTaken) {
            alert(
              `The job ${newEvent.job} is already assigned to another operator for the selected shift and date.`
            );
            return;
          }
        }

        console.log(
          `Creating shift for date: ${currentDate.format(
            "YYYY-MM-DD"
          )} from ${startShift.format()} to ${endShift.format()}`
        );

        const event = {
          operatorId: newEvent.operatorId,
          title: `${newEvent.shift} Shift`,
          start: startShift.toDate(),
          end: endShift.toDate(),
          shift: newEvent.shift,
          job: newEvent.job,
        };

        const shiftType =
          newEvent.shift === "Day" || newEvent.shift === "Night"
            ? "12-Hour"
            : "Unknown";

        // Pass the shifts created during the current submission along with fatigue check
        const fatigueCheck = await checkFatiguePolicy(
          newEvent.operatorId,
          startShift,
          endShift,
          shiftType,
          allShifts // Pass the shifts created so far
        );

        if (!fatigueCheck) {
          console.log(
            `Fatigue policy violated for shift on ${currentDate.format(
              "YYYY-MM-DD"
            )}`
          );
          return;
        }

        console.log("Event payload being sent to the server:", event);
        console.log("Existing shifts:", allShifts);

        const response = await axios.post("/api/events", event, {
          headers: { Authorization: `Bearer ${token}` },
        });

        allShifts.push({
          id: response.data.id,
          operatorId: newEvent.operatorId,
          title: `${newEvent.shift}`,
          start: startShift.toISOString(),
          end: endShift.toISOString(),
          shift: newEvent.shift,
        });

        setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);

        currentDate.add(1, "days");
        console.log("Event added:", newEvent);
      }

      setNewEvent({
        operatorId: "",
        shift: "",
        job: "",
        startDate: new Date(),
        endDate: new Date(),
      });
      setRange([
        { startDate: new Date(), endDate: new Date(), key: "selection" },
      ]);
    } catch (error) {
      console.error("Error adding event:", error);
      alert(error.response?.data?.error || "Failed to create event.");
    }
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await Promise.all(
        unpublishedEvents.map((event) =>
          axios.put(
            `/api/events/${event.id}/publish`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setUnpublishedEvents([]);
    } catch (error) {
      console.error("Error publishing events:", error);
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleVacationSubmit = async () => {
    const { hoursOff, partOfShift, shiftType, remainingJob } = vacationData;

    // Logic to determine the start and end times based on the user's selection
    let startShift = moment(newEvent.startDate).startOf("day");
    let endShift = moment(newEvent.startDate).startOf("day");
    let jobStartShift, jobEndShift;

    // Set the startShift time for Day or Night shift
    if (shiftType === "Day") {
      startShift.set({ hour: 4, minute: 45 });
    } else {
      startShift.set({ hour: 16, minute: 45 });
    }

    // Adjust endShift based on hoursOff and partOfShift
    if (hoursOff === "4") {
      if (partOfShift === "first-4") {
        endShift = startShift.clone().add(4, "hours"); // Vacation is the first 4 hours
        jobStartShift = endShift.clone(); // Remaining job starts after vacation
        jobEndShift = startShift.clone().add(12, "hours");
      } else {
        // "last-4"
        jobStartShift = startShift.clone(); // Job starts at the beginning of the shift
        jobEndShift = startShift.clone().add(8, "hours"); // Job ends before the last 4 hours
        startShift = jobEndShift.clone(); // Vacation starts after job ends
        endShift = startShift.clone().add(4, "hours");
      }
    } else if (hoursOff === "8") {
      if (partOfShift === "first-8") {
        endShift = startShift.clone().add(8, "hours"); // Vacation is the first 8 hours
        jobStartShift = endShift.clone(); // Remaining job starts after vacation
        jobEndShift = startShift.clone().add(12, "hours");
      } else {
        // "last-8"
        jobStartShift = startShift.clone(); // Job starts at the beginning of the shift
        jobEndShift = startShift.clone().add(4, "hours"); // Job ends before the last 8 hours
        startShift = jobEndShift.clone(); // Vacation starts after job ends
        endShift = startShift.clone().add(8, "hours");
      }
    } else {
      endShift = startShift.clone().add(12, "hours"); // Full shift
    }

    try {
      // Add the vacation shift with the correct job field
      await handleSubmitVacationShift(startShift, endShift, "Vacation");

      // If there's a partial shift remaining, add a job event for the remaining hours
      if (hoursOff !== "12" && remainingJob) {
        await handleSubmitJobShift(jobStartShift, jobEndShift, remainingJob);
      }
    } catch (error) {
      console.error("Error submitting vacation shifts:", error);
    }

    // Close the vacation modal
    setVacationModalOpen(false);
  };

  // Updated function to handle adding the job shift for the remaining hours
  const handleSubmitJobShift = async (startShift, endShift, job) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        "/api/events",
        {
          operatorId: newEvent.operatorId,
          title: `${newEvent.shift}s | ${job}`,
          start: startShift.toDate(),
          end: endShift.toDate(),
          shift: newEvent.shift,
          job: job,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);
    } catch (error) {
      console.error("Error adding job shift:", error);
      alert(error.response?.data?.error || "Failed to create job shift.");
    }
  };

  // New function to handle adding the vacation shift
  const handleSubmitVacationShift = async (startShift, endShift, job) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        "/api/events",
        {
          operatorId: newEvent.operatorId,
          title: "Vacation",
          start: startShift.toDate(),
          end: endShift.toDate(),
          shift: newEvent.shift,
          job: job,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);
    } catch (error) {
      console.error("Error adding vacation shift:", error);
      alert(error.response?.data?.error || "Failed to create vacation shift.");
    }
  };

  const handleMandateOvertimeSubmit = async () => {
    const { operatorId, shift } = newEvent;
    const jobType = mandateOvertimeType; // "Mandate" or "Overtime"
    const job = mandateOvertimeJob; // Selected job from the modal

    // Create the title string as "Mandate | #1 Out" or "Overtime | #3 Out"
    const title = `${shift} Shift | ${job}`;

    // Determine the start and end times for the shift
    let startShift = moment(newEvent.startDate);
    let endShift;

    if (shift === "Day") {
      startShift.set({ hour: 4, minute: 45 });
    } else {
      startShift.set({ hour: 16, minute: 45 });
    }

    // Calculate endShift based on selected overtime shift length and part
    if (overtimeShiftLength === "4") {
      if (overtimeShiftPart === "beginning") {
        endShift = startShift.clone().add(4, "hours");
      } else {
        startShift = startShift.clone().add(8, "hours");
        endShift = startShift.clone().add(4, "hours");
      }
    } else if (overtimeShiftLength === "8") {
      if (overtimeShiftPart === "beginning") {
        endShift = startShift.clone().add(8, "hours");
      } else {
        startShift = startShift.clone().add(4, "hours");
        endShift = startShift.clone().add(8, "hours");
      }
    } else {
      // Full 12-hour shift
      endShift = startShift.clone().add(12, "hours");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Fatigue Policy Check
      const shiftType = `${overtimeShiftLength}-Hour`; // Adjusted shiftType
      const allShifts = []; // Initialize an empty array to pass the created shifts

      const fatigueCheck = await checkFatiguePolicy(
        operatorId,
        startShift,
        endShift,
        shiftType,
        allShifts
      );

      if (!fatigueCheck) {
        console.log(
          `Fatigue policy violated for ${jobType} on ${startShift.format(
            "YYYY-MM-DD"
          )}`
        );
        return;
      }

      // If the fatigue policy check passes, create the event
      const response = await axios.post(
        "/api/events",
        {
          operatorId,
          title,
          start: startShift.toDate(),
          end: endShift.toDate(),
          shift,
          job: jobType, // Store as "Mandate" or "Overtime" for color mapping
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);
      setMandateOvertimeModalOpen(false);
    } catch (error) {
      console.error(`Error adding ${jobType.toLowerCase()} shift:`, error);
      alert(
        error.response?.data?.error ||
          `Failed to create ${jobType.toLowerCase()} shift.`
      );
    }
  };

  const handleTrainingSubmit = async () => {
    // Make sure that `newEvent` contains the selected operatorId and shift type
    const { operatorId, shift, startDate, endDate } = newEvent;

    if (!operatorId || !shift) {
      alert("Please select an operator and shift type.");
      return;
    }

    let currentDate = moment(startDate).startOf("day");
    const endDateMoment = moment(endDate).startOf("day");

    let allShifts = []; // Array to track shifts created during the current submission

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      while (
        currentDate.isBefore(endDateMoment) ||
        currentDate.isSame(endDateMoment, "day")
      ) {
        let startShift = currentDate.clone().set({
          hour: shift === "Day" ? 4 : 16,
          minute: 45,
        });
        let endShift = startShift.clone().add(12, "hours");

        const event = {
          operatorId: operatorId,
          title: `${shift} Shift | Training for ${trainingJob}`,
          start: startShift.toDate(),
          end: endShift.toDate(),
          shift: shift,
          job: "Training", // Setting the job as 'Training'
        };

        // Fatigue Policy Check (optional)
        const shiftType = `${12}-Hour`;
        const fatigueCheck = await checkFatiguePolicy(
          operatorId,
          startShift,
          endShift,
          shiftType,
          allShifts
        );

        if (!fatigueCheck) {
          console.log(
            `Fatigue policy violated for training on ${currentDate.format(
              "YYYY-MM-DD"
            )}`
          );
          return;
        }

        // Send the event to the server
        const response = await axios.post("/api/events", event, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update the event list with the new event
        allShifts.push({
          id: response.data.id,
          operatorId: operatorId,
          title: `${shift} Shift | Training`,
          start: startShift.toISOString(),
          end: endShift.toISOString(),
          shift: shift,
        });

        setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);

        currentDate.add(1, "days"); // Move to the next day
      }

      setTrainingModalOpen(false); // Close the modal after creating the events
      setTrainingJob(""); // Reset the training job state
    } catch (error) {
      console.error("Error adding training events:", error);
      alert(error.response?.data?.error || "Failed to create training events.");
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <IconButton
        onClick={toggleDrawer(true)}
        edge="start"
        color="inherit"
        aria-label="menu"
        style={{ position: "absolute", top: 20, left: 20 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button onClick={() => navigate("/")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            <ListItem button onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            <ListItem button onClick={() => navigate("/schedule")}>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItem>

            {["OLMC", "Clerk", "APS", "Admin"].includes(user.role) && (
              <>
                <ListItem button onClick={() => navigate("/edit-schedule")}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="Edit Schedule" />
                </ListItem>
                <ListItem button onClick={() => navigate("/manage-operators")}>
                  <ListItemIcon>
                    <SupervisorAccountIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Operators" />
                </ListItem>
              </>
            )}

            <Logout />
          </List>
        </Box>
      </Drawer>
      <Container maxWidth="lg" sx={{ marginTop: 2 }}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item xs={12} container justifyContent="center"></Grid>
          <Grid item xs={12} container justifyContent="center">
            <Typography variant="h4" component="h2" gutterBottom align="center">
              Edit Schedule
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Operator</InputLabel>
                  <Select
                    name="operatorId"
                    value={newEvent.operatorId}
                    onChange={handleInputChange}
                  >
                    {operators
                      .sort((a, b) => a.name.localeCompare(b.name)) // Sort the operators alphabetically by name
                      .map((operator) => (
                        <MenuItem key={operator.id} value={operator.id}>
                          {operator.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Shift</InputLabel>
                  <Select
                    name="shift"
                    value={newEvent.shift}
                    onChange={handleInputChange}
                    sx={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                  >
                    <MenuItem value="Day">Day</MenuItem>
                    <MenuItem value="Night">Night</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Job</InputLabel>
                  <Select
                    name="job"
                    value={newEvent.job}
                    onChange={handleInputChange} // Ensure this function is triggered
                    sx={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                  >
                    {Object.keys(jobColors).map((job) => (
                      <MenuItem key={job} value={job}>
                        {job}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Grid container justifyContent="center">
                  <DateRangePicker
                    ranges={range}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    rangeColors={["#3f51b5"]}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                >
                  Add Event
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handlePublish}
                  fullWidth
                >
                  Publish Events
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between" sx={{ marginTop: 10 }}>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              marginBottom={2}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => timelineInstance.current.moveTo(new Date())}
                >
                  Today
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => timelineInstance.current.zoomIn(0.5)}
                >
                  Zoom In
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => timelineInstance.current.zoomOut(0.5)}
                >
                  Zoom Out
                </Button>
              </Grid>
            </Grid>
            <Box
              sx={{ width: "100%", height: "auto", overflowX: "auto" }}
              className="timeline-container"
            >
              <Box ref={timelineRef} style={{ width: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="edit-event-modal"
          aria-describedby="edit-event-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              id="edit-event-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Edit Event
            </Typography>
            <TextField
              name="title"
              label="Title"
              fullWidth
              value={selectedEvent?.title || ""}
              onChange={(e) =>
                setSelectedEvent({ ...selectedEvent, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              name="job"
              label="Job"
              fullWidth
              value={selectedEvent?.job || ""}
              onChange={(e) =>
                setSelectedEvent({ ...selectedEvent, job: e.target.value })
              }
              margin="normal"
            />
            <TextField
              name="start"
              label="Start"
              type="datetime-local"
              fullWidth
              value={
                selectedEvent
                  ? moment(selectedEvent.start).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  start: new Date(e.target.value),
                })
              }
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              name="end"
              label="End"
              type="datetime-local"
              fullWidth
              value={
                selectedEvent
                  ? moment(selectedEvent.end).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) =>
                setSelectedEvent({
                  ...selectedEvent,
                  end: new Date(e.target.value),
                })
              }
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSave}
                  sx={{ padding: "10px" }}
                >
                  SAVE
                </Button>
              </Grid>

              {selectedEvents.length === 1 && (
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={handleDelete}
                    sx={{ padding: "10px" }}
                  >
                    DELETE SINGLE EVENT
                  </Button>
                </Grid>
              )}

              {selectedEvents.length > 1 && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleBulkDelete}
                    sx={{ padding: "10px" }}
                  >
                    DELETE SELECTED EVENTS
                  </Button>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setModalOpen(false)}
                  sx={{ padding: "10px" }}
                >
                  CANCEL
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
        <Modal
          open={vacationModalOpen}
          onClose={() => setVacationModalOpen(false)}
          aria-labelledby="vacation-modal"
          aria-describedby="vacation-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              id="vacation-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Vacation Time Selection
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Hours Off</InputLabel>
              <Select
                name="hoursOff"
                value={vacationData.hoursOff}
                onChange={(e) =>
                  setVacationData((prev) => ({
                    ...prev,
                    hoursOff: e.target.value,
                  }))
                }
              >
                <MenuItem value="4">4 hours</MenuItem>
                <MenuItem value="8">8 hours</MenuItem>
                <MenuItem value="12">12 hours</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Part of Shift</InputLabel>
              <Select
                name="partOfShift"
                value={vacationData.partOfShift}
                onChange={(e) =>
                  setVacationData((prev) => ({
                    ...prev,
                    partOfShift: e.target.value,
                  }))
                }
              >
                <MenuItem value="first-4">First 4 hours</MenuItem>
                <MenuItem value="last-4">Last 4 hours</MenuItem>
                {vacationData.hoursOff === "8" && (
                  <>
                    <MenuItem value="first-8">First 8 hours</MenuItem>
                    <MenuItem value="last-8">Last 8 hours</MenuItem>
                  </>
                )}
                {vacationData.hoursOff === "12" && (
                  <MenuItem value="full">Full 12 hours</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Shift Type</InputLabel>
              <Select
                name="shiftType"
                value={vacationData.shiftType}
                onChange={(e) =>
                  setVacationData((prev) => ({
                    ...prev,
                    shiftType: e.target.value,
                  }))
                }
              >
                <MenuItem value="Day">Day</MenuItem>
                <MenuItem value="Night">Night</MenuItem>
              </Select>
            </FormControl>

            {/* New Field for selecting the job for the remaining hours */}
            {vacationData.hoursOff !== "12" && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Job for Remaining Hours</InputLabel>
                <Select
                  name="remainingJob"
                  value={vacationData.remainingJob}
                  onChange={(e) =>
                    setVacationData((prev) => ({
                      ...prev,
                      remainingJob: e.target.value,
                    }))
                  }
                >
                  {Object.keys(jobColors).map((job) => (
                    <MenuItem key={job} value={job}>
                      {job}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleVacationSubmit()}
              sx={{ marginTop: 2 }}
            >
              Confirm Vacation
            </Button>
          </Box>
        </Modal>

        <Modal
          open={mandateOvertimeModalOpen}
          onClose={() => setMandateOvertimeModalOpen(false)}
          aria-labelledby="mandate-overtime-modal"
          aria-describedby="mandate-overtime-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              id="mandate-overtime-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Select Job for {mandateOvertimeType}
            </Typography>

            {/* Shift Length Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Shift Length</InputLabel>
              <Select
                value={overtimeShiftLength}
                onChange={(e) => setOvertimeShiftLength(e.target.value)}
              >
                <MenuItem value="4">4 hours</MenuItem>
                <MenuItem value="8">8 hours</MenuItem>
                <MenuItem value="12">Full 12 hours</MenuItem>
              </Select>
            </FormControl>

            {/* Conditional Part of Shift Selection */}
            {overtimeShiftLength !== "12" && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Part of Shift</InputLabel>
                <Select
                  value={overtimeShiftPart}
                  onChange={(e) => setOvertimeShiftPart(e.target.value)}
                >
                  <MenuItem value="beginning">Beginning</MenuItem>
                  <MenuItem value="end">End</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Job Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Job</InputLabel>
              <Select
                value={mandateOvertimeJob}
                onChange={(e) => setMandateOvertimeJob(e.target.value)}
              >
                {[
                  "FCC Console",
                  "VRU Console",
                  "#1 Out",
                  "#2 Out",
                  "#3 Out",
                  "Tank Farm",
                ].map((job) => (
                  <MenuItem key={job} value={job}>
                    {job}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Confirm Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleMandateOvertimeSubmit()}
              sx={{ marginTop: 2 }}
            >
              Confirm {mandateOvertimeType}
            </Button>
          </Box>
        </Modal>

        <Modal
          open={trainingModalOpen}
          onClose={() => setTrainingModalOpen(false)}
          aria-labelledby="training-modal"
          aria-describedby="training-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography
              id="training-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Select Job for Training
            </Typography>

            {/* Job Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Job</InputLabel>
              <Select
                value={trainingJob}
                onChange={(e) => setTrainingJob(e.target.value)}
              >
                {[
                  "FCC Console",
                  "VRU Console",
                  "#1 Out",
                  "#2 Out",
                  "#3 Out",
                  "Tank Farm",
                ].map((job) => (
                  <MenuItem key={job} value={job}>
                    {job}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Confirm Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrainingSubmit}
              sx={{ marginTop: 2 }}
            >
              Confirm Training Job
            </Button>
          </Box>
        </Modal>

        <Legend />
      </Container>
      <div
        id="custom-tooltip"
        style={{
          position: "absolute",
          padding: "5px",
          backgroundColor: "#333",
          color: "#fff",
          borderRadius: "3px",
          display: "none",
          zIndex: 1000,
        }}
      ></div>
    </div>
  );
};

export default EditSchedule;
