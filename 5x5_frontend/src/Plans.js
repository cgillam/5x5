import React, { useStage, useEffect, useState } from 'react';
import PlanForm from './PlanForm'

const cloneCurrentPlan = (plans, id) => ({ ...JSON.parse(JSON.stringify(plans.find((plan) => plan._id === id) || { exerciseSlots: [] })) })

export default function Plans({ plans, setPlans, planID, setPlanID }) {
    const [editingPlan, setEditingPlan] = useState(cloneCurrentPlan(plans, planID))

    useEffect(() => {
        setEditingPlan(cloneCurrentPlan(plans, planID))
    }, [planID])

    const addPlan = (plan) => {
        setPlans([...plans, plan])
        setPlanID(plan._id)
    }

    return (
        <React.Fragment>
            <ul>
                {plans.map((plan) =>
                    <li
                        key={plan._id}
                        onClick={() => setPlanID(plan._id)}
                    >
                        <button onClick={() => {
                            fetch("/api/plans/" + plan._id, {
                                method: "delete"
                            }).then(response => {
                                if (!response.ok) return
                                const planIndex = plans.findIndex((loopPlan) => loopPlan._id === plan._id);
                                const newPlans = plans.filter((_, i) => i !== planIndex);
                                setPlans(newPlans);
                                if (planID === plan._id && newPlans.length) setPlanID(newPlans[planIndex === newPlans.length ? planIndex - 1 : planIndex]._id);
                            })
                        }}>Delete</button>
                        <p>Author: {plan.author}</p>
                        <p>Created: {plan.createdAt}</p>
                        <ul>
                            {plan.exerciseSlots.map((slot, i) =>
                                <li key={i} >
                                    <p>slot: {i + 1}</p>
                                    <ul>
                                        {slot.map((exercise) =>
                                            <li key={exercise._id} >
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
                                        )}

                                    </ul>
                                </li>
                            )}

                        </ul>
                    </li>
                )}
            </ul>
            <PlanForm plan={editingPlan} setPlan={setEditingPlan} addPlan={addPlan} />
        </React.Fragment>
    )
}