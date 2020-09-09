import React, { useContext, useEffect, useState, useCallback } from "react"
import { Button, Dialog, Paper, Table, TableBody, TableHead, TableCell, TableRow, TableContainer, FormControl, FormControlLabel, RadioGroup, FormLabel, Radio } from '@material-ui/core'
import { useLocation } from 'react-router-dom';

import UserContext from './user';

import Challenges from './Challenges'

export default function Profile({ self, loggedUser }) {
    const user = useContext(UserContext);
    const [challenges, setChallenges] = useState(false)
    const [first, setFirst] = useState(true);

    const [visibility, setVisibility] = useState(loggedUser.visibility);
    const [conversion, setConversion] = useState(loggedUser.conversion);
    const [gender, setGender] = useState(loggedUser.gender);

    const location = useLocation();
    const userName = location.pathname.split("/profile/")[1];
    useEffect(() => {
        if (userName === user.userName) return;
        fetch("/api/user/" + (userName || "current"))
            .then(r => r.json())
            .then(payload => {
                if (!userName) return user.setUser(payload);

                if (payload.message) alert(payload.message)
                if (payload.user) user.setUser(payload.user)
            })
    }, [userName])

    useEffect(() => {
        if (first) setFirst(false);
    }, [first])

    useEffect(() => {
        if (first) return;
        console.log({ visibility, conversion, gender })
        fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visibility, conversion, gender })
        }).then(r => r.json())
            .then(updatedUser => {
                if (userName === updatedUser.userName) user.setUser(updatedUser);
                loggedUser.setUser(updatedUser);
            })
    }, [visibility, conversion, gender])
    return (
        <React.Fragment>
            {challenges
                ? <Challenges setChallenges={setChallenges} />
                : <Paper
                    style={{
                        backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                        boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                        width: 'max-content',
                        margin: '0 auto'
                    }}
                >
                    <Button onClick={() => setChallenges(!challenges)}>{!challenges ? 'Show Challenges' : 'Hide Challenges'}</Button>
                    <TableContainer style={{ width: 'unset', marginTop: '0.5em', marginBottom: '0.5em' }} component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell classes={{ root: 'black-paper' }}>Username</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }} align="center">{user.userName}</TableCell>
                                </TableRow>
                                {user.email
                                    ? <TableRow>
                                        <TableCell classes={{ root: 'black-paper' }}>Email</TableCell>
                                        <TableCell classes={{ root: 'black-paper' }} align="center">{user.email}</TableCell>
                                    </TableRow>
                                    : null
                                }
                                <TableRow>

                                    <TableCell classes={{ root: 'black-paper' }}>Age</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }} align="center">{user.age}</TableCell>
                                </TableRow>
                                <TableRow>

                                    <TableCell classes={{ root: 'black-paper' }}>Gender</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }} align="center">
                                        {self
                                            ? <FormControl component="fieldset" style={{ color: 'white', backgroundColor: 'rgba(25, 25, 25, 0.5)', borderRadius: '1em' }}>
                                                <RadioGroup aria-label="gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                                                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                                                </RadioGroup>
                                            </FormControl>
                                            : user.gender
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell classes={{ root: 'black-paper' }}>Conversion</TableCell>
                                    <TableCell classes={{ root: 'black-paper' }} align="center">
                                        {self
                                            ? <FormControl component="fieldset" style={{ color: 'white', backgroundColor: 'rgba(25, 25, 25, 0.5)', borderRadius: '1em' }}>
                                                <RadioGroup aria-label="conversion" name="conversion" value={conversion} onChange={(e) => setConversion(e.target.value)}>
                                                    <FormControlLabel value="kg" control={<Radio />} label="Kilograms" />
                                                    <FormControlLabel value="lb" control={<Radio />} label="Pounds" />
                                                </RadioGroup>
                                            </FormControl>
                                            : user.conversion
                                        }
                                    </TableCell>
                                </TableRow>
                                {user.verification
                                    ? <TableRow>
                                        <TableCell classes={{ root: 'black-paper' }}>Verified</TableCell>
                                        <TableCell classes={{ root: 'black-paper' }} align="center">
                                            {user.verification.verified === -1 ? 'Refered' : new Date(user.verification.verified).toDateString()}
                                        </TableCell>
                                    </TableRow>
                                    : null
                                }
                                {user.referalCode
                                    ? <TableRow>
                                        <TableCell classes={{ root: 'black-paper' }}>Referal Code</TableCell>
                                        <TableCell classes={{ root: 'black-paper' }} align="center">{user.referalCode}</TableCell>
                                    </TableRow>
                                    : null
                                }
                                {user.visibility
                                    ? <TableRow>
                                        <TableCell classes={{ root: 'black-paper' }}>Visibility</TableCell>
                                        <TableCell classes={{ root: 'black-paper' }} align="center">
                                            {self
                                                ? <FormControl component="fieldset" style={{ color: 'white', backgroundColor: 'rgba(25, 25, 25, 0.5)', borderRadius: '1em' }}>
                                                    <RadioGroup aria-label="visibility" name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                                                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                                                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                                                    </RadioGroup>
                                                </FormControl>
                                                : user.visibility
                                            }
                                        </TableCell>
                                    </TableRow>
                                    : null
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {self
                        ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                loggedUser.setUser({});
                                return fetch("/api/user/logout", { credentials: 'include' });
                            }}>Logout</Button>
                        </div>
                        : null
                    }
                </Paper>
            }
        </React.Fragment>
    )


}