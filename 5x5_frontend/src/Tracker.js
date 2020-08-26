import React, { useState, useEffect } from 'react';
import Lift from './Lift.js';
import Exercise from './exercise.js';
import { Delay } from './helper.js';
import { Button, TextField, Dialog, Paper } from '@material-ui/core'

const DEFAULT_WEIGHT = 145;

export default function Tracker({ planId, exercises }) {
    const [started, setStarted] = useState(false);

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
                planid: planId,
                exerciseIDs: exercises.map(exercise => exercise._id),
                weights,
                comments
            })
        }).then(console.log);
    }, [exercise]);

    if (!exercise) return <h1>All exercises completed</h1>

    const content = (weight
        ? <div style={{ flex: '2' }}>
            <Lift nextLift={async (comment) => {
                setAnimating(3);
                await Delay(1000);
                setAnimating(1);
                await Delay(1000);
                setAnimating(2);

                setWeights([...weights, weight]);
                setComments([...comments, comment]);
                setExerciseIndex(exerciseIndex + 1);
                setWeight(undefined);
            }} />
        </div>
        : <form onSubmit={(e) => {
            e.preventDefault()
            setWeight(formWeight);
        }} style={{
            flex: '2'
        }}>
            <Paper style={{
                display: 'flex',
                flexDirection: 'column',
                width: '50%',
                margin: 'auto',
                backgroundColor: 'black',
                color: 'white',
                padding: '1em'
            }}>
                <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} type="number" min="0" max="1000" step="0.1" value={formWeight} onChange={(e) => {
                    setFormWeight(e.target.value);
                }} />
                <br />
                <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit">Set weight</Button>
            </Paper>
        </form >
    )

    return (
        <React.Fragment>
            <Button onClick={() => setStarted(true)}>Start</Button>
            <Dialog
                open={started}
                onClose={() => setStarted(false)}
                scroll="body"
                classes={{ paperScrollBody: 'exercise-modal ' + (animating === 2 ? '' : animating === 1 ? "entering" : "leaving") }}
                fullWidth={true}
                maxWidth={'sm'}
            >
                <div className="tracker">
                    <Exercise.Provider value={exercise}>
                        <h2 style={{ flex: '1', zIndex: 11 }}>{exercise.title}</h2>
                        {content}
                    </Exercise.Provider>
                </div>
            </Dialog>
        </React.Fragment>
    )
}