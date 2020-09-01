import React from "react"
import { Button, ButtonGroup, TextField, Paper } from '@material-ui/core'

export default function PlanForm({ plan, setPlan, addPlan }) {
    const insertSlot = (i) => {
        const newSlots = [...plan.exerciseSlots];
        const slot = [{ title: 'Exercise', buffer: 1000, stages: [{ action: 'Up', duration: 5000 }, { action: 'Down', duration: 5000 }] }];
        newSlots.splice(i, 0, slot);
        setPlan({ ...plan, exerciseSlots: newSlots });
    }
    const deleteSlot = (i) => {
        setPlan({ ...plan, exerciseSlots: plan.exerciseSlots.filter((_, index) => i !== index) })
    }
    const moveSlot = (i, change) => {
        const newSlots = [...plan.exerciseSlots];
        const target = i + change
        if (target < 0) return
        if (target >= newSlots.length) return
        const temp = newSlots[target]
        newSlots.splice(target, 1)
        newSlots.splice(i, 0, temp)


        setPlan({ ...plan, exerciseSlots: newSlots });
    }

    const insertExercise = (i, j) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i].splice(j, 0, { title: 'Exercise', buffer: 1000, stages: [{ action: 'Up', duration: 5000 }, { action: 'Down', duration: 5000 }] })
        setPlan({ ...plan, exerciseSlots: newSlots });

    }
    const moveExercise = (i, j, change) => {
        const newSlots = [...plan.exerciseSlots];
        const target = j + change
        if (target < 0) return
        if (target >= newSlots[i].length) return
        const temp = newSlots[i][target]
        newSlots[i].splice(target, 1)
        newSlots[i].splice(j, 0, temp)


        setPlan({ ...plan, exerciseSlots: newSlots });

    }
    const deleteExercise = (i, j) => {
        // TOOD - fix delete function
        const newPlan = {
            ...plan, exerciseSlots: plan.exerciseSlots.filter((slot, index) => {
                if (i !== index) return slot;
                return slot.filter((_, jindex) => j !== jindex);
            })
        }
        setPlan(newPlan)
    }

    const insertStage = (i, j, k) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i][j].stages.splice(k, 0, { action: 'Action', duration: 5000 })
        setPlan({ ...plan, exerciseSlots: newSlots });
    }
    const moveStage = (i, j, k, change) => {
        const newSlots = [...plan.exerciseSlots];
        const target = k + change
        if (target < 0) return
        if (target >= newSlots[i][j].stages.length) return
        const temp = newSlots[i][j].stages[target]
        newSlots[i][j].stages.splice(target, 1)
        newSlots[i][j].stages.splice(k, 0, temp)


        setPlan({ ...plan, exerciseSlots: newSlots });


    }
    const deleteStage = (i, j, k) => {
        setPlan({
            ...plan, exerciseSlots: plan.exerciseSlots.filter((slot, index) => {
                if (i !== index) return slot;

                const newSlot = [...slot]
                newSlot[j].stages = newSlot[j].stages.filter((_, kindex) => k !== kindex);

                return newSlot
            })
        })
    }



    // TODO - properly clone all four setter data sources
    const setExerciseTitle = (i, j, newTitle) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i][j] = { ...newSlots[i][j], title: newTitle };
        setPlan({ ...plan, exerciseSlots: newSlots });
    }
    const setExerciseBuffer = (i, j, newBuffer) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i][j] = { ...newSlots[i][j], buffer: newBuffer };
        setPlan({ ...plan, exerciseSlots: newSlots });
    }
    const setExerciseImage = (i, j, newFile) => {
        console.log(newFile);
        // TODO - convert image to base64, store image in object
        //const newSlots = [...plan.exerciseSlots];
        //newSlots[i][j] = { ...newSlots[i][j], image: newImage };
        //setPlan({ ...plan, exerciseSlots: newSlots });
    }
    const setStageAction = (i, j, k, newAction) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i][j].stages[k] = { ...newSlots[i][j].stages[k], action: newAction };
        setPlan({ ...plan, exerciseSlots: newSlots });

    }
    const setStageDuration = (i, j, k, newDuration) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots[i][j].stages[k] = { ...newSlots[i][j].stages[k], duration: newDuration };
        setPlan({ ...plan, exerciseSlots: newSlots });
    }

    const submitButton = <Button color="primary" variant="outlined" onClick={() => fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
    }).then(r => console.log(r) || r.json()).then(({ plan }) => addPlan(plan))} style={{
        boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
    }}>Submit</Button>

    return (
        <div style={{ padding: '1em' }}>
            {submitButton}
            <ul style={{ listStyleType: 'none' }}>
                {!plan.exerciseSlots.length
                    ? <li><Button color="primary" variant="outlined" onClick={() => insertSlot(0, true)} >Add Slot</Button></li>
                    : null
                }
                {plan.exerciseSlots.map((slot, i) =>
                    <li key={i}>
                        <ButtonGroup color="primary" style={{ float: 'right' }} style={{
                            boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
                        }}>
                            <Button color="primary" variant="outlined" onClick={() => insertSlot(i)}>Add Above</Button>
                            <Button color="primary" variant="outlined" onClick={() => insertSlot(i + 1)}>Add Below</Button>
                            <Button color="primary" variant="outlined" onClick={() => moveSlot(i, -1)}>Move Up</Button>
                            <Button color="primary" variant="outlined" onClick={() => moveSlot(i, 1)}>Move Down</Button>
                            <Button color="primary" variant="outlined" onClick={() => deleteSlot(i)}>Delete</Button>
                        </ButtonGroup>
                        <p>Slot #{i + 1}</p>
                        <br />
                        <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="outlined" onClick={() => insertExercise(i, 0)} >Add Exercise</Button>
                        <ul style={{ listStyleType: 'none' }}>
                            {slot.map((exercise, j) =>
                                <li key={j}>
                                    {/*
                                    <Button color="primary" variant="outlined" onClick={() => insertExercise(i, j)}>Add Above</Button>
                                    <Button color="primary" variant="outlined" onClick={() => insertExercise(i, j + 1)}>Add Below</Button>
                                    <Button color="primary" variant="outlined" onClick={() => moveExercise(i, j, -1)}>Move Up</Button>
                                    <Button color="primary" variant="outlined" onClick={() => moveExercise(i, j, 1)}>Move Down</Button>
                                    */}
                                    <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="outlined" onClick={() => deleteExercise(i, j)}>Delete</Button>
                                    <br />
                                    <TextField style={{ margin: '0.5em', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} variant="outlined" color="primary" label="Title" value={exercise.title} onChange={(e) => setExerciseTitle(i, j, e.target.value)} />
                                    <br />
                                    <TextField style={{ margin: '0.5em', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} variant="outlined" color="primary" label="Buffer" type="number" value={exercise.buffer} onChange={(e) => setExerciseBuffer(i, j, e.target.value)} />
                                    <br />
                                    <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="contained" component="label">
                                        Set Image
                                        <input type="file" style={{ display: "none" }} onChange={(e) => setExerciseImage(i, j, e.target.files[0])} />
                                    </Button>
                                    <br />
                                    <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="outlined" onClick={() => insertStage(i, j, 0)} >Add Stage</Button>
                                    <ul style={{ listStyleType: 'none' }}>
                                        {exercise.stages.map((stage, k) =>
                                            <li key={k}>
                                                {/*
                                                <Button color="primary" variant="outlined" onClick={() => insertStage(i, j, k)}>Add Above</Button>
                                                <Button color="primary" variant="outlined" onClick={() => insertStage(i, j, k + 1)}>Add Below</Button>
                                                <Button color="primary" variant="outlined" onClick={() => moveStage(i, j, k, -1)}>Move Up</Button>
                                                <Button color="primary" variant="outlined" onClick={() => moveStage(i, j, k, 1)}>Move Down</Button>
                                                */}
                                                <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="outlined" onClick={() => deleteStage(i, j, k)}>Delete</Button>
                                                <br />
                                                <TextField style={{ margin: '0.5em', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} variant="outlined" color="primary" label="Action" value={stage.action} onChange={(e) => setStageAction(i, j, k, e.target.value)} />
                                                <br />
                                                <TextField style={{ margin: '0.5em', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} variant="outlined" color="primary" label="Duration" type="number" value={stage.duration} onChange={(e) => setStageDuration(i, j, k, e.target.value)} />
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
            {submitButton}
        </div>
    )
}