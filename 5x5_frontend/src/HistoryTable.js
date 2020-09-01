import React, { useState, useEffect } from 'react';
import { Link, Paper, Table, TableBody, TableHead, TableCell, TableRow, TableContainer, Tooltip } from '@material-ui/core'

import { chunkify } from './helper'


// Convert index to char - 0->A, 1->B, etc
const indexToChar = i => String.fromCharCode(65 + i);

// Individual table for each workout plan instance
const WorkoutPlan = ({ plan, workouts, longestSlot }) => {
    // ID of currently hovered comment
    const [hovering, setHovering] = useState();
    // Array of indexes up until the longest slot
    const idxArr = [...Array(longestSlot).keys()]

    return (
        <TableContainer style={{ width: 'unset', marginTop: '0.5em', marginBottom: '0.5em' }} component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {idxArr.map((i) => // Add headers for each of the exercise slots
                            <React.Fragment key={i}>
                                <TableCell classes={{ root: 'black-paper' }}>Exercise</TableCell>
                                <TableCell classes={{ root: 'black-paper' }}>{workouts[i] ? new Date(workouts[i].createdAt).toDateString() : indexToChar(i)}</TableCell>
                            </React.Fragment>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(workouts[0].exercises.length).keys()].map(i =>
                        <TableRow key={i}>
                            {idxArr.map(j => {
                                // Set weight text to the text weight if there was a workout, otherwise blank
                                const text = workouts[j] ? workouts[j].weights[i] : ' ';
                                // Set content to the current weight text if there's no comment, otherwise
                                // set to a tooltip with the comment in it
                                const content = workouts[j]
                                    ? workouts[j].comments[i]
                                        ? <Tooltip
                                            title={workouts[j].comments[i]}
                                            onOpen={() => setHovering(`${i}.${j}`)}
                                            onClose={() => setTimeout(() => setHovering(''), 250)}
                                        >
                                            {/* Display link if not hovereing, otherwise remove link and use span */}
                                            {hovering === `${i}.${j}` ? <span>{text}</span> : <Link>{text}</Link>}
                                        </Tooltip>
                                        : text
                                    : ''

                                return (
                                    <React.Fragment key={j}>
                                        <TableCell classes={{ root: 'black-paper' }}>{plan.exerciseSlots[i][j % plan.exerciseSlots[i].length].title}</TableCell>
                                        <TableCell classes={{ root: 'black-paper' }} align="center">{content}</TableCell>
                                    </React.Fragment>
                                )
                            })}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default function HistoryTable() {
    // History data
    const [history, setHistory] = useState([]);
    // Fetch history data on mount
    useEffect(() => {
        fetch('/api/workout/history')
            .then(r => r.json())
            .then(({ workouts }) => setHistory(workouts));
    }, [])

    // Convert list of workouts into planID to plan with workouts array mapping
    const planWorkOuts = history.reduce((planMap, fullWorkout) => {
        const { plan, ...workout } = fullWorkout;
        if (!planMap[plan._id]) return { ...planMap, [plan._id]: { ...plan, workouts: [workout] } }
        planMap[plan._id].workouts.push(workout)
        return (planMap)
    }, {});

    // Get all unique plan IDs sorted by the newest workout to the oldest
    const planIds = new Set(
        history.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((workout) => workout.plan._id)
    )

    return (
        <React.Fragment>
            {Array.from(planIds).map((planId) => {
                const plan = planWorkOuts[planId];
                // Get length of longest exercise slot
                const longestSlot = plan.exerciseSlots.reduce((longest, slot) =>
                    slot.length < longest ? longest : slot.length, 0
                )
                // Chunkify workouts into longestSlot long chunks
                // TODO - test reverse not rquired
                const tableData = chunkify(
                    plan.workouts.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
                    longestSlot
                );

                // Return flex container of all tables for this workout
                return (
                    <div
                        key={planId}
                        style={{
                            margin: '0.5em',
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}
                    >
                        {tableData.map((workouts, i) =>
                            <WorkoutPlan key={i} plan={plan} workouts={workouts} longestSlot={longestSlot} />
                        )}
                    </div>
                )
            })}
        </React.Fragment>
    )
}