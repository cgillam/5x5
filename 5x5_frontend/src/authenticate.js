import React, { useContext, useRef, useState } from "react"
import UserContext from './user.js'
import { Button, TextField, Paper, Box, Grid, Dialog, DialogTitle } from '@material-ui/core'
import FeaturesImage from './gif 1.gif'

export default function Authenticate() {
    const user = useContext(UserContext)
    const [intro, setIntro] = useState(false);

    const formRef = useRef(null)
    if (user._id) return (
        <Button
            onClick={() => {
                fetch("/api/user/logout", { credentials: 'include' })
                    .then((res) => {
                        console.log(res)
                        user.setUser({})
                    })
            }}
            style={{
                position: 'fixed',
                top: 0,
                right: 0
            }}
        >Log Out</Button>
    );

    const submitForm = (login) => {
        const data = new FormData(formRef.current);
        fetch(`/api/user/${login ? "login" : "signup"}`, {
            method: 'post',
            body: data,
            credentials: "include"
        }).then(res => {
            if (res.ok) return res.json()

            res.text().then((text) => alert(text));
            return {}
        })

            .then(newUser => {
                user.setUser(newUser)
            })

    }

    return (
        <Grid container justify="center" style={{ minHeight: '75vh' }}>
            <Paper style={{ margin: 'auto', padding: '0.5em', backgroundColor: 'black' }} elevation={5} >
                <form
                    ref={formRef}
                    onSubmit={(e) => {
                        e.preventDefault()
                        submitForm(true);
                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto'
                    }}
                >
                    <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Username" name="userName" />
                    <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" type="password" label="Password" name="password" />
                    <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit" name="action" value="login">Login</Button>
                    <Button onClick={() => submitForm(false)} variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} name="action" value="signup">Sign Up</Button>
                    <Button onClick={() => setIntro(true)} variant="outlined" color="primary" style={{ color: 'white', gridColumn: '1/3' }} >Introduction</Button>
                    <Dialog
                        open={intro}
                        onClose={() => setIntro(false)}
                        scroll="body"
                        fullWidth={true}
                        maxWidth={'md'}
                        classes={{ paperScrollBody: 'intro-modal' }}
                    >
                        <DialogTitle>Introduction</DialogTitle>

                        <img src={FeaturesImage} alt="Features" style={{ width: '90%' }} />
                        <span style={{ textAlign: 'left' }}>
                            <p>
                                Users must create a unique username and a password longer than three characters.
                            </p>
                            <p>
                                Once a user has logged in and chosen to star their workout they may either set the weight of their exercise (in KG) or a beginner may chose for us to suggest a starting weight. A user may chose to see a demonstration of their exercise using the view help button.
                                (Each workout will consist of 3 exercises, each exercise will consist of five sets of five reps.)
                            </p>
                            <p>
                                Once a user has set their weight they are given 20 seconds to get in position. They then will be given an audio and visual guide of their lift.
                                A mutable drum beat sounds once half way down the lift at the bottom and half way up their lift and then three times once at the top.
                                (This allows a user to keep in perfect sync with the lift and by doing so the user will be at the optimal time under tension for developing strength and muscle growth.)
                            </p>
                            <p>
                                The user is then given 20 seconds to rack the weight. Once unburdened the user is visually guided through a square breathing exercise (4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds hold) this allows the users muscles to regain strength while calming their breathing to allow optimal levels of oxygen and steady their heart rate. They are then given 20 seconds to reset with the bar and the cycle repeats until the user has completed all 5 sets.
                                The user is then able to make their way to their next exercise and when ready may restart the tracker.
                            </p>
                        </span>
                    </Dialog>
                </form >
            </Paper>
        </Grid >
    )
}