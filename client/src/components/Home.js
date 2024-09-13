import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Drawer, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Grid, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import Logout from './Logout';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

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
      [...new Set(events.map(event => event.operatorId))].map(operatorId => ({
        id: operatorId,
        content: operatorMap[operatorId] || `Operator ${operatorId}`,
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
  
    // If timelineInstance doesn't exist yet, create a new one
    if (!timelineInstance.current) {
      timelineInstance.current = new Timeline(container, items, groups, options);
    } else {
      // Update existing timeline with new items and groups
      timelineInstance.current.setItems(items);
      timelineInstance.current.setGroups(groups);
    }
  
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

      <Container maxWidth="lg" style={{ marginTop: '4rem' }}>
        <Typography variant="h3" component="h1" gutterBottom align='center'>
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
            <Box ref={timelineRef} sx={{ width: "100%", minWidth: "800px" }} />
          </Box>
        </Grid>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box ref={timelineRef} sx={{ width: "100%", minWidth: "800px", height: '70vh' }} />
        </Box>
        <Legend />
      </Container>
    </div>
  );
};

export default Home;
