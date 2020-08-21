import React, { useState, useContext } from "react"
import Set from "./Set.js"

export default function Lift({ stage, nextLift }) {
    const [set, setSet] = useState(0);

    let content;
    if (set !== 2) {
        content = <Set number={set} nextSet={() => setSet(set + 1)} />
    } else {
        content = <button onClick={() => {
            setSet(0);
            nextLift();
        }}>Continue to next exercise</button>
    }
    return (
        <React.Fragment>
            {content}
        </React.Fragment>
    )


}