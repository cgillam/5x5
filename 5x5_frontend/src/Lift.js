import React, { useState, useContext } from "react"
import Set from "./Set.js"

export default function Lift({ stage, nextLift }) {
    const [set, setSet] = useState(0);

    let content;
    if (set !== 2) {
        content = <Set number={set} nextSet={() => setSet(set + 1)} />
    } else {
        content = (
            <React.Fragment>

                <form onSubmit={(e) => {
                    e.preventDefault();

                    const comment = e.target.elements["comment"].value.trim();

                    setSet(0);
                    nextLift(comment);
                }}>
                    <textarea name="comment" placeholder="Comment" ></textarea>
                    <button>Continue to next exercise</button>
                </form>
            </React.Fragment>
        )
    }
    return (
        <React.Fragment>
            {content}
        </React.Fragment>
    )


}