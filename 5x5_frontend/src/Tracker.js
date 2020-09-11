import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, TextField, Dialog, Paper, Grid } from '@material-ui/core'

import Lift from './Lift.js';
import Exercise from './exercise.js';
import UserContext from './user.js';
import { Delay } from './helper.js';


const DEFAULT_WEIGHT = 145;

export default function Tracker({ planId, exercises, muted, setMuted }) {
    const { userName, toUserWeight, fromUserWeight } = useContext(UserContext);
    // If the track is started
    const [started, setStarted] = useState(false);
    // If showing help image
    const [help, setHelp] = useState(false);

    const [paused, setPaused] = useState(0);

    // Stage of enter/normal/exit animation
    const [animating, setAnimating] = useState(2);

    // Current exercise
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const exercise = exercises[exerciseIndex];

    // Weights, comments, and image to send to server at end of workout
    const [weights, setWeights] = useState([]);
    const [comments, setComments] = useState([]);
    const [image, setImage] = useState();

    // Weight of form, and final user weight
    const [formWeight, setFormWeight] = useState(toUserWeight(DEFAULT_WEIGHT));
    const [weight, setWeight] = useState();

    useEffect(useCallback(() => {
        if (exercise) {
            // Set the form weight to the suggested weight of default weight
            if (!exercise.weight) setFormWeight(toUserWeight(DEFAULT_WEIGHT))
            else setFormWeight(toUserWeight(exercise.weight));
            return;
        }
        // Don't submit if there are no exercises
        if (!exercises.length) return;

        // If the current exercise is null - index has extended all exercises
        // then submit the completed workout
        fetch('/api/workout/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planid: planId,
                exerciseIDs: exercises.map(exercise => exercise._id),
                weights,
                comments,
                image
            })
        });
    }, [comments, exercises, image, planId, toUserWeight, weights, exercise]), [exercise]);

    // If there is no exercise, show completed message
    if (!exercise) return <h1>All exercises completed</h1>

    // If user has submitted weight, display lift, otherwise display form
    const content = (weight
        ? <div style={{ flex: '2' }}>
            {userName === 'skipper' // The user of "skipper" can skip to the last exercise
                ? <button onClick={() => setExerciseIndex(exercises.length - 1)}>Skip to last exercise</button>
                : null
            }
            <Lift muted={muted} paused={paused} askImage={exerciseIndex === exercises.length - 1} nextLift={async (comment, image) => {
                // Enter leaving animation for 1 second, entering for 1 second, and then normal state
                setAnimating(3);
                await Delay(1000);
                setAnimating(1);
                await Delay(1000);
                setAnimating(2);

                // Update weight and comment arrays
                setWeights([...weights, weight]);
                setComments([...comments, comment]);
                setImage(image);
                // Increment exercise
                setExerciseIndex(exerciseIndex + 1);
                // Unset user weight
                setWeight(undefined);
            }} />
        </div>
        : <form onSubmit={(e) => {
            e.preventDefault()
            setWeight(fromUserWeight(formWeight));
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
                <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} type="number" min="0" max="1000" step="0.1" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                <br />
                <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit">Set weight</Button>
            </Paper>
        </form >
    )

    return (
        <React.Fragment>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '75vh' }}
            >
                <Button onClick={() => setStarted(true)}>Start</Button>
            </Grid>
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
                        <Dialog
                            open={help}
                            onClose={() => setHelp(false)}
                            scroll="body"
                            fullWidth={true}
                            maxWidth={'xs'}
                        >
                            <img src={exercise.image} style={{ width: '100%' }} alt="Exercise Help" />
                        </Dialog>
                        {exercise.image // Only show button if image exists
                            ? <Button onClick={() => setHelp(true)} style={{ zIndex: 15 }}>View Help</Button>
                            : null
                        }
                        <Button
                            style={{ position: 'absolute', right: 0, top: 0, zIndex: 15 }}
                            onClick={() => setMuted(!muted)}
                        >
                            {muted ? 'Unmute' : 'Mute'}
                        </Button>
                        <Button
                            style={{ position: 'absolute', left: 0, top: 0, zIndex: 15 }}
                            onClick={() => setPaused(paused ? 0 : Date.now())}
                        >
                            {paused ? 'Resume' : 'Pause'}
                        </Button>
                        <h2 style={{ flex: '1', zIndex: 11 }}>{exercise.title}</h2>
                        {content}
                    </Exercise.Provider>
                </div>
            </Dialog>
        </React.Fragment >
    )
}