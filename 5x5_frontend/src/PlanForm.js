import React from "react"


export default function PlanForm({ plan, setPlan, addPlan }) {
    const insertSlot = (i) => {
        const newSlots = [...plan.exerciseSlots];
        newSlots.splice(i, 0, [])
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
        newSlots[i].splice(j, 0, { title: 'new', buffer: 1000, stages: [] })
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
        newSlots[i][j].stages.splice(k, 0, { action: 'new', duration: 1000 })
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

    const submitButton = <button onClick={() => fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
    }).then(r => console.log(r) || r.json()).then(({ plan }) => addPlan(plan))}>Submit</button>

    return (
        <div>
            {submitButton}
            <ul>
                {!plan.exerciseSlots.length
                    ? <li><button onClick={() => insertSlot(0)} >Add Slot</button></li>
                    : null
                }
                {plan.exerciseSlots.map((slot, i) =>
                    <li key={i}>
                        <button onClick={() => insertSlot(i)}>Add Above</button>
                        <button onClick={() => insertSlot(i + 1)}>Add Below</button>
                        <button onClick={() => moveSlot(i, -1)}>Move Up</button>
                        <button onClick={() => moveSlot(i, 1)}>Move Down</button>
                        <button onClick={() => deleteSlot(i)}>Delete</button>
                        <p>Slot #{i + 1}</p>
                        <ul>
                            {!slot.length
                                ? <li><button onClick={() => insertExercise(i, 0)} >Add Exercise</button></li>
                                : null
                            }
                            {slot.map((exercise, j) =>
                                <li key={j}>
                                    <button onClick={() => insertExercise(i, j)}>Add Above</button>
                                    <button onClick={() => insertExercise(i, j + 1)}>Add Below</button>
                                    <button onClick={() => moveExercise(i, j, -1)}>Move Up</button>
                                    <button onClick={() => moveExercise(i, j, 1)}>Move Down</button>
                                    <button onClick={() => deleteExercise(i, j)}>Delete</button>
                                    <br />
                                    <label>Title: <input value={exercise.title} onChange={(e) => setExerciseTitle(i, j, e.target.value)} /></label>
                                    <br />
                                    <label>Buffer: <input type="number" value={exercise.buffer} onChange={(e) => setExerciseBuffer(i, j, e.target.value)} /></label>
                                    <ul>
                                        {!exercise.stages.length
                                            ? <li><button onClick={() => insertStage(i, j, 0)} >Add Stage</button></li>
                                            : null
                                        }
                                        {exercise.stages.map((stage, k) =>
                                            <li key={k}>
                                                <button onClick={() => insertStage(i, j, k)}>Add Above</button>
                                                <button onClick={() => insertStage(i, j, k + 1)}>Add Below</button>
                                                <button onClick={() => moveStage(i, j, k, -1)}>Move Up</button>
                                                <button onClick={() => moveStage(i, j, k, 1)}>Move Down</button>
                                                <button onClick={() => deleteStage(i, j, k)}>Delete</button>
                                                <br />
                                                <label>Action: <input value={stage.action} onChange={(e) => setStageAction(i, j, k, e.target.value)} /></label>
                                                <br />
                                                <label>Duration: <input type="number" value={stage.duration} onChange={(e) => setStageDuration(i, j, k, e.target.value)} /></label>
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