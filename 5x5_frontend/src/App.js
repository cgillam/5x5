import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Tracker from './Tracker.js'
import './App.css';
import User from './user.js';
import Authenticate from './authenticate.js'

function App() {
  const [user, setUser] = useState({});
  const [exercises, setExercises] = useState([]);
  console.log(exercises)

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

  return (
    <div className="App">
      <User.Provider value={{ ...user, setUser }} >
        <Tracker exercises={exercises} />
        <Authenticate />
      </User.Provider>
    </div>
  );
}

export default App;
