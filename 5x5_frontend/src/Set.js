import React, { useState, useEffect, useContext, useRef } from "react"
import Rep from './Rep.js'
import Exercise from './exercise.js';

//const DELAY = 180000;
const DELAY = 8000;
// TODO - debug

const REP_TOTAL = 5;

export default function Set({ stage: exercise, number, nextSet }) {
    //const { buffer } = useContext(Exercise);
    const buffer = 1000;

    const [rep, setRep] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [mainEnding, setMainEnding] = useState(0);

    const [stageRemaining, setStageRemaining] = useState(0);
    const [stageEnding, setStageEnding] = useState(0);


    const breething = remaining > buffer && remaining < DELAY - buffer;

    const [first, setFirst] = useState(true);

    const [stage, setStage] = useState(3);
    const stageText = { 0: 'Breathe In', 1: 'Hold', 2: 'Brethe Out', 3: 'Hold' }[stage];
    const stageFinished = !stageRemaining;
    const intervalRef = useRef();

    useEffect(() => {
        const duration = breething ? 4000 : 0
        setStageEnding(Date.now() + duration);
        setStageRemaining(duration);
    }, [breething])

    const stopBar = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    useEffect(() => {
        if (!breething) return stopBar();
        if (stageFinished) {
            if (first) setFirst(false);
            setStage(stage => {
                const newStage = (stage + 1) % 4;
                setStageEnding(Date.now() + 4000);
                setStageRemaining(4000);

                return newStage;
            });
            return;
        }
    }, [stage, stageFinished, remaining, breething]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStageRemaining(Math.max(0, stageEnding - Date.now()));
        }, 100);
        return () => clearInterval(intervalRef.current);
    }, [stageEnding]);

    useEffect(() => {
        if (rep !== REP_TOTAL - 1 && rep !== 0) return;

        const duration = rep === 0 ? buffer : DELAY
        setMainEnding(Date.now() + duration);
        setRemaining(duration);
    }, [rep]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(remaining => Math.max(0, mainEnding - Date.now()));
        }, 100);

        return () => clearInterval(interval);
    }, [mainEnding])

    useEffect(() => {
        if (!first && !remaining) {
            setRep(1);
            nextSet();
        }
    }, [remaining]);

    useEffect(() => {
        setFirst(false);
    }, []);

    let content;
    if (rep > 0 && rep < REP_TOTAL + 1) {
        content = <Rep stage={exercise} number={rep - 1} nextRep={() => setRep(rep + 1)} />
    } else {
        content = (
            <div>
                {breething ? <p>{stageText}</p> : null}
                {!breething ? <p>Prepare...</p> : null}
            </div>
        )
    }
    return (
        <div>
            {number ? <p> Set #{number} </p> : null}
            {content}
            <div id="breathing-bar" className={breething ? 'breething' : ''} style={{ animationDuration: (4000 * 4) + 'ms' }}></div>
            <div id="rep-bar" style={{ height: (rep / REP_TOTAL * 100) + '%' }}></div>
        </div>
    )


}