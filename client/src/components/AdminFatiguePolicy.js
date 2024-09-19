import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Logout from "./Logout";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useUser } from "../contexts/UserContext";

const AdminFatiguePolicy = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const [policy, setPolicy] = useState({
    maxConsecutiveShifts: "",
    minRestAfterMaxShifts: "",
    maxConsecutiveNightShifts: "",
    minRestAfterNightShifts: "",
    minRestAfter3Shifts: "",
    shiftLengthHours: "",
    maxHoursInDay: "",
  });

  // Fetch current fatigue policy
  const fetchPolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get("/api/config/fatigue-policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicy(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(
          "No current fatigue policy found. This is expected if no policy has been set yet."
        );
      } else {
        console.error("Error fetching fatigue policy:", error);
      }
    }
  };

  // Call this in useEffect when the component mounts
  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPolicy((prevPolicy) => ({ ...prevPolicy, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        alert("No token found. Please log in.");
        return;
      }

      await axios
        .put("/api/config/fatigue-policy", policy, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          alert("Fatigue policy updated successfully!");

          // Clear the form by resetting the state to initial values
          setPolicy({
            maxConsecutiveShifts: "",
            minRestAfterMaxShifts: "",
            maxConsecutiveNightShifts: "",
            minRestAfterNightShifts: "",
            minRestAfter3Shifts: "",
            shiftLengthHours: "",
            maxHoursInDay: "",
          });
        });
    } catch (error) {
      console.error("Error updating fatigue policy:", error);
      alert("Failed to update fatigue policy.");
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        textAlign: "center",
        marginLeft: "20%",
        marginRight: "20%",
        marginTop: "5%",
      }}
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

      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom>
          Update Fatigue Policy
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Max Consecutive Shifts"
            name="maxConsecutiveShifts"
            type="number"
            fullWidth
            margin="normal"
            value={policy.maxConsecutiveShifts}
            onChange={handleChange}
            required
          />
          <TextField
            label="Min Rest After Max Shifts (hours)"
            name="minRestAfterMaxShifts"
            type="number"
            fullWidth
            margin="normal"
            value={policy.minRestAfterMaxShifts}
            onChange={handleChange}
            required
          />
          <TextField
            label="Max Consecutive Night Shifts"
            name="maxConsecutiveNightShifts"
            type="number"
            fullWidth
            margin="normal"
            value={policy.maxConsecutiveNightShifts}
            onChange={handleChange}
            required
          />
          <TextField
            label="Min Rest After Night Shifts (hours)"
            name="minRestAfterNightShifts"
            type="number"
            fullWidth
            margin="normal"
            value={policy.minRestAfterNightShifts}
            onChange={handleChange}
            required
          />
          <TextField
            label="Min Rest After 3 Shifts (hours)"
            name="minRestAfter3Shifts"
            type="number"
            fullWidth
            margin="normal"
            value={policy.minRestAfter3Shifts}
            onChange={handleChange}
            required
          />
          <TextField
            label="Shift Length (hours)"
            name="shiftLengthHours"
            type="number"
            fullWidth
            margin="normal"
            value={policy.shiftLengthHours}
            onChange={handleChange}
            required
          />
          <TextField
            label="Max Hours In Day"
            name="maxHoursInDay"
            type="number"
            fullWidth
            margin="normal"
            value={policy.maxHoursInDay}
            onChange={handleChange}
            required
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Update Policy
            </Button>
          </Box>
        </form>
      </Container>
    </div>
  );
};

export default AdminFatiguePolicy;
