import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Tracker from './Tracker.js'
import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'
import HistoryTable from './HistoryTable.js'
import Plans from './Plans.js'
import { Tab } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#FF0000',
    }
  },
});

function App() {
  const [tab, setTab] = useState('home');

  const [user, setUser] = useState({});
  const [exercises, setExercises] = useState([]);
  const [planID, setPlanID] = useState(null)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    fetch('/api/user/current')
      .then(r => console.log(r) || r.json())
      .then(newUser => {
        setUser(newUser);
      })
    fetch('/api/plans/list')
      .then(r => console.log(r) || r.json())
      .then(({ plans }) => {
        setPlans(plans);
      })
  }, []);

  useEffect(() => {
    fetch('/api/workout/next?planId=' + (planID || ''))
      .then(r => console.log(r) || r.json())
      .then(({ planId, exercises, weights }) => {
        exercises.forEach((exercise, i) => exercise.weight = weights[i]);
        if (planId) setPlanID(planId) || console.log('set from', planID, 'to', planId)
        setExercises(exercises);
      });
  }, [user, planID]);

  return (
    <ThemeProvider theme={theme}>
      <User.Provider value={{ ...user, setUser }} >
        <TabContext value={tab}>
          <TabList onChange={(_, newTab) => setTab(newTab)} centered variant="fullWidth">
            <Tab label="Home" value="home" />
            <Tab label="Accessory Workout Plan" value="plans" />
            <Tab label="History" value="history" />
          </TabList>

          <Authenticate />

          {!user._id
            ? null
            : <React.Fragment>
              <TabPanel value="home">
                <Tracker planId={planID} exercises={exercises} />
              </TabPanel>
              <TabPanel value="plans">
                <Plans plans={plans} setPlans={setPlans} planID={planID} setPlanID={(id) => console.log('pid to', id) || setPlanID(id)} />
              </TabPanel>
              <TabPanel value="history">
                <HistoryTable />
              </TabPanel>
            </React.Fragment>
          }
        </TabContext>
      </User.Provider>
    </ThemeProvider>
  );
}

export default App;
