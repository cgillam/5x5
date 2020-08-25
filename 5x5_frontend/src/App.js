import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Tracker from './Tracker.js'
import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'
import HistoryTable from './HistoryTable.js'
import Plans from './Plans.js'

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

  const content = tab === 'home'
    ? <React.Fragment>
      <Tracker planId={planID} exercises={exercises} />
      <Plans plans={plans} setPlans={setPlans} planID={planID} setPlanID={(id) => console.log('pid to', id) || setPlanID(id)} />
    </React.Fragment>
    : <HistoryTable />;

  return (
    <div className="App">
      <User.Provider value={{ ...user, setUser }} >
        <ul style={{ listStyle: 'none' }}>
          <li><button onClick={() => setTab('home')}>Home</button></li>
          <li><button onClick={() => setTab('history')}>History</button></li>
        </ul>
        <Authenticate />
        {!user._id
          ? <p>User must log in to use app</p>
          : content
        }
      </User.Provider>
    </div>
  );
}

export default App;
