import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Home = () => {
  const [events, setEvents] = useState([
    {
      title: 'Day Shift - John Doe',
      start: new Date(2024, 7, 18, 9, 0, 0), // Example date (August 18, 2024)
      end: new Date(2024, 7, 18, 17, 0, 0),
      allDay: false,
    },
    {
      title: 'Night Shift - Jane Smith',
      start: new Date(2024, 7, 18, 21, 0, 0),
      end: new Date(2024, 7, 19, 5, 0, 0),
      allDay: false,
    },
    {
      title: 'Vacation - Alice Brown',
      start: new Date(2024, 7, 20),
      end: new Date(2024, 7, 23),
      allDay: true,
    },
  ]);

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Operations Schedule
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '80vh' }}
        defaultView="month"
      />
    </Container>
  );
};

export default Home;
