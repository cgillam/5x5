import React, { useStage, useEffect, useState } from 'react';
import PlanForm from './PlanForm'
import { Button, Dialog, DialogTitle, ButtonGroup, Paper } from '@material-ui/core'

//const cloneCurrentPlan = (plans, id) => ({ ...JSON.parse(JSON.stringify(plans.find((plan) => plan._id === id) || { exerciseSlots: [] })) })
const cloneCurrentPlan = (plans, id) => ({ exerciseSlots: [[{ title: 'Exercise', buffer: 1000, stages: [{ action: 'Up', duration: 5000 }, { action: 'Down', duration: 5000 }] }]] })

export default function Plans({ plans, setPlans, planID, setPlanID }) {
    const [editingPlan, setEditingPlan] = useState(cloneCurrentPlan(plans, planID))
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setEditingPlan(cloneCurrentPlan(plans, planID))
    }, [planID])

    const addPlan = (plan) => {
        setPlans([...plans, plan])
        setPlanID(plan._id)
    }

    return (
        <React.Fragment>
            <ul style={{ listStyleType: 'none' }}>
                {plans.map((plan) => {
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
                                    fetch("/api/plans/" + plan._id, {
                                        method: "delete"
                                    }).then(response => {
                                        if (!response.ok) return
                                        const planIndex = plans.findIndex((loopPlan) => loopPlan._id === plan._id);
                                        const newPlans = plans.filter((_, i) => i !== planIndex);
                                        setPlans(newPlans);
                                        if (planID === plan._id && newPlans.length) setPlanID(newPlans[planIndex === newPlans.length ? planIndex - 1 : planIndex]._id);
                                    })
                                }}>Delete</Button> : null}
                                <Button disabled={planID === plan._id} color="primary" variant="outlined" onClick={() => setPlanID(plan._id)}>Select</Button>
                                <Button color="primary" variant="outlined" onClick={() => setOpen(true)}>New Plan</Button>
                            </ButtonGroup>
                            <p>Created: {new Date(plan.createdAt).toDateString()}</p>
                            <Paper style={{ backgroundColor: 'black', color: 'white', padding: '0.5em', display: 'flex', flexWrap: 'wrap' }}>
                                {plan.exerciseSlots.map((slot, i) =>
                                    <li key={i} style={{ display: 'inline', flex: '1' }} >
                                        <p>slot: {i + 1}</p>
                                        <ul>
                                            {idxArr.map(j => {
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
                open={open}
                onClose={() => setOpen(false)}
                scroll="body"
                classes={{ paperScrollBody: 'grey-modal' }}
            >
                <DialogTitle>New Plan</DialogTitle>
                <PlanForm plan={editingPlan} setPlan={setEditingPlan} addPlan={addPlan} />
            </Dialog>
        </React.Fragment>
    )
}