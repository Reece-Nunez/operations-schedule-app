import React, { useState, useEffect } from 'react';
import { Container, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import Logout from './Logout';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const jobColors = {
  'FCC Console': 'blue',
  'VRU Console': 'green',
  '#1 Out': 'yellow',
  '#2 Out': 'orange',
  '#3 Out': 'red',
  'Tank Farm': 'purple',
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

const Home = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchPublishedEvents = async () => {
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

        setEvents(response.data.filter(event => event.published));  // Only show published events
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchPublishedEvents();
  }, []);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleMenuItemClick = (path, isExternal = false) => {
    if (isExternal) {
      window.location.href = path;
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
  };

  const eventPropGetter = (event) => {
    const backgroundColor = jobColors[event.job] || 'gray'; // Fallback color if job is not found
    return { style: { backgroundColor } };
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
            <ListItem button onClick={() => handleMenuItemClick('/profile')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            <ListItem button onClick={() => handleMenuItemClick('/schedule')}>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary="Schedule" />
            </ListItem>

            <ListItem button onClick={() => handleMenuItemClick('https://mytools.ephillips66.com/', true)}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="My Tools" />
            </ListItem>

            {['OLMC', 'Clerk', 'APS', 'Admin'].includes(user.role) && (
              <>
                <ListItem button onClick={() => handleMenuItemClick('/edit-schedule')}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="Edit Schedule" />
                </ListItem>
                <ListItem button onClick={() => handleMenuItemClick('/manage-operators')}>
                  <ListItemIcon>
                    <SupervisorAccountIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Operators" />
                </ListItem>
              </>
            )}

            {user.role === 'Admin' && (
              <ListItem button onClick={() => handleMenuItemClick('/admin-panel')}>
                <ListItemIcon>
                  <SupervisorAccountIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}

            <Logout />
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" style={{ marginTop: '4rem' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Operations Schedule
        </Typography>

        <Calendar
          localizer={localizer}
          events={events}  // Show only published events
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh' }}
          defaultView="month"
          eventPropGetter={eventPropGetter}
        />
        <Legend />
      </Container>
    </div>
  );
};

export default Home;
