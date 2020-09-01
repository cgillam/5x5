import React, { useState, useEffect, useContext } from "react"
import Exercise from './exercise.js'
import { keyframes } from "styled-components/macro"
import useSound from 'use-sound'


const animationGenertators = {
    1: () => `
        0% { height:0%; }
        50% { height:100%; }
        100% { height:0%; }
    `,
    2: ([first], length) => `
        0% { height:0%; }
        ${first.duration / length * 100}% { height:100%; }
        100% { height:0%; }
    `,
    3: ([first, second], length) => {
        const firstPercent = first.duration / length * 100
        return `
            0% { height:0%; }
            ${firstPercent}% { height:100%; }
            ${firstPercent + (second.duration / length * 100)}% { height:100%; }
            100% { height:0%; }
        `
    }
}
export default function Rep({ muted, number, nextRep }) {
    const exercise = useContext(Exercise);
    const lastStageIndex = exercise.stages.length - 1;

    const [play] = useSound('https://raw.githubusercontent.com/joshwcomeau/use-sound/master/stories/sounds/boop.mp3', { volume: muted ? 0 : 1 });
    const [playHalf] = useSound('https://raw.githubusercontent.com/joshwcomeau/use-sound/master/stories/sounds/boop.mp3', { volume: muted ? 0 : 0.5 });

    const [stageIndex, setStageIndex] = useState(lastStageIndex);
    const stage = exercise.stages[stageIndex];
    const [remaining, setRemaining] = useState(0);
    const [first, setFirst] = useState(true);

    const stageFinished = !remaining;
    useEffect(() => {
        if (stageFinished) {
            if (stageIndex === lastStageIndex && !first) nextRep();
            if (first) setFirst(false);
            play();
            setStageIndex(stageIndex => {
                const newStage = (stageIndex + 1) % (lastStageIndex + 1);
                setRemaining(exercise.stages[newStage].duration);
                setTimeout(() => playHalf(), exercise.stages[newStage].duration / 2);

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

    const repDuration = exercise.stages.reduce((ttl, stage) => ttl + stage.duration, 0);
    const animationGenertator = animationGenertators[exercise.stages.length] || animationGenertators[1];
    const animationKeyframes = keyframes([], animationGenertator(exercise.stages, repDuration).split('\n'));

    return (
        <React.Fragment>
            <p>Rep #{number + 1}</p>
            <p>{stage.action}</p>

            <p>{remaining / 1000}s...</p>

            <div
                id="exercise-bar"
                css={`
                    animation: ${animationKeyframes} ${repDuration}ms ease-in-out infinite;
                `}
            ></div>
            <div id="rep-bar" style={{
                ...(true ? {
                    animationName: 'fill',
                    animationTimingFunction: 'linear',
                    animationDuration: (repDuration * 5) + 'ms',
                    animationIterationCount: 'infinite',
                    backgroundColor: stageIndex % 2 === 0 ? 'grey' : 'grey'
                } : {})
            }}></div>
        </React.Fragment>
    )


}

