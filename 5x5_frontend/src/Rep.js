import React, { useState, useEffect, useContext } from "react"
import Exercise from './exercise.js'

export default function Rep({ number, nextRep }) {
    const exercise = useContext(Exercise);
    const lastStageIndex = exercise.stages.length - 1;

    const [stageIndex, setStageIndex] = useState(lastStageIndex);
    const stage = exercise.stages[stageIndex];
    const [remaining, setRemaining] = useState(0);
    const [first, setFirst] = useState(true);

    const stageFinished = !remaining;
    useEffect(() => {
        if (stageFinished) {
            if (stageIndex === lastStageIndex && !first) nextRep();
            if (first) setFirst(false);
            setStageIndex(stageIndex => {
                const newStage = (stageIndex + 1) % (lastStageIndex + 1);
                setRemaining(stage.duration);

                return newStage;
            });
            return;
        }
        const interval = setInterval(() => {
            setRemaining(remaining => {
                return Math.max(0, remaining - 100);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [stageIndex, stageFinished]);

    return (
        <React.Fragment>
            <p>Rep #{number + 1}</p>
            <p>{stage.action}</p>
            <p>{remaining / 1000}s...</p>
        </React.Fragment>
    )


}

