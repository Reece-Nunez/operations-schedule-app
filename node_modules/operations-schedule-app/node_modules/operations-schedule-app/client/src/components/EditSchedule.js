import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, MenuItem, Select, FormControl, InputLabel, Grid, Modal, Box, TextField } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import { DateRangePicker } from 'react-date-range';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-date-range/dist/styles.css'; // Main css file
import 'react-date-range/dist/theme/default.css'; // Theme css file
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
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [operators, setOperators] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [unpublishedEvents, setUnpublishedEvents] = useState([]);

    const [newEvent, setNewEvent] = useState({
        operatorId: '',
        shift: '',
        job: '',
        startDate: new Date(),
        endDate: new Date(),
    });

    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    useEffect(() => {
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

                const unpublished = response.data.filter(event => !event.published);
                setUnpublishedEvents(unpublished);
                setEvents(response.data.filter(event => event.published));
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

    const handleDateRangeChange = (ranges) => {
        const { selection } = ranges;
        setRange([selection]);
        setNewEvent({
            ...newEvent,
            startDate: selection.startDate,
            endDate: selection.endDate
        });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
    
            if (!token) {
                throw new Error('No token found');
            }
    
            const timezone = 'America/Chicago'; // Central Time
    
            // Find the selected operator's name
            const selectedOperator = operators.find(operator => operator.id === newEvent.operatorId);
    
            const event = {
                operatorId: newEvent.operatorId,
                title: `${selectedOperator.name} - ${newEvent.shift} Shift`,
                start: moment.tz(newEvent.startDate, timezone)
                            .set({ hour: newEvent.shift === 'Day' ? 4 : 16, minute: 45 })
                            .toDate(),
                end: moment.tz(newEvent.endDate, timezone)
                            .set({ hour: newEvent.shift === 'Day' ? 16 : 4, minute: 45 })
                            .add(newEvent.shift === 'Night' ? 1 : 0, 'day') // Correctly handle overnight shifts
                            .toDate(),
                shift: newEvent.shift,
                job: newEvent.job
            };
    
            console.log("Submitting event data:", event);
    
            const response = await axios.post('/api/events', event, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setUnpublishedEvents([...unpublishedEvents, response.data]);
            setNewEvent({
                operatorId: '',
                shift: '',
                job: '',
                startDate: new Date(),
                endDate: new Date(),
            });
            setRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handlePublish = async () => {
        try {
            const token = localStorage.getItem('token');
    
            if (!token) {
                throw new Error('No token found');
            }
    
            await Promise.all(
                unpublishedEvents.map(event => 
                    axios.put(`/api/events/${event.id}/publish`, {}, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                )
            );
    
            setEvents([...events, ...unpublishedEvents]);
            setUnpublishedEvents([]);
        } catch (error) {
            console.error('Error publishing events:', error);
        }
    };
    

    const handleSelectEvent = (event) => {
        setSelectedEvent({
            ...event,
            start: new Date(event.start), // Convert to JavaScript Date object
            end: new Date(event.end), // Convert to JavaScript Date object
        });
        setModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedEvent({ ...selectedEvent, [name]: value });
    };

    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
    
            const updatedEvent = {
                ...selectedEvent,
                start: moment(selectedEvent.start).toDate(), // Convert to JavaScript Date object
                end: moment(selectedEvent.end).toDate() // Convert to JavaScript Date object
            };
    
            await axios.put(`/api/events/${selectedEvent.id}`, updatedEvent, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const updatedUnpublishedEvents = unpublishedEvents.map((evt) => (evt.id === updatedEvent.id ? updatedEvent : evt));
            setUnpublishedEvents(updatedUnpublishedEvents);
            setModalOpen(false);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const eventPropGetter = (event) => {
        const backgroundColor = jobColors[event.job] || 'gray';
        return { style: { backgroundColor } };
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
            <Grid container direction="column" alignItems="center" spacing={2}>
                <Grid item xs={12} container justifyContent='center'>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={() => navigate('/')}
                        style={{ marginBottom: '1rem' }}
                    >
                        Back
                    </Button>
                </Grid>
                <Grid item xs={12} container justifyContent='center'>
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
                            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                                Add Event
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Button variant="contained" color="secondary" onClick={handlePublish} fullWidth>
                                Publish Events
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Calendar
                localizer={localizer}
                events={unpublishedEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '80vh', marginTop: '2rem' }}
                defaultView="month"
                eventPropGetter={eventPropGetter}
                onSelectEvent={handleSelectEvent}
            />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="edit-event-modal"
                aria-describedby="edit-event-modal-description"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Typography id="edit-event-modal" variant="h6" component="h2" gutterBottom>
                        Edit Event
                    </Typography>
                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        value={selectedEvent?.title || ''}
                        onChange={handleEditChange}
                        margin="normal"
                    />
                    <TextField
                        name="job"
                        label="Job"
                        fullWidth
                        value={selectedEvent?.job || ''}
                        onChange={handleEditChange}
                        margin="normal"
                    />
                    <TextField
                        name="start"
                        label="Start"
                        type="datetime-local"
                        fullWidth
                        value={selectedEvent ? moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm') : ''}
                        onChange={handleEditChange}
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
                        value={selectedEvent ? moment(selectedEvent.end).format('YYYY-MM-DDTHH:mm') : ''}
                        onChange={handleEditChange}
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <Grid container justifyContent="space-between" sx={{ marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleEditSubmit}>
                            Save
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                    </Grid>
                </Box>
            </Modal>
        </Container>
    );
};

export default EditSchedule;
