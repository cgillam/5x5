import React, { useContext, useRef, useState } from "react"
import { Button, TextField, Paper, Box, Grid, Dialog, DialogTitle, Link, FormControl, FormControlLabel, RadioGroup, FormLabel, Radio } from '@material-ui/core'

import UserContext from './user.js'
import FeaturesImage from './gif 1.gif'

import { fileToBase64 } from './helper'

export default function Authenticate() {
    // Get user ID and setUser
    const { _id, setUser } = useContext(UserContext)
    const [intro, setIntro] = useState(false);
    const [action, setAction] = useState("Login");
    const otherAction = action === "Login"
        ? "Signup"
        : "Login"

    // Form values
    const [conversion, setConversion] = useState("lb");
    const [gender, setGender] = useState("male");
    const [visibility, setVisibility] = useState("public");
    const [image, setImage] = useState(undefined);

    // Reference to form, to easly create formdata object
    const formRef = useRef(null)

    // If logged in, show nothing
    if (_id) return null;

    // Handle form submission - both for login and signup
    const submitForm = async () => {
        const data = new FormData(formRef.current);
        data.set('profileImage', image ? await fileToBase64(image) : undefined);
        return fetch(`/api/user/${action.toLowerCase()}`, {
            method: 'post',
            body: data,
            credentials: "include"
        }).then(res => {
            // Return parsed user object if successful
            const cpy = res.clone();
            if (res.ok) return res.json().catch(() => cpy.text().then(text => {
                alert(text);
                return {};
            }));

            // Display text of non-OK response
            res.text().then((text) => alert(text));
            return {}
        }).then(currUser => setUser(currUser))
    }

    return (
        <Grid container justify="center" style={{ minHeight: '95vh', paddingTop: '1em', position: 'relative' }}>
            <Paper style={{
                margin: 'auto',
                padding: '0.5em',
                backgroundColor: '#000000',
                minHeight: '60vh',
                minWidth: '25vw',
                borderRadius: '1em'
            }} elevation={5} >
                <form
                    ref={formRef}
                    onSubmit={(e) => {
                        e.preventDefault()
                        submitForm();
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2em',
                        height: '100%',
                        padding: '0 1em'
                    }}
                >
                    {action === 'Signup' // Show different components for signup/login
                        ? <>
                            <h4 style={{ color: '#ffffff', fontSize: '18pt', marginBottom: '0' }}>Sign Up</h4>
                            <span style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto',
                                gap: '1em'
                            }}>
                                <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Email" name="email" />
                                <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Username" name="userName" />
                                <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Age" name="age" type="number" min="10" max="100" />
                                <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" type="password" label="Password" name="password" />
                                <FormControl component="fieldset" style={{ color: '#ffffff', backgroundColor: '#2e2e2e', borderRadius: '0.5em', padding: '0.5em' }}>
                                    <RadioGroup aria-label="conversion" name="conversion" value={conversion} onChange={(e) => setConversion(e.target.value)}>
                                        <FormControlLabel value="kg" control={<Radio />} label="Kilograms" />
                                        <FormControlLabel value="lb" control={<Radio />} label="Pounds" />
                                    </RadioGroup>
                                </FormControl>
                                <FormControl component="fieldset" style={{ color: '#ffffff', backgroundColor: '#2e2e2e', borderRadius: '0.5em', padding: '0.5em' }}>
                                    <RadioGroup aria-label="gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <FormControlLabel value="male" control={<Radio />} label="Male" />
                                        <FormControlLabel value="female" control={<Radio />} label="Female" />
                                    </RadioGroup>
                                </FormControl>
                                <FormControl component="fieldset" style={{ color: '#ffffff', backgroundColor: '#2e2e2e', borderRadius: '0.5em', padding: '0.5em' }}>
                                    <RadioGroup aria-label="visibility" name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                                    </RadioGroup>
                                </FormControl>
                                <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Referal code" name="referalCode" />
                                <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="contained" component="label">
                                    Upload Profile Picture
                                    <input type="file" style={{ display: "none" }} onChange={(e) => setImage(e.target.files[0])} />
                                </Button>
                                <br />
                            </span>
                        </>
                        : <>
                            <h4>&nbsp;</h4>
                            <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Username/Email" name="userName" />
                            <TextField style={{ color: '#ffffff' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" type="password" label="Password" name="password" />
                        </>
                    }
                    <Button variant="outlined" color="primary" style={{ color: '#ffffff', backgroundColor: '#7e1818', padding: '0.75em', borderRadius: '0.5em' }} type="submit">{action}</Button>
                    <Link onClick={() => setAction(otherAction)} style={{ fontSize: '14pt', textAlign: 'center', color: '#ffffff', cursor: 'pointer' }}>{action === 'Signup' ? 'Go back to Login' : "Don't have an account? Sign Up"}</Link>
                    {action === 'Login'
                        ? <Link disabled style={{ cursor: 'not-allowed', fontSize: '14pt', textAlign: 'center', color: '#474747' }}>Forgot username or password?</Link>
                        : null
                    }
                    <Button onClick={() => setIntro(true)} variant="outlined" color="primary" style={{ color: '#ffffff', gridColumn: '1/3' }} >Introduction</Button>
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