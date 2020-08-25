import React, { useState, useEffect } from 'react';
import { Link, Paper, Table, TableBody, TableHead, TableCell, TableRow, TableContainer, Tooltip } from '@material-ui/core'

const indexToChar = i => String.fromCharCode(65 + i);

const OurTableContainer = ({ children, ...props }) => <TableContainer style={{ width: 'unset', marginTop: '0.5em', marginBottom: '0.5em' }} {...props}>{children}</TableContainer>

const WorkoutPlan = ({ plan, workouts, longestSlot }) => {
    const [hovering, setHovering] = useState();
    const idxArr = [...Array(longestSlot).keys()]
    return (
        <OurTableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {idxArr.map((i) =>
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
                                const text = workouts[j] ? workouts[j].weights[i] : ' ';
                                const content = workouts[j]
                                    ? workouts[j].comments[i]
                                        ? <Tooltip
                                            title={workouts[j].comments[i]}
                                            onOpen={() => setHovering(`${i}.${j}`)}
                                            onClose={() => setTimeout(() => setHovering(''), 250)}
                                        >
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
        </OurTableContainer>
    )
}

const chunkify = (arr, chunkLength) => arr.reduce((chunks, item) => {
    const current = chunks[chunks.length - 1];

    if (current && current.length < chunkLength) current.push(item)
    else chunks.push([item]);

    return chunks;
}, [])

export default function HistoryTable() {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        fetch('/api/workout/history')
            .then(r => console.log(r) || r.json())
            .then(({ workouts }) => setHistory(workouts));
    }, [])

    const planWorkOuts = history.reduce((planMap, fullWorkout) => {
        const { plan, ...workout } = fullWorkout;
        if (!planMap[plan._id]) return { ...planMap, [plan._id]: { ...plan, workouts: [workout] } }
        planMap[plan._id].workouts.push(workout)
        return (planMap)
    }, {});

    const planIds = new Set(
        history.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((workout) => workout.plan._id)
    )

    return (
        <React.Fragment>
            {Array.from(planIds).map((planId) => {
                const plan = planWorkOuts[planId];
                const longestSlot = plan.exerciseSlots.reduce((longest, slot) =>
                    slot.length < longest ? longest : slot.length, 0
                )
                const tableData = chunkify(
                    plan.workouts.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
                    longestSlot
                );

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