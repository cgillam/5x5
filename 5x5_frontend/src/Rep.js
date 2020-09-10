import React, { useState, useEffect, useContext, useRef } from "react"
import { keyframes } from "styled-components/macro"
import useSound from 'use-sound'

import Exercise from './exercise.js'


// Functions that generate the animation keyframes based on the exercise stages and length of the entire animation
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
export default function Rep({ muted, paused, number, nextRep }) {
    // Get the exercise and index of the last stage
    const exercise = useContext(Exercise);
    const lastStageIndex = exercise.stages.length - 1;

    // Boop sound effects - one at full, the other at half volume
    const [play] = useSound('https://raw.githubusercontent.com/joshwcomeau/use-sound/master/stories/sounds/boop.mp3', { volume: muted ? 0 : 1 });
    const [playHalf] = useSound('https://raw.githubusercontent.com/joshwcomeau/use-sound/master/stories/sounds/boop.mp3', { volume: muted ? 0 : 0.5 });

    // Index of the current stage - initally set to last to properly roll over
    const [stageIndex, setStageIndex] = useState(lastStageIndex);
    // Current stage
    const stage = exercise.stages[stageIndex];

    // When the current timer is ending, and the time remaining for the current timer
    const [ending, setEnding] = useState(0);
    const [remaining, setRemaining] = useState(0);
    // If it's the first render
    const [first, setFirst] = useState(true);

    // References to intervals to allow for pausing and resuming
    const intervalRef = useRef();

    const clearIntervalRef = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = undefined;
    }
    const halfSoundDelay = useRef()
    const clearHalfSound = () => {
        if (halfSoundDelay.current) clearInterval(halfSoundDelay.current);
        halfSoundDelay.current = undefined;
    }

    // If the stage is finished
    const stageFinished = !remaining;
    // Go onto the next stage if finished, otherwise set the interal for the current stage
    useEffect(() => {
        if (stageFinished) {
            // If it's not the first mount and the last stage index, go to the next rep
            if (stageIndex === lastStageIndex && !first) nextRep();
            // Flip the first boolean
            if (first) setFirst(false);

            play();
            // Set the stage index to the next stage index - cycling around to the first as needed
            setStageIndex(stageIndex => {
                const newStage = (stageIndex + 1) % (lastStageIndex + 1);
                const duration = exercise.stages[newStage].duration
                setEnding(Date.now() + duration);
                setRemaining(duration);
                // Play the half sound in the middle of this stage
                clearHalfSound();
                halfSoundDelay.current = setTimeout(() => playHalf(), duration / 2);

                return newStage;
            });
            return clearIntervalRef();
        }
        // Decrement the remaining until it's down to 0
        intervalRef.current = setInterval(() =>
            setRemaining(remaining => Math.max(0, ending - Date.now())),
            10);

        return clearIntervalRef;
    }, [stageIndex, stageFinished]);

    // Stop/start intervals upon pausing and resmuing
    useEffect(() => {
        if (first) return;
        if (paused) {
            clearHalfSound();
            return clearIntervalRef();
        }
        else {
            const newEnding = Date.now() + remaining;
            setEnding(newEnding);
            intervalRef.current = setInterval(() =>
                setRemaining(remaining => Math.max(0, newEnding - Date.now())),
                10);
            const halfRemaining = Math.max(0, stage.duration - remaining)
            clearHalfSound();
            halfSoundDelay.current = setTimeout(() => playHalf(), halfRemaining);
        }
    }, [paused]);

    // Length of a single rep, function to generate animation keyframes, and generated keyframes
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
                    animation-play-state: ${paused ? 'paused' : 'running'};
                `}
            ></div>
            <div id="rep-bar" style={{
                ...(true ? {
                    animationName: 'fill',
                    animationTimingFunction: 'linear',
                    animationDuration: (repDuration * 5) + 'ms',
                    animationIterationCount: 'infinite',
                    backgroundColor: stageIndex % 2 === 0 ? 'grey' : 'grey',
                    animationPlayState: paused ? 'paused' : 'running'
                } : {})
            }}></div>
        </React.Fragment>
    )


}

