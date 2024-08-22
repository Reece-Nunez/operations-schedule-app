import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useUser } from '../contexts/UserContext';

const localizer = momentLocalizer(moment);

const jobColors = {
'FCC Console': 'blue',
'VRU Console': 'green',
'#1 Out': 'yellow',
'#2 Out': 'orange',
'#3 Out': 'red',
'Tank Farm': 'purple',
};

const EditSchedule = () => {
const { user } = useUser();
const [events, setEvents] = useState([]);
const [operators, setOperators] = useState([]);
const [newEvent, setNewEvent] = useState({
    operatorId: '',
    shift: '',
    job: '',
    startDate: null, // Changed to null to use with DatePicker
    start: '',
    end: '',
});

useEffect(() => {
    // Fetch operators with token authentication
    const fetchOperators = async () => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
        throw new Error('No token found');
        }

        const response = await axios.get('/api/operators', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        setOperators(response.data);
    } catch (error) {
        console.error('Error fetching operators', error);
    }
    };

    // Fetch events with token authentication
    const fetchEvents = async () => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
        throw new Error('No token found');
        }

        const response = await axios.get('/api/events', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });

        setEvents(response.data);
    } catch (error) {
        console.error('Error fetching events', error);
    }
    };

    fetchOperators();
    fetchEvents();
}, []);

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
};

const handleDateChange = (date) => {
    setNewEvent({ ...newEvent, startDate: date });
};

const handleSubmit = async () => {
    try {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No token found');
    }

    const start = moment(newEvent.startDate).set({ hour: newEvent.shift === 'Day' ? 4 : 16, minute: 45 }).toDate();
    const end = moment(start).add(12, 'hours').toDate(); // Corrected end time calculation
    const event = { ...newEvent, start, end };

    const response = await axios.post('/api/events', event, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    setEvents([...events, response.data]);
    setNewEvent({
        operatorId: '',
        shift: '',
        job: '',
        startDate: null, // Reset to null after submission
        start: '',
        end: '',
    });
    } catch (error) {
    console.error('Error adding event:', error);
    }
};

const eventPropGetter = (event) => {
    const backgroundColor = jobColors[event.job] || 'gray';
    return { style: { backgroundColor } };
};

return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
    <Typography variant="h4" component="h2" gutterBottom>
        Edit Schedule
    </Typography>

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

    <DatePicker
        label="Select Date"
        value={newEvent.startDate}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
    />

    <Button variant="contained" color="primary" onClick={handleSubmit}>
        Add Event
    </Button>

    <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh', marginTop: '2rem' }}
        defaultView="month"
        eventPropGetter={eventPropGetter}
    />
    </Container>
);
};

export default EditSchedule;
