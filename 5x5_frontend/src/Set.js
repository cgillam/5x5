import React, { useState, useEffect, useContext } from "react"
import Rep from './Rep.js'
import Exercise from './exercise.js';

//const DELAY = 180000;
const DELAY = 1800;
// TODO - debug

export default function Set({ stage: exercise, number, nextSet }) {
    const { buffer } = useContext(Exercise);

    const [rep, setRep] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [first, setFirst] = useState(true);
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
        const breething = remaining > buffer && remaining < DELAY - buffer;
        content = <p>{breething ? 'Breeth' : 'Prepare'} {remaining / 1000}s...</p>
    }
    return (
        <React.Fragment>
            {number ? <p> Set #{number} </p> : null}
            {content}
        </React.Fragment>
    )


}