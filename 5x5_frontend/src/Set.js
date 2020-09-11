import React, { useState, useEffect, useContext, useRef, useCallback } from "react"


import Rep from './Rep.js'
import Exercise from './exercise.js';


const DELAY = 180000;

const REP_TOTAL = 5;

export default function Set({ muted, paused, number, nextSet }) {
    // Length of buffer for breething timer
    const { buffer } = useContext(Exercise);
    // Current rep
    const [rep, setRep] = useState(0);

    // Remaining and ending for delay between sets
    const [remaining, setRemaining] = useState(0);
    const [mainEnding, setMainEnding] = useState(0);

    // Remaining and ending for breething timer
    const [stageRemaining, setStageRemaining] = useState(0);
    const [stageEnding, setStageEnding] = useState(0);


    const breething = remaining > buffer && remaining < DELAY - buffer;

    // Update breething timer whenever the breething state changes
    // Keep track of first mount
    const [first, setFirst] = useState(true);

    // Start the stage on the last one to roll over
    const [stage, setStage] = useState(3);

    // Stop the breething bar    // Get text from current stage index
    const stageText = { 0: 'Breathe In', 1: 'Hold', 2: 'Brethe Out', 3: 'Hold' }[stage];
    // Determine if the stage is finished
    const stageFinished = !stageRemaining;

    const intervalRef = useRef()

    // Update breething timer whenever the breething state changes
    useEffect(() => {
        const duration = breething ? 4000 : 0
        setStageEnding(Date.now() + duration);
        setStageRemaining(duration);
    }, [breething])

    // Stop the breething bar
    const stopBar = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    useEffect(useCallback(() => {
        // If no longer breething, stop the bar
        if (!breething) return stopBar();
        // If finished breething, then go onto the next breething stage
        if (stageFinished) {
            if (first) setFirst(false);
            setStage(stage => {
                // If finished all reps, start up the main delay timer
                const newStage = (stage + 1) % 4;
                setStageEnding(Date.now() + 4000);
                setStageRemaining(4000);

                return newStage;
            });
            return;
        }
    }, [first, stageFinished, breething]), [stage, stageFinished, remaining, breething]);

    // Countdown the main delay timer
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStageRemaining(Math.max(0, stageEnding - Date.now()));
        }, 10);
        return () => clearInterval(intervalRef.current);
    }, [stageEnding]);

    // If finished all reps, start up the main delay timer
    useEffect(useCallback(() => {
        if (rep !== REP_TOTAL + 1 && rep !== 0) return;

        const duration = rep === 0 ? buffer : DELAY
        setMainEnding(Date.now() + duration);
        setRemaining(duration);
    }, [rep, buffer]), [rep]);

    // Update main ending interval timer
    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(remaining => Math.max(0, mainEnding - Date.now()));
        }, 100);

        return () => clearInterval(interval);
    }, [mainEnding])

    // Increment the set when the main timer is finished
    useEffect(useCallback(() => {
        if (!first && !remaining) {
            setRep(1);
            nextSet();
        }
    }, [first, remaining, nextSet]), [remaining]);

    // Flip the first boolean
    useEffect(() => {
        setFirst(false);
    }, []);

    // Show rep if repping, otherwise main timer
    const repping = rep > 0 && rep < REP_TOTAL + 1;
    const content = repping
        ? <Rep muted={muted} paused={paused} number={rep - 1} nextRep={() => setRep(rep + 1)} />
        : <div>
            {breething ? <p>{stageText}</p> : null}
            {!breething ? remaining <= buffer ? <p>Prepare</p> : <p>Reset the bar</p> : null}
        </div>

    return (
        <div>
            {number ? <p> Set #<span class="normal-font">{number}</span> </p> : null}
            {content}
            <div id="breathing-bar" className={breething ? 'breething' : ''} style={{ animationDuration: (4000 * 4) + 'ms' }}></div>
        </div>
    )


}