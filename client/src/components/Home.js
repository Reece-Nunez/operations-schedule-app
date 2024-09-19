import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Grid,
  Button,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

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

const Home = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [operators, setOperators] = useState([]);

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

    const fetchPublishedEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("/api/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEvents(response.data.filter((event) => event.published)); // Only show published events
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchOperators();
    fetchPublishedEvents();
  }, []);

  // Initialize the timeline
  useEffect(() => {
    const container = timelineRef.current;

    // If timelineInstance already exists, clear the DataSet before creating new items.
    if (timelineInstance.current) {
      // Clear the timeline items and groups
      timelineInstance.current.setItems([]);
      timelineInstance.current.setGroups([]);
    }

    const operatorMap = operators.reduce((map, operator) => {
      map[operator.id] = operator.name;
      return map;
    }, {});

    // Create items for each event, assigning them to specific groups (operators)
    const items = new DataSet(
      events.map((event) => ({
        id: event.id,
        group: event.operatorId,
        content: `${event.title}`,
        start: event.start,
        end: event.end,
        style: `background-color: ${jobColors[event.job] || "gray"};`,
      }))
    );

    // Create groups for operators
    const groups = new DataSet(
      [...new Set(events.map((event) => event.operatorId))].map(
        (operatorId) => ({
          id: operatorId,
          content: operatorMap[operatorId] || `Operator ${operatorId}`,
        })
      )
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

    // If timelineInstance doesn't exist yet, create a new one
    if (!timelineInstance.current) {
      timelineInstance.current = new Timeline(
        container,
        items,
        groups,
        options
      );
    } else {
      // Update existing timeline with new items and groups
      timelineInstance.current.setItems(items);
      timelineInstance.current.setGroups(groups);
    }

    // Tooltip logic
    const tooltip = document.getElementById("custom-tooltip");

    // Show the tooltip on hover
    timelineInstance.current.on("itemover", (properties) => {
      const event = events.find((evt) => evt.id === properties.item);
      if (event) {
        tooltip.innerHTML = `Title: ${event.title}<br>Job: ${event.job}`;
        tooltip.style.display = "block";
      }
    });

    // Hide the tooltip when not hovering
    timelineInstance.current.on("itemout", () => {
      tooltip.style.display = "none";
    });

    // Move the tooltip with the mouse
    timelineInstance.current.on("mouseMove", (properties) => {
      tooltip.style.left = properties.event.pageX + 10 + "px";
      tooltip.style.top = properties.event.pageY + 10 + "px";
    });

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy(); // Clean up timeline instance on unmount
        timelineInstance.current = null;
      }
    };
  }, [events, operators]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
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
                {["Admin", "OLMC", "APS"].includes(user.role) && (
                  <ListItem button onClick={() => navigate("/fatigue-policy")}>
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Fatigue Policy" />
                  </ListItem>
                )}
              </>
            )}
            <Logout />
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" style={{ marginTop: "4rem" }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Operations Schedule
        </Typography>
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
          </Box>
        </Grid>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box
            sx={{ width: "100%", height: "auto", overflowX: "auto" }}
            className="timeline-container"
          >
            <Box ref={timelineRef} style={{ width: "100%" }} />
          </Box>
        </Box>
        <Legend />
      </Container>
      <div
        id="custom-tooltip"
        style={{
          position: "absolute",
          display: "none",
          padding: "5px",
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          color: "white",
          borderRadius: "4px",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      ></div>
    </div>
  );
};

export default Home;
