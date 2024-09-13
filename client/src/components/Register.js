import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    letter: "",
    email: "",
    password: "",
    role: "Operator",
    phone: "",
    team: "",
  });

  // State variables for password validation
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  // Teams array
  const teams = ["A", "B", "C", "D"];

  const validatePassword = (password) => {
    setHasMinLength(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[@$!%*?&]/.test(password));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData((prevData) => ({ ...prevData, password: newPassword }));
    validatePassword(newPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
    setFormData((prevData) => ({
      ...prevData,
      phone: formattedPhoneNumber,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      alert("Please ensure the password meets all requirements.");
      return;
    }

    if (formData.role === "Operator" && !formData.letter) {
      alert("The letter field is required for the Operator role.");
      return;
    }

    try {
      const response = await axios.post("/api/register", formData);
      if (response.status === 201) {
        alert("Registration successful! Please log in.");
        navigate("/login"); // Redirect to login after successful registration
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          select
          label="Role"
          fullWidth
          margin="normal"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <MenuItem value="Operator">Operator</MenuItem>
          <MenuItem value="OLMC">OLMC</MenuItem>
          <MenuItem value="Clerk">Clerk</MenuItem>
          <MenuItem value="APS">APS</MenuItem>
        </TextField>

        {formData.role === "APS" && (
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
        )}

        {formData.role === "Operator" && (
          <TextField
            label="Operator Letter"
            fullWidth
            margin="normal"
            name="letter"
            value={formData.letter}
            onChange={handleChange}
            required={formData.role === "Operator"}
          />
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          label="Phone Number"
          type="tel"
          fullWidth
          margin="normal"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          name="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
        />
        <List>
          <ListItem>
            <ListItemIcon>
              {hasMinLength ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText primary="At least 8 characters long" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {hasUpperCase ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText primary="At least one uppercase letter" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {hasNumber ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText primary="At least one number" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              {hasSpecialChar ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </ListItemIcon>
            <ListItemText primary="At least one special character (@$!%*?&)" />
          </ListItem>
        </List>

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Register
          </Button>
        </Box>
      </form>
      <Box mt={2}>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate("/login")} // Navigate back to login page
        >
          Back to Login
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
