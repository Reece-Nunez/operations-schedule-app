import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import {
  Button,
  List,
  ListItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  InputLabel,
  Checkbox,
  ListItemText,
  Box,
  IconButton,
  Grid,
  Paper,
  Drawer,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

const ManageOperators = () => {
  const { user } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [apsUsers, setApsUsers] = useState([]); // State to hold APS users
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    letter: "",
    employeeId: "",
    phone: "",
    jobs: [],
    team: "", // Add team field
  });

  const availableJobs = [
    "FCC Console",
    "VRU Console",
    "#1 Out",
    "#2 Out",
    "#3 Out",
    "Tank Farm",
  ];
  const teams = ["A", "B", "C", "D", "Replacement", "Probationary"];

  // Fetch all operators
  useEffect(() => {
    if (["Clerk", "OLMC", "APS", "Admin"].includes(user?.role)) {
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get("/api/operators", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log("Operators Data:", response.data);
            setOperators(response.data);
          })
          .catch((error) => console.error("Error fetching APS users:", error));
      }
    }
  }, [user]);

  // Fetch all APS users
  useEffect(() => {
    if (["Clerk", "OLMC", "APS", "Admin"].includes(user?.role)) {
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get("/api/aps", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log("APS Data:", response.data);
            setApsUsers(response.data); // Set the APS users to state
          })
          .catch((error) => console.error("Error fetching APS users:", error));
      }
    }
  }, [user]);

  const handleOpen = (operator = null) => {
    if (operator) {
      setSelectedOperator(operator);
      setFormData({
        name: operator.name,
        letter: operator.letter,
        employeeId: operator.employeeId,
        phone: formatPhoneNumber(operator.phone), // Format the phone number
        email: operator.email || "",
        jobs: operator.jobs || [],
        team: operator.team || "", // Populate team
      });
    } else {
      setSelectedOperator(null);
      setFormData({
        name: "",
        letter: "",
        employeeId: "",
        phone: "",
        email: "",
        jobs: [],
        team: "", // Default to empty string
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOperator(null);
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, ""); // Remove all non-digit characters
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setFormData((prevState) => ({
      ...prevState,
      phone: formattedPhoneNumber,
    }));
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.letter ||
      !formData.phone ||
      !formData.employeeId
    ) {
      console.error(
        "All required fields must be filled, including Employee ID."
      );
      return;
    }

    const updatedFormData = { ...formData };

    try {
      const token = localStorage.getItem("token");
      let response;

      if (selectedOperator && selectedOperator.id) {
        response = await axios.put(
          `/api/operators/${selectedOperator.id}`,
          updatedFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOperators(
          operators.map((op) =>
            op.id === selectedOperator.id ? response.data : op
          )
        );
      } else {
        response = await axios.post("/api/operators", updatedFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOperators([...operators, response.data]);
      }

      handleClose();
    } catch (error) {
      console.error(
        "Error saving operator:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleDelete = async (operatorId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/operators/${operatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOperators(operators.filter((op) => op.id !== operatorId));
    } catch (error) {
      console.error("Error deleting operator:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleJobChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prevState) => ({
      ...prevState,
      jobs: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // Group Operators by team
  const groupedOperators = operators.reduce((groups, operator) => {
    const team = operator.team || "No Team";
    if (!groups[team]) {
      groups[team] = { aps: null, operators: [] };
    }

    if (operator.role === "APS") {
      groups[team].aps = operator; // Assign APS to the team
    } else {
      groups[team].operators.push(operator); // Add regular operator
    }

    return groups;
  }, {});

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
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
        padding="1rem"
      >
        <Box width="100%" maxWidth="1200px" textAlign="center">
          <Typography variant="h4" gutterBottom>
            Manage Operators
          </Typography>
          {["Clerk", "OLMC", "APS", "Admin"].includes(user?.role) ? (
            <>
              <Grid container spacing={3} justifyContent="center">
                {teams.map((team) => (
                  <Grid item xs={12} sm={6} md={4} key={team}>
                    <Paper
                      elevation={3}
                      style={{ padding: "1rem", minHeight: "200px" }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Team {team}
                      </Typography>

                      {/* Display APS from the new state */}
                      {apsUsers
                        .filter((aps) => aps.team === team)
                        .map((apsUser) => (
                          <Typography
                            key={apsUser.id}
                            variant="body2"
                            gutterBottom
                          >
                            <strong>APS:</strong> {apsUser.name} -{" "}
                            {apsUser.phone}
                          </Typography>
                        ))}

                      <List>
                        {groupedOperators[team]?.operators.length > 0 ? (
                          groupedOperators[team].operators.map((operator) => (
                            <ListItem
                              key={operator.id}
                              style={{ display: "block", marginBottom: "10px" }}
                            >
                              <Typography variant="body1">
                                <strong>
                                  {operator.name} - {operator.letter}
                                </strong>
                              </Typography>
                              <Typography variant="body2">
                                <strong>Phone:</strong> {operator.phone}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Jobs:</strong>{" "}
                                {operator.jobs.join(" | ")}
                              </Typography>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                marginTop="0.5rem"
                              >
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleOpen(operator)}
                                >
                                  Edit
                                </Button>
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handleDelete(operator.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </ListItem>
                          ))
                        ) : (
                          <Typography variant="body2">
                            No operators in this team
                          </Typography>
                        )}
                      </List>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Add Operator Button */}
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpen()}
                >
                  Add Operator
                </Button>
              </Box>
            </>
          ) : (
            <p>You do not have permission to manage operators.</p>
          )}
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {selectedOperator ? "Edit Operator" : "Add Operator"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="letter"
              label="Letter"
              type="text"
              fullWidth
              value={formData.letter}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="employeeId"
              label="Employee ID"
              type="text"
              fullWidth
              value={formData.employeeId}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone"
              type="text"
              fullWidth
              value={formData.phone}
              onChange={handlePhoneChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="jobs-label">Jobs</InputLabel>
              <Select
                labelId="jobs-label"
                multiple
                value={formData.jobs}
                onChange={handleJobChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {availableJobs.map((job) => (
                  <MenuItem key={job} value={job}>
                    <Checkbox checked={formData.jobs.indexOf(job) > -1} />
                    <ListItemText primary={job} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="team-label">Team</InputLabel>
              <Select
                labelId="team-label"
                name="team"
                value={formData.team}
                onChange={handleChange}
              >
                {teams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              {selectedOperator ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default ManageOperators;
