import React, { useState, useContext } from "react"
import Set from "./Set.js"
import { Button, TextareaAutosize, Paper } from '@material-ui/core'
import Exercise from './exercise.js';

const SET_TOTAL = 2

export default function Lift({ stage, nextLift }) {
    const { stages } = useContext(Exercise);
    const [set, setSet] = useState(0);

    let animating;
    let content;
    if (set !== SET_TOTAL + 1) {
        animating = true;
        content = <Set number={set} nextSet={() => setSet(set + 1)} />
    } else {
        animating = false;
        content = (
            <React.Fragment>
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
        )
    }
    const totalLength = (8000 + stages.reduce((ttl, stage) => ttl + stage.duration, 0) * 5) * SET_TOTAL;
    return (
        <React.Fragment>
            {content}
            <div id="set-bar" style={{
                ...(animating ? {
                    animationName: 'fill',
                    animationTimingFunction: 'linear',
                    animationDuration: totalLength + 'ms'
                } : {})
            }}></div>
        </React.Fragment>
    )


}