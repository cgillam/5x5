import React, { useState, useEffect } from 'react';
import { Tab, Button } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Link } from 'react-router-dom'

import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'
import Tracker from './Tracker.js'
import HistoryTable from './HistoryTable.js'
import Plans from './Plans.js'
import Verify from "./Verify.js"
import Profile from "./Profile.js"
import ProfileSearch from "./ProfileSearch.js"


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

const generateWeightToggles = user => ({
  toUserWeight: lb => {
    return user.conversion === 'lb' ? lb : lb / 2.205;
  },
  fromUserWeight: weight => {
    return user.conversion === 'lb' ? weight : weight * 2.205;
  }
})

function App() {
  // Keep track of the currently selected tab
  const [tab, setTab] = useState(window.location.pathname.split('/')[1] || 'home');
  // Sound mute state
  const [muted, setMuted] = useState(false);

  // Currently logged in user
  const [user, setLogggedInUser] = useState({});
  const setUser = (...args) => {
    setLogggedInUser(...args);
    setProfileUser(...args);
  }
  const [profileUser, setProfileUser] = useState({});
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

  const fullUser = {
    ...user,
    ...generateWeightToggles(user),
    setUser
  };

  return (
    <ThemeProvider theme={theme}>
      <User.Provider value={fullUser} >
        <BrowserRouter>
          <TabContext value={tab}>
            <TabList onChange={(_, newTab) => setTab(newTab)} centered variant="fullWidth">
              <Tab label="Home" value="home" component={Link} to="/" />
              <Tab label="Workout Plans" value="plans" component={Link} to="/plans" />
              <Tab label="History" value="history" component={Link} to="/history" />
              {user._id ? <Tab label="Profile" value="profile" component={Link} to="/profile" /> : []}
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
                  <Plans planID={planID} setPlanID={(id) => setPlanID(id)} />
                </TabPanel>
                <TabPanel value="history">
                  <HistoryTable />
                </TabPanel>
                <TabPanel value="profile">
                  <User.Provider value={{
                    ...profileUser,
                    ...generateWeightToggles(profileUser),
                    setUser: setProfileUser
                  }} >
                    <ProfileSearch loggedUser={fullUser} />
                    <User.Consumer>
                      {profileUser => <Profile self={user._id === profileUser._id} loggedUser={fullUser} />}
                    </User.Consumer>
                  </User.Provider>
                </TabPanel>
              </React.Fragment>
              : null
            }
          </TabContext>
        </BrowserRouter>
      </User.Provider>
    </ThemeProvider >
  );
}

export default App;
