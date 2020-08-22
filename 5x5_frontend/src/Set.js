import React, { useState, useEffect, useContext, useRef } from "react"
import Rep from './Rep.js'
import Exercise from './exercise.js';

//const DELAY = 180000;
const DELAY = 3000;
// TODO - debug

export default function Set({ stage: exercise, number, nextSet }) {
    //const { buffer } = useContext(Exercise);
    const buffer = 1000;

    const [rep, setRep] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [stageRemaining, setStageRemaining] = useState(0);
    const [barPercentage, setBarPercentage] = useState(0);
    const breething = remaining > buffer && remaining < DELAY - buffer;

    const [first, setFirst] = useState(true);

    const [stage, setStage] = useState(3);
    const stageText = { 0: 'Breathe In', 1: 'Hold', 2: 'Brethe Out', 3: 'Hold' }[stage];
    const stageFinished = !stageRemaining;
    const intervalRef = useRef();

    useEffect(() => {
        setStageRemaining(breething ? 4000 : 0);
    }, [breething])

    const stopBar = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setBarPercentage(0);
    }

    useEffect(() => {
        if (!breething) return stopBar();
        if (stageFinished) {
            if (first) setFirst(false);
            setStage(stage => {
                const newStage = (stage + 1) % 4;
                setStageRemaining(4000);

                return newStage;
            });
            return;
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStageRemaining(stageRemaining => {
                const newremain = Math.max(0, stageRemaining - 10);
                if (stage % 2 === 0) {
                    const inward = stage === 0;
                    const subnum = inward ? newremain : (4000 - newremain) % 4000;
                    setBarPercentage(100 - (subnum / 4000 * 100));

                }
                else {
                    const inward = stage === 1;
                    setBarPercentage(inward ? 100 : 0);
                }
                return newremain;
            });
        }, 10);

        //return stopBar;
    }, [stage, stageFinished, remaining, breething]);

    useEffect(() => {
        if (rep !== 6 && rep !== 0) return;

        setRemaining(rep === 0 ? buffer : DELAY);
        const interval = setInterval(() => {
            setRemaining(remaining => {
                return Math.max(0, remaining - 100);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [rep]);


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
    if (rep > 0 && rep < 6) {
        content = <Rep stage={exercise} number={rep - 1} nextRep={() => setRep(rep + 1)} />
    } else {
        content = (
            <div>
                {breething ? <p>{stageText}</p> : null}
                <p>{!breething ? 'Prepare' : ''} {remaining / 1000}s...</p>
            </div>
        )
    }
    return (
        <div>
            {number ? <p> Set #{number} </p> : null}
            {content}
            <div id="bar" style={{ height: barPercentage + '%' }}></div>
        </div>
    )


}