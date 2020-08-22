import React, { useState, useEffect } from 'react';
import Lift from './Lift.js';
import Exercise from './exercise.js';
import { Delay } from './helper.js';

const DEFAULT_WEIGHT = 145;

export default function Tracker({ exercises }) {

    const [animating, setAnimating] = useState(2);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const exercise = exercises[exerciseIndex];

    const [weights, setWeights] = useState([]);
    const [comments, setComments] = useState([]);

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
                weights,
                comments
            })
        }).then(console.log);
    }, [exercise]);

    if (!exercise) return <h1>All exercises completed</h1>

    const content = (weight
        ? <div>
            <Lift nextLift={async (comment) => {
                setAnimating(3);
                await Delay(1000);
                setAnimating(1);
                await Delay(1000);
                setAnimating(2);

                setExerciseIndex(exerciseIndex + 1);
                setWeight(undefined);
                setWeights([...weights, weight]);
                setComments([...comments, comment]);
            }} />
        </div>
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
        <div className={
            "tracker " +
            (animating === 2 ? '' : animating === 1 ? "entering" : "leaving")
        }>
            <Exercise.Provider value={exercise}>
                <h2>{exercise.title}</h2>
                {content}
            </Exercise.Provider>
        </div>
    )
}