import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, Paper } from '@material-ui/core'
import PlanForm from './PlanForm'
// TODO - lazily load
import ReactCSSTransitionReplace from 'react-css-transition-replace'

const defaultPlan = { exerciseSlots: [[{ title: 'Exercise', buffer: 1000, stages: [{ action: 'Up', duration: 5000 }, { action: 'Down', duration: 5000 }] }]] }

export default function Plans({ planID, setPlanID }) {
    // Plans type to fetch
    const [explore, setExplore] = useState(false)
    // If plans are loading
    const [loading, setLoading] = useState(true)
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        setLoading(true)
        setPlans([])
        fetch('/api/plans/list' + (explore ? "/public" : ""))
            .then(r => r.json())
            .then(({ plans }) => setPlans(plans))
            .catch(console.error)
            // One second delay to allow for animation not to be cut off
            .then(() => setTimeout(() => setLoading(false), 1000))
    }, [explore]);

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
                <li style={{ fontSize: '18pt' }}>
                    <Button style={{ marginRight: '1em', color: '#ffffff', borderRadius: '0.5em', backgroundColor: explore === false ? '#626262' : '#3e3e3e' }} onClick={() => setExplore(false)}>Default Plan</Button>
                    <Button style={{ color: '#ffffff', borderRadius: '0.5em', backgroundColor: explore === true ? '#626262' : '#3e3e3e' }} onClick={() => setExplore(true)}>Explore Plans</Button>
                </li>
                <ReactCSSTransitionReplace
                    transitionName="fade-wait"
                    transitionEnterTimeout={2000}
                    transitionLeaveTimeout={1000}
                >
                    {loading
                        ? <li key="loading">
                            <Paper
                                style={{
                                    backgroundColor: '#c4c4c4', padding: '1em',
                                    width: 'max-content',
                                    margin: '0 auto'
                                }}
                            >
                                <h1>Loading...</h1>
                            </Paper>
                        </li>
                        : <React.Fragment key="data">
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

                                        <span style={{ float: 'right' }}>
                                            {plan.author ? <Button color="primary" onClick={() => {
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
                                            <Button disabled={planID === plan._id} color="primary" onClick={() => setPlanID(plan._id)}>Select</Button>
                                            <Button color="primary" onClick={() => setEditing(true)}>New Plan</Button>
                                        </span>
                                        {plan.author // Show author if available
                                            ? <p>Created By: {plan.author.userName}</p>
                                            : null
                                        }
                                        <p>Created: {new Date(plan.createdAt).toDateString()}</p>
                                        <Paper style={{ backgroundColor: 'black', color: 'white', padding: '0.5em', display: 'flex', flexWrap: 'wrap' }}>
                                            {plan.exerciseSlots.map((slot, i) =>
                                                <li key={i} style={{ display: 'inline', flex: '1' }} >
                                                    <p>slot: <span class="normal-font">{i + 1}</span></p>
                                                    <ul>
                                                        {idxArr.map(j => {
                                                            // Get current exercise - loops around the slot for shorter exercise slots
                                                            const exercise = slot[j % slot.length];
                                                            return (
                                                                <li key={j + '.' + exercise._id} >
                                                                    <p>name: {exercise.title}</p>
                                                                    <p>buffer: <span class="normal-font">{exercise.buffer / 1000}</span>s</p>
                                                                    <ul>
                                                                        {exercise.stages.map((stage, j) =>
                                                                            <li key={j} >
                                                                                <p>action: {stage.action}</p>
                                                                                <p>duration: <span class="normal-font">{stage.duration / 1000}</span>s</p>
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
                        </React.Fragment>
                    }
                </ReactCSSTransitionReplace>
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