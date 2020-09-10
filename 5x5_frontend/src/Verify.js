import React, { useContext, useEffect } from "react"

import UserContext from "./user.js"

export default function Verify() {
    const { _id, setUser } = useContext(UserContext);

    // Instantly scrape code from URL, change location to home, and make request to
    // api to verify code - logging in if successful
    useEffect(() => {
        const code = window.location.search.split("code=")[1].split("&")[0];

        // eslint-disable-next-line
        history.pushState(undefined, undefined, '/');

        fetch(`/api/user/verify?code=${code}`, { credentials: 'include' })
            .then((response) => response.json())
            .then((currentUser) => {
                setUser(currentUser);
            })
    }, [])

    return _id
        ? <p>Verification successful</p>
        : <p>Verifying...</p>
}