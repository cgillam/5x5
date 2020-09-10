import React, { useState, useContext } from "react"
import { Button, TextareaAutosize, Paper } from '@material-ui/core'

import Set from "./Set.js"
import Exercise from './exercise.js';


import { fileToBase64 } from './helper'

const SET_TOTAL = 5

export default function Lift({ muted, paused, askImage, nextLift }) {
    // Get stages of exercise for animation calculation
    const { stages } = useContext(Exercise);
    // Keep track of the current set number
    const [set, setSet] = useState(0);

    const isOnSet = set === SET_TOTAL + 1
    const animating = !isOnSet;
    // Show current set, or set completion form if on last set
    const content = isOnSet
        ? <React.Fragment>
            <form onSubmit={async (e) => {
                e.preventDefault();

                const comment = e.target.elements["comment"].value.trim();
                // If a image is requested and provided, obtain and parse it
                let rawImage = undefined;
                if (askImage) {
                    const imageInput = e.target.elements["image"]
                    if (imageInput.files.length) {
                        rawImage = await fileToBase64(imageInput.files[0]);
                    }
                }

                setSet(0);
                nextLift(comment, rawImage);
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
                    {askImage // Show image upload button if requested
                        ? <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="contained" component="label">
                            Upload Swellfie
                            <input name="image" type="file" style={{ display: "none" }} />
                        </Button>
                        : <br />
                    }
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