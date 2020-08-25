import React, { useContext } from "react"
import UserContext from './user.js'
import { Button, TextField, Paper, Box, Grid } from '@material-ui/core'

export default function Authenticate() {
    const user = useContext(UserContext)
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


    return (
        <Grid container justify="center" style={{ minHeight: '75vh' }}>
            <Paper style={{ margin: 'auto', padding: '0.5em', backgroundColor: 'black' }} elevation={5} >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        const data = new FormData(e.target)
                        fetch(`/api/user/${e.nativeEvent.submitter.value}`, {
                            method: 'post',
                            body: data,
                            credentials: "include"
                        }).then(res => console.log(res) || res.json())
                            .then(newUser => {
                                user.setUser(newUser)
                            })

                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto'
                    }}
                >
                    <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" label="Username" name="userName" />
                    <TextField style={{ color: 'white' }} classes={{ root: 'white-input' }} variant="outlined" color="primary" type="password" label="Password" name="password" />
                    <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit" name="action" value="login">Login</Button>
                    <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit" name="action" value="signup">Sign Up</Button>
                </form >
            </Paper>
        </Grid >
    )
}