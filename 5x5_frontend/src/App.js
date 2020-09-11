import React, { useState, useEffect, Suspense } from 'react';
import { Tab, useMediaQuery } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Link } from 'react-router-dom'
import SwipableView from 'react-swipeable-views'

import './App.css';
import User from './user.js';
const Authenticate = React.lazy(() => import('./authenticate.js'));
const HistoryTable = React.lazy(() => import('./HistoryTable.js'));
const Plans = React.lazy(() => import('./Plans.js'));
const Profile = React.lazy(() => import("./Profile.js"));
const ProfileSearch = React.lazy(() => import("./ProfileSearch.js"));
const Tracker = React.lazy(() => import('./Tracker.js'));
const Verify = React.lazy(() => import("./Verify.js"));


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

// Generate weight conversion methods for the given user
const generateWeightToggles = user => ({
  toUserWeight: lb => {
    return user.conversion === 'lb' ? lb : lb / 2.205;
  },
  fromUserWeight: weight => {
    return user.conversion === 'lb' ? weight : weight * 2.205;
  }
})

const Loading = <h1>...</h1>

function App() {
  // For swipeable, tab value must be index - so use an array to represent the order
  const tabs = ['home', 'plans', 'history', 'profile', 'verify']
  const [tab, setTab] = useState(tabs.indexOf(window.location.pathname.split('/')[1] || 'home'));
  // Sound mute state
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true)

  const isMobile = useMediaQuery('(max-width:600px)');

  // Currently logged in user
  const [user, setLogggedInUser] = useState({});
  // Ensure profile user is updated whenever logged in user is updated
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
      .then(() => setLoading(false))
  }, []);

  // Fetch the current plan whenever the user changes or the plan ID is updated
  useEffect(() => {
    if (loading) return;
    fetch('/api/workout/next?planId=' + (planID || ''))
      .then(r => r.json())
      .then(({ planId, exercises, weights }) => {
        // Add weights to all the exercises
        exercises.forEach((exercise, i) => exercise.weight = weights[i]);
        // Set the plan id if it's not-null
        if (planId) setPlanID(planId)

        setExercises(exercises);
      });
  }, [user, planID, loading]);

  // Full logged in user object - with methods
  const loggedUser = {
    ...user,
    ...generateWeightToggles(user),
    setUser
  };

  return (
    <ThemeProvider theme={theme}>
      <User.Provider value={loggedUser} >
        <BrowserRouter>
          <TabContext value={tab}>
            <header style={{
              color: '#ffffff',
              backgroundColor: '#000000',
              paddingBottom: '0.5em'
            }}>
              <p style={{
                fontSize: '18pt',
                paddingLeft: isMobile ? '0' : '5em',
                textAlign: isMobile ? 'center' : 'unset',
                marginTop: '0',
                transition: 'all 1s'
              }}>Fitness Training App</p>
              {user._id
                ? <TabList onChange={(_, newTab) => setTab(newTab)} centered variant="fullWidth" orientation={isMobile ? 'vertical' : 'horizontal'}>
                  <Tab style={{ fontSize: '14pt' }} label="Home" value={0} component={Link} to="/" />
                  <Tab style={{ fontSize: '14pt' }} label="Workout Plans" value={1} component={Link} to="/plans" />
                  <Tab style={{ fontSize: '14pt' }} label="History" value={2} component={Link} to="/history" />
                  <Tab style={{ fontSize: '14pt' }} label="Profile" value={3} component={Link} to="/profile" />
                </TabList>
                : null
              }
            </header>
            <main style={{
              backgroundColor: '#2e2e2e',
              height: '100%'
            }}>
              {tab === 4 // Show authenticate component on all but the verify tab
                ? <TabPanel value={4}>
                  <Suspense fallback={Loading}>
                    <Verify />
                  </Suspense>
                </TabPanel>
                :
                <Suspense fallback={Loading}>
                  <Authenticate />
                </Suspense>
              }

              {user._id // Only show tab content when logged in
                ? <SwipableView
                  axis="x"
                  index={tab}
                  enableMouseEvents={true}
                  onChangeIndex={(index) => setTab(index)}
                  slideStyle={{
                    position: 'relative'
                  }}
                >
                  <TabPanel value={0} index={0}>
                    <Suspense fallback={Loading}>
                      <Tracker planId={planID} exercises={exercises} muted={muted} setMuted={setMuted} />
                    </Suspense>
                  </TabPanel>
                  <TabPanel value={1} index={1}>
                    <Suspense fallback={Loading}>
                      <Plans planID={planID} setPlanID={(id) => setPlanID(id)} />
                    </Suspense>
                  </TabPanel>
                  <TabPanel value={2} index={3}>
                    <Suspense fallback={Loading}>
                      <HistoryTable />
                    </Suspense>
                  </TabPanel>
                  <TabPanel value={3} index={4}>
                    <User.Provider value={{ // User provider for profile user, while logged in user is delivered via props
                      ...profileUser,
                      ...generateWeightToggles(profileUser),
                      setUser: setProfileUser
                    }} >
                      <Suspense fallback={Loading}>
                        <ProfileSearch loggedUser={loggedUser} />
                      </Suspense>
                      <User.Consumer>
                        {profileUser =>
                          <Suspense fallback={Loading}>
                            <Profile self={user._id === profileUser._id} loggedUser={loggedUser} />
                          </Suspense>
                        }
                      </User.Consumer>
                    </User.Provider>
                  </TabPanel>
                </SwipableView>
                : null
              }
            </main>
          </TabContext>
        </BrowserRouter>
      </User.Provider>
    </ThemeProvider >
  );
}

export default App;
