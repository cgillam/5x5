import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Tracker from './Tracker.js'
import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'
import HistoryTable from './HistoryTable.js'

function App() {
  const [tab, setTab] = useState('history');

  const [user, setUser] = useState({});
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetch('/api/user/current')
      .then(r => console.log(r) || r.json())
      .then(newUser => {
        setUser(newUser);
      })
  }, []);

  useEffect(() => {
    fetch('/api/workout/next')
      .then(r => console.log(r) || r.json())
      .then(({ exercises, weights }) => {
        exercises.forEach((exercise, i) => exercise.weight = weights[i]);
        setExercises(exercises);
      });
  }, [user]);

  const content = tab === 'home'
    ? <Tracker exercises={exercises} />
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
