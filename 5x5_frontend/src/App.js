import React, { useState, useEffect } from 'react';
import { Tab, Button } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'
import Tracker from './Tracker.js'
import HistoryTable from './HistoryTable.js'
import Plans from './Plans.js'
import Verify from "./Verify.js"


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#FF0000',
    },
    secondary: {
      main: '#FF0000',
    }
  },
});


function App() {
  // Keep track of the currently selected tab
  const [tab, setTab] = useState(
    window.location.pathname === "/verify"
      ? "verify"
      : 'home'
  );
  // Sound mute state
  const [muted, setMuted] = useState(false);

  // Currently logged in user
  const [user, setUser] = useState({});
  // Exercises to workout to
  const [exercises, setExercises] = useState([]);
  // Plan exercises belong to
  const [planID, setPlanID] = useState(null)

  // Fetch the current user on mount
  useEffect(() => {
    fetch('/api/user/current')
      .then(r => r.json())
      .then(currUser => setUser(currUser))
      .catch(console.error)
  }, []);

  // Fetch the current plan whenever the user changes or the plan ID is updated
  useEffect(() => {
    fetch('/api/workout/next?planId=' + (planID || ''))
      .then(r => r.json())
      .then(({ planId, exercises, weights }) => {
        // Add weights to all the exercises
        exercises.forEach((exercise, i) => exercise.weight = weights[i]);
        // Set the plan id if it's not-null
        if (planId) setPlanID(planId)

        setExercises(exercises);
      });
  }, [user, planID]);

  return (
    <ThemeProvider theme={theme}>
      <User.Provider value={{
        ...user, setUser, toUserWeight: lb => {
          return user.conversion === 'lb' ? lb : lb / 2.205;
        }, fromUserWeight: weight => {
          return user.conversion === 'lb' ? weight : weight * 2.205;
        }
      }} >
        <TabContext value={tab}>
          <TabList onChange={(_, newTab) => {
            if (newTab === 'logout') {
              setUser({});
              return fetch("/api/user/logout", { credentials: 'include' });
            }
            setTab(newTab)
          }} centered variant="fullWidth">
            <Tab label="Home" value="home" />
            <Tab label="Workout Plans" value="plans" />
            <Tab label="History" value="history" />
            {user._id ? <Tab label="Logout" value="logout" /> : []}
          </TabList>

          {tab === "verify"
            ? <TabPanel value="verify">
              <Verify />
            </TabPanel>
            : <Authenticate />
          }

          {user._id // Only show tab content when logged in
            ? <React.Fragment>
              <TabPanel value="home">
                <Tracker planId={planID} exercises={exercises} muted={muted} setMuted={setMuted} />
              </TabPanel>
              <TabPanel value="plans">
                <Plans planID={planID} setPlanID={(id) => console.log('pid to', id) || setPlanID(id)} />
              </TabPanel>
              <TabPanel value="history">
                <HistoryTable />
              </TabPanel>
            </React.Fragment>
            : null
          }
        </TabContext>
      </User.Provider>
    </ThemeProvider >
  );
}

export default App;
