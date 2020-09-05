import React, { useState, useContext } from "react"
import { Button, TextareaAutosize, Paper } from '@material-ui/core'

import Set from "./Set.js"
import Exercise from './exercise.js';


const SET_TOTAL = 5

export default function Lift({ muted, paused, nextLift }) {
    // Get stages of exercise for animation calculation
    const { stages } = useContext(Exercise);
    // Keep track of the current set number
    const [set, setSet] = useState(0);

    const isOnSet = set === SET_TOTAL + 1
    const animating = !isOnSet;
    // Show current set, or set completion form if on last set
    const content = isOnSet
        ? <React.Fragment>
            <form onSubmit={(e) => {
                e.preventDefault();

                const comment = e.target.elements["comment"].value.trim();

                setSet(0);
                nextLift(comment);
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
                    <TextareaAutosize rowsMin={5} style={{ color: 'white', backgroundColor: 'black' }} classes={{ root: 'white-input' }} name="comment" placeholder="Comment" />
                    <br />
                    <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit">Continue to next exercise</Button>
                </Paper>
            </form>
        </React.Fragment>
        : <Set muted={muted} paused={paused} number={set} nextSet={() => setSet(set + 1)} />

    // Full length of the set bar animation - the length of all the stages, times the number of reps, plus the
    // length of the delay, times the number of sets
    const totalLength = (180000 + stages.reduce((ttl, stage) => ttl + stage.duration, 0) * 5) * SET_TOTAL;
    return (
        <React.Fragment>
            {content}
            <div id="set-bar" style={{
                ...(animating ? {
                    animationName: 'fill',
                    animationTimingFunction: 'linear',
                    animationDuration: totalLength + 'ms',
                    animationPlayState: paused ? 'paused' : 'running'
                } : {})
            }}></div>
        </React.Fragment>
    )


}