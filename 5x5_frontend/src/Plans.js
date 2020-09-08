import React, { useStage, useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, ButtonGroup, Paper } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import PlanForm from './PlanForm'


const defaultPlan = { exerciseSlots: [[{ title: 'Exercise', buffer: 1000, stages: [{ action: 'Up', duration: 5000 }, { action: 'Down', duration: 5000 }] }]] }

export default function Plans({ planID, setPlanID }) {
    const [explore, setExplore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [plans, setPlans] = useState([]);
    const fetchPlans = () => setLoading(true) || setPlans([]) || fetch('/api/plans/list' + (explore ? "/public" : ""))
        .then(r => r.json())
        .then(({ plans }) => setPlans(plans))
        .catch(console.error)
        .then(() => setLoading(false))

    useEffect(() => {
        if (loading) return
        fetchPlans()
    }, [explore])
    useEffect(() => {
        fetchPlans()
    }, []);

    // Data of new plan
    const [editingPlan, setEditingPlan] = useState(JSON.parse(JSON.stringify(defaultPlan)))
    const [editing, setEditing] = useState(false);

    // Reset editin data whenever plan ID updates
    useEffect(() => {
        setEditingPlan(JSON.parse(JSON.stringify(defaultPlan)))
    }, [planID])

    // When a plan is added, add it, select it, and close the editing plan form
    const addPlan = (plan) => {
        setPlans([...plans, plan])
        setPlanID(plan._id)
        setEditing(false)
    }

    return (
        <React.Fragment>
            <ul style={{ listStyleType: 'none' }}>
                <li>
                    <Paper
                        style={{
                            backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                            boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                            width: 'max-content',
                            margin: '0 auto'
                        }}
                    >
                        <ToggleButtonGroup exclusive value={explore} onChange={(_, newExplore) => setExplore(newExplore)}>
                            <ToggleButton value={false}>Default</ToggleButton>
                            <ToggleButton value={true}>Explore</ToggleButton>
                        </ToggleButtonGroup>
                    </Paper>
                </li>
                {loading
                    ? <li>
                        <Paper
                            style={{
                                backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                                boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                                width: 'max-content',
                                margin: '0 auto'
                            }}
                        >
                            <h1>Loading...</h1>
                        </Paper>
                    </li>
                    : null
                }
                {plans.map((plan) => {
                    // Get length of longest exercise slot
                    const longestSlot = plan.exerciseSlots.reduce((longest, slot) =>
                        slot.length < longest ? longest : slot.length, 0
                    )
                    const idxArr = [...Array(longestSlot).keys()];

                    return (
                        <Paper
                            key={plan._id}
                            style={{
                                backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                                boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)'
                            }}
                        >

                            <ButtonGroup color="primary" style={{ float: 'right' }}>
                                {plan.author ? <Button color="primary" variant="outlined" onClick={() => {
                                    // Delete button visible on plans that have an author
                                    // TODO - don't show button if the author is not the current user
                                    fetch("/api/plans/" + plan._id, {
                                        method: "delete"
                                    }).then(response => {
                                        if (!response.ok) return
                                        // Get the ID of the plan, filter it out, and update the selected plan ID accordingly
                                        const planIndex = plans.findIndex((loopPlan) => loopPlan._id === plan._id);
                                        const newPlans = plans.filter((_, i) => i !== planIndex);
                                        setPlans(newPlans);
                                        if (planID === plan._id && newPlans.length) setPlanID(newPlans[planIndex === newPlans.length ? planIndex - 1 : planIndex]._id);
                                    })
                                }}>Delete</Button> : null}
                                <Button disabled={planID === plan._id} color="primary" variant="outlined" onClick={() => setPlanID(plan._id)}>Select</Button>
                                <Button color="primary" variant="outlined" onClick={() => setEditing(true)}>New Plan</Button>
                            </ButtonGroup>
                            {plan.author // Show author if available
                                ? <p>Created By: {plan.author.userName}</p>
                                : null
                            }
                            <p>Created: {new Date(plan.createdAt).toDateString()}</p>
                            <Paper style={{ backgroundColor: 'black', color: 'white', padding: '0.5em', display: 'flex', flexWrap: 'wrap' }}>
                                {plan.exerciseSlots.map((slot, i) =>
                                    <li key={i} style={{ display: 'inline', flex: '1' }} >
                                        <p>slot: {i + 1}</p>
                                        <ul>
                                            {idxArr.map(j => {
                                                // Get current exercise - loops around the slot for shorter exercise slots
                                                const exercise = slot[j % slot.length];
                                                return (
                                                    <li key={j + '.' + exercise._id} >
                                                        <p>name: {exercise.title}</p>
                                                        <p>buffer: {exercise.buffer / 1000}s</p>
                                                        <ul>
                                                            {exercise.stages.map((stage, j) =>
                                                                <li key={j} >
                                                                    <p>action: {stage.action}</p>
                                                                    <p>duration: {stage.duration / 1000}s</p>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </li>
                                                )
                                            })}

                                        </ul>
                                    </li>
                                )}

                            </Paper>
                        </Paper>
                    )
                })}
            </ul>
            <Dialog
                open={editing}
                onClose={() => setEditing(false)}
                scroll="body"
                classes={{ paperScrollBody: 'grey-modal' }}
            >
                <DialogTitle>New Plan</DialogTitle>
                <PlanForm plan={editingPlan} setPlan={setEditingPlan} addPlan={addPlan} />
            </Dialog>
        </React.Fragment>
    )
}