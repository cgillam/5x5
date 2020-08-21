import React, { useState, useEffect } from 'react';
import Lift from './Lift.js';
import Exercise from './exercise.js';

const DEFAULT_WEIGHT = 145;

export default function Tracker({ exercises }) {
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const exercise = exercises[exerciseIndex];

    const [weights, setWeights] = useState([]);

    const [formWeight, setFormWeight] = useState(DEFAULT_WEIGHT);
    const [weight, setWeight] = useState();

    useEffect(() => {
        if (exercise) {
            if (!exercise.weight) setFormWeight(DEFAULT_WEIGHT)
            else setFormWeight(exercise.weight);
            return;
        }
        if (!exercises.length) return;

        fetch('/api/workout/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exerciseIDs: exercises.map(exercise => exercise._id),
                weights
            })
        }).then(console.log);
    }, [exercise]);

    if (!exercise) return <h1>All exercises completed</h1>

    const content = (weight
        ? <React.Fragment>
            <button onClick={() => setWeight(undefined)}>{weight}</button>
            <Lift nextLift={() => {
                setExerciseIndex(exerciseIndex + 1);
                setWeight(undefined);
                setWeights([...weights, weight]);
            }} />
        </React.Fragment>
        : <form onSubmit={(e) => {
            e.preventDefault()
            setWeight(formWeight);
        }}>
            <button>Set weight</button>
            <input type="number" min="0" max="1000" step="0.1" value={formWeight} onChange={(e) => {
                setFormWeight(e.target.value);
            }} />
        </form >
    )

    return (
        <React.Fragment>
            <Exercise.Provider value={exercise}>
                <h2>{exercise.title}</h2>
                {content}
            </Exercise.Provider>
        </React.Fragment>
    )
}