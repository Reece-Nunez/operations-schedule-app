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
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import Logout from './Logout';
import moment from "moment-timezone";
import { useUser } from '../contexts/UserContext';
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
  "#1 Out": "yellow",
  "#2 Out": "orange",
  "#3 Out": "red",
  "Tank Farm": "purple",
};

const Legend = () => (
  <Box display="flex" justifyContent="space-around" marginBottom="1rem">
    {Object.keys(jobColors).map((job) => (
      <Box key={job} display="flex" alignItems="center">
        <Box
          sx={{
            width: 16,
            height: 16,
            backgroundColor: jobColors[job],
            marginRight: '0.5rem',
          }}
        />
        <Typography variant="body1">{job}</Typography>
      </Box>
    ))}
  </Box>
);

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
        style: `background-color: ${jobColors[event.job] || "gray"};`,
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
    };

    timelineInstance.current = new Timeline(container, items, groups, options);

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

    return () => timelineInstance.current.destroy();
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
    } catch (error) {
      console.error("Error deleting selected events:", error);
      alert("Failed to delete selected events.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
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
    shiftType
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

    const response = await axios.get(
      `/api/events/operator/${operatorId}?from=${startDate}&to=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const existingShifts = response.data.sort((a, b) => new Date(a.start) - new Date(b.start));
    let consecutiveShifts = 0;
    let consecutiveNightShifts = 0;
    let lastShiftEnd = null;
    let isNewSet = false; // Flag to check if we're starting a new set

    console.log("Existing shifts: ", existingShifts);

    let currentSetShifts = []; // Track the shifts in the current set

    // Iterate through each existing shift
    existingShifts.forEach((shift, index) => {
      const shiftStart = new Date(shift.start);
      const shiftEnd = new Date(shift.end);

      // Log the start and end time of the current shift
      console.log(
        `Processing shift ${index}: Start - ${shiftStart}, End - ${shiftEnd}`
      );

      if (lastShiftEnd) {
        const timeGap =
          (shiftStart.getTime() - lastShiftEnd.getTime()) / (60 * 60 * 1000); // Convert gap to hours
        console.log(
          `Time gap between last shift and current shift: ${timeGap} hours`
        );

        // Check if there's more than 12 hours between the last shift and the current shift
        if (timeGap > 12) {
          console.log(
            `Break detected between shifts at index ${index}. Starting a new set.`
          );

          // Reset shift counters and the current set array
          currentSetShifts = []; // Start a fresh array for the new set
          consecutiveShifts = 1; // Start counting with the current shift
          consecutiveNightShifts = shift.shift === "Night" ? 1 : 0; // Reset night shifts based on the current shift
          lastShiftEnd = shiftEnd; // Update the lastShiftEnd to current shift's end time
          currentSetShifts.push(shift); // Add current shift to the new set

          console.log(
            "Previous shifts discarded. New set starts with this shift."
          );
        } else {
          console.log(`No break detected. Continuing in the same set.`);
        }
      } else {
        console.log(
          `This is the first shift being processed. No previous shift to compare.`
        );
      }

      // Add shift to the current set tracking
      currentSetShifts.push(shift);

      // Increment shift counters within the same set
      consecutiveShifts += 1;

      if (shift.shift === "Night") {
        consecutiveNightShifts += 1;
        console.log(
          `Night shift detected. Consecutive night shifts: ${consecutiveNightShifts}`
        );
      } else {
        consecutiveNightShifts = 0; // Reset night shift counter for day shifts
        console.log(`Day shift detected. Consecutive night shifts reset to 0.`);
      }

      console.log(`Consecutive shifts: ${consecutiveShifts}`);

      lastShiftEnd = shiftEnd; // Update the last shift end time
    });

    console.log(`Final consecutive shifts count: ${consecutiveShifts}`);
    console.log(
      `Final consecutive night shifts count: ${consecutiveNightShifts}`
    );

    // Check if the current shift violates the maximum allowed shifts or night shifts
    if (consecutiveShifts > 7 || consecutiveNightShifts > 4) {
      console.log(
        "Fatigue policy violation: Operator has reached the maximum number of consecutive shifts or night shifts."
      );

      // Alert the user about the fatigue policy violation and do not add the shift
      const shiftTypeExceeded = consecutiveShifts > 7 ? "day" : "night";
      alert(
        `This set has reached the maximum number of consecutive ${shiftTypeExceeded} shifts. 48 hours of rest is required. Shift on ${newShiftStart.toDateString()} is not added.`
      );

      return false; // Stop the creation of the shift
    }

    // Additional condition for checking rest time between last shift and new shift (if needed)
    if (
      !isNewSet &&
      lastShiftEnd &&
      newShiftStart.getTime() - lastShiftEnd.getTime() < 48 * 60 * 60 * 1000
    ) {
      const timeGap =
        (newShiftStart.getTime() - lastShiftEnd.getTime()) / (60 * 60 * 1000); // Convert gap to hours
      console.log(
        `Checking rest time between last shift and new shift: ${timeGap} hours`
      );

      if (isNewSet && timeGap < 48) {
        console.log(
          "Fatigue policy violation: Operator needs at least 48 hours of rest before starting the next set."
        );
        alert(
          "Operator needs at least 48 hours of rest before starting the next set."
        );
        return false;
      }
    }

    console.log("Fatigue policy check passed.");
    return true; // Allow the shift creation
  };


  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const selectedOperator = operators.find(
        (operator) => operator.id === newEvent.operatorId
      );

      if (!selectedOperator.jobs.includes(newEvent.job)) {
        alert(`Operator is not trained for job: ${newEvent.job}`);
        return;
      }

      // Set the current date to the start date and define the end date.
      let currentDate = moment
        .tz(newEvent.startDate, "America/Chicago")
        .startOf("day");
      const endDate = moment
        .tz(newEvent.endDate, "America/Chicago")
        .startOf("day");

      // Array to keep track of the shifts created in the current submission process
      let existingShifts = [];

      // Loop through each day to create individual 12-hour shifts.
      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, "day")
      ) {
        const startShift = currentDate.clone().set({
          hour: newEvent.shift === "Day" ? 4 : 16, // 04:45 AM for Day, 04:45 PM for Night
          minute: 45,
        });

        const endShift = startShift.clone().add(12, "hours");

        // Debugging to ensure per-day shifts
        console.log(
          `Creating shift for date: ${currentDate.format(
            "YYYY-MM-DD"
          )} from ${startShift.format()} to ${endShift.format()}`
        );

        // Each shift is now isolated per day
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

        // Check the fatigue policy for each shift.
        const fatigueCheck = await checkFatiguePolicy(
          newEvent.operatorId,
          startShift,
          endShift,
          shiftType,
          existingShifts // Pass existingShifts that include previously added shifts
        );
        if (!fatigueCheck) {
          console.log(
            `Fatigue policy violated for shift on ${currentDate.format(
              "YYYY-MM-DD"
            )}`
          );
          return; // Stop execution if fatigue policy is violated.
        }

        // Log the payload before sending the request.
        console.log("Event payload being sent to the server:", event);
        console.log("Existing shifts:", existingShifts);

        // Send the POST request to create the event.
        const response = await axios.post("/api/events", event, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Add the event to the existing shifts for future fatigue checks
        existingShifts.push({
          id: response.data.id, // Add necessary fields for future checks
          operatorId: newEvent.operatorId,
          title: `${newEvent.shift} Shift`,
          start: startShift.toISOString(),
          end: endShift.toISOString(),
          shift: newEvent.shift,
        });

        // Add the event to the unpublished events list.
        setUnpublishedEvents((prevEvents) => [...prevEvents, response.data]);

        // Move to the next day for the loop.
        currentDate.add(1, "days");
      }

      // Reset the new event form and date range.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <IconButton 
        onClick={toggleDrawer(true)} 
        edge="start" 
        color="inherit" 
        aria-label="menu"
        style={{ position: 'absolute', top: 20, left: 20 }}
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
          <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon>
                <HomeIcon/>
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            <ListItem button onClick={() => navigate('/schedule')}>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItem>

            {['OLMC', 'Clerk', 'APS', 'Admin'].includes(user.role) && (
              <>
                <ListItem button onClick={() => navigate('/edit-schedule')}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="Edit Schedule" />
                </ListItem>
                <ListItem button onClick={() => navigate('/manage-operators')}>
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
          <Grid item xs={12} container justifyContent="center">
          </Grid>
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
                    {operators.map((operator) => (
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
                    onChange={handleInputChange}
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
            <Grid container spacing={2} justifyContent="center" marginBottom={2}>
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
            <Box ref={timelineRef} sx={{ width: "100%", minWidth: "800px" }} />
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
        <Legend />
      </Container>
    </div>
  );
};

export default EditSchedule;
