import React, { useState, useEffect } from 'react';
import { Tab, Button } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Link } from 'react-router-dom'
import SwipableView from 'react-swipeable-views'


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
  const tabs = ['home', 'plans', 'history', 'profile', 'verify']
  const [tab, setTab] = useState(tabs.indexOf(window.location.pathname.split('/')[1] || 'home'));
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
              <Tab label="Home" value={0} component={Link} to="/" />
              <Tab label="Workout Plans" value={1} component={Link} to="/plans" />
              <Tab label="History" value={2} component={Link} to="/history" />
              <Tab label="Profile" value={3} component={Link} to="/profile" />
            </TabList>

            {tab === 4
              ? <TabPanel value={4}>
                <Verify />
              </TabPanel>
              : <Authenticate />
            }

            {user._id // Only show tab content when logged in
              ? <SwipableView
                axis="x"
                index={tab}
                enableMouseEvents={true}
                onChangeIndex={(index) => setTab(index)}
                slideStyle={{
                  height: '95vh',
                  position: 'relative'
                }}
              >
                <TabPanel value={0} index={0}>
                  <Tracker planId={planID} exercises={exercises} muted={muted} setMuted={setMuted} />
                </TabPanel>
                <TabPanel value={1} index={1}>
                  <Plans planID={planID} setPlanID={(id) => setPlanID(id)} />
                </TabPanel>
                <TabPanel value={2} index={3}>
                  <HistoryTable />
                </TabPanel>
                <TabPanel value={3} index={4}>
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
              </SwipableView>
              : null
            }
          </TabContext>
        </BrowserRouter>
      </User.Provider>
    </ThemeProvider >
  );
}

export default App;
