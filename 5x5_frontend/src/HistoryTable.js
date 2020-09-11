import React, { useState, useEffect, useContext } from 'react';
import { Link, Paper, Dialog, Table, TableBody, TableHead, TableCell, Button, TableRow, TableContainer, Tooltip } from '@material-ui/core'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

import UserContext from './user.js';
import { chunkify } from './helper'


// Convert index to char - 0->A, 1->B, etc
const indexToChar = i => String.fromCharCode(65 + i);

// Individual table for each workout plan instance
const WorkoutPlan = ({ plan, workouts, longestSlot }) => {
    const { toUserWeight } = useContext(UserContext);
    // ID of currently hovered comment
    const [hovering, setHovering] = useState();
    // Currently displayed image
    const [image, setImage] = useState();
    // Array of indexes up until the longest slot
    const idxArr = [...Array(longestSlot).keys()]

    // TODO - animate like workout plan
    // todo - show message when history is empty
    return (
        <>
            <Dialog
                open={!!image}
                onClose={() => setImage(undefined)}
                scroll="body"
                fullWidth={true}
                maxWidth={'xs'}
            >
                <img src={image} style={{ width: '100%' }} alt="Swellfie" />
            </Dialog>
            <TableContainer style={{ width: 'unset', marginTop: '0.5em', marginBottom: '0.5em' }} component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {idxArr.map((i) => // Add headers for each of the exercise slots
                                <React.Fragment key={i}>
                                    <TableCell classes={{ root: 'black-paper' }}>Exercise</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }}>{workouts[i] ? new Date(workouts[i].createdAt).toDateString() : indexToChar(i)}</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }}>Swellfie</TableCell>
                                </React.Fragment>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...Array(workouts[0].exercises.length).keys()].map(i =>
                            <TableRow key={i}>
                                {idxArr.map(j => {
                                    // Set weight text to the text weight if there was a workout, otherwise blank
                                    const text = workouts[j] ? toUserWeight(workouts[j].weights[i]).toFixed(1) : ' ';
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

                                    const lastRow = i === workouts[0].exercises.length - 1;

                                    return (
                                        <React.Fragment key={j}>
                                            <TableCell classes={{ root: 'black-paper' }}>{plan.exerciseSlots[i][j % plan.exerciseSlots[i].length].title}</TableCell>
                                            <TableCell classes={{ root: 'black-paper' }} align="center">
                                                {content}
                                            </TableCell>
                                            <TableCell classes={{ root: 'black-paper' }} align="center">
                                                {lastRow // If on last row, there is a workout, and that workout has a image, show a button to show it, otherwise a cross, otherwise nothing
                                                    ? workouts[j] && workouts[j].image
                                                        ? <Button style={{ color: 'red' }} onClick={() => setImage(workouts[j].image)}>✓</Button>
                                                        : <CancelOutlinedIcon />
                                                    : ''
                                                }
                                            </TableCell>
                                        </React.Fragment>
                                    )
                                })}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default function HistoryTable() {
    const [loading, setLoading] = useState(true)
    // History data
    const [history, setHistory] = useState([]);
    // Fetch history data on mount
    useEffect(() => {
        fetch('/api/workout/history')
            .then(r => r.json())
            .then(({ workouts }) => setHistory(workouts))
            .catch(() => undefined)
            .then(() => setLoading(false))
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
            {loading
                ? <Paper
                    style={{
                        backgroundColor: 'darkgrey', padding: '0.5em',
                        boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                        width: 'max-content',
                        margin: '0 auto'
                    }}
                >
                    <h1>Loading...</h1>
                </Paper>
                : null
            }
            {Array.from(planIds).map((planId) => {
                const plan = planWorkOuts[planId];
                // Get length of longest exercise slot
                const longestSlot = plan.exerciseSlots.reduce((longest, slot) =>
                    slot.length < longest ? longest : slot.length, 0
                )
                // Chunkify workouts into longestSlot long chunks
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