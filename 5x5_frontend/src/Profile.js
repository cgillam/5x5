import React, { useContext, useEffect, useState, useCallback } from "react"
import { Button, Dialog, Paper, Table, Avatar, TableBody, TableHead, TableCell, TableRow, TableContainer, FormControl, FormControlLabel, RadioGroup, FormLabel, Radio } from '@material-ui/core'
import { useLocation } from 'react-router-dom';

import UserContext from './user';

import Challenges from './Challenges'

export default function Profile({ self, loggedUser }) {
    const user = useContext(UserContext);
    // If showing challenges
    const [challenges, setChallenges] = useState(false)
    const [first, setFirst] = useState(true);

    // Form values
    const [visibility, setVisibility] = useState(loggedUser.visibility);
    const [conversion, setConversion] = useState(loggedUser.conversion);
    const [gender, setGender] = useState(loggedUser.gender);

    // Fetch the current user based on username in the URL if it's not the current profile user
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
        // Update the user whenever a form value is changed
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
                ? <Challenges setChallenges={setChallenges} loggedUser={loggedUser} />
                : <Paper
                    style={{
                        backgroundColor: '#626262', padding: '0.5em', margin: '0.5em',
                        width: 'max-content',
                        margin: '0 auto',
                        minWidth: '25vw',
                        padding: '1em',
                        borderRadius: '1em',
                    }}
                >
                    <span style={{ flex: '1' }} style={{ display: 'grid', gridTemplateColumns: 'auto auto ' + (user.profileImage ? 'auto' : ''), alignItems: 'center' }}>
                        <p style={{ flex: '1', fontSize: '18pt', color: '#ffffff' }}>Your Info</p>
                        {user.profileImage // Show profile image if available
                            ? <Avatar alt={user.userName} src={user.profileImage} style={{ flex: '1' }} />
                            : null
                        }
                        <Button variant="outlined" color="primary" style={{ flex: '1', color: '#ffffff', backgroundColor: '#7e1818', padding: '0.75em', borderRadius: '0.5em' }} onClick={() => setChallenges(!challenges)}>Show Challenges</Button>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                        <span style={{ flex: '1' }}>Username</span>
                        <span style={{ flex: '1' }} align="center">{user.userName}</span>
                    </div>
                    {user.email
                        ? <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                            <span style={{ flex: '1' }}>Email</span>
                            <span style={{ flex: '1' }} align="center">{user.email}</span>
                        </div>
                        : null
                    }
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>

                        <span style={{ flex: '1' }}>Age</span>
                        <span style={{ flex: '1' }} align="center">{user.age}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>

                        <span style={{ flex: '1' }}>Gender</span>
                        <span style={{ flex: '1' }} align="center">
                            {self
                                ? <FormControl component="fieldset" style={{ color: 'white', padding: '0.5em', borderRadius: '0.5em' }}>
                                    <RadioGroup aria-label="gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <FormControlLabel value="male" control={<Radio />} label="Male" />
                                        <FormControlLabel value="female" control={<Radio />} label="Female" />
                                    </RadioGroup>
                                </FormControl>
                                : user.gender
                            }
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                        <span style={{ flex: '1' }}>Conversion</span>
                        <span style={{ flex: '1' }} align="center">
                            {self
                                ? <FormControl component="fieldset" style={{ color: 'white', padding: '0.5em', borderRadius: '0.5em' }}>
                                    <RadioGroup aria-label="conversion" name="conversion" value={conversion} onChange={(e) => setConversion(e.target.value)}>
                                        <FormControlLabel value="kg" control={<Radio />} label="Kilograms" />
                                        <FormControlLabel value="lb" control={<Radio />} label="Pounds" />
                                    </RadioGroup>
                                </FormControl>
                                : user.conversion
                            }
                        </span>
                    </div>
                    {user.visibility
                        ? <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                            <span style={{ flex: '1' }}>Visibility</span>
                            <span style={{ flex: '1' }} align="center">
                                {self
                                    ? <FormControl component="fieldset" style={{ color: 'white', padding: '0.5em', borderRadius: '0.5em' }}>
                                        <RadioGroup aria-label="visibility" name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                                            <FormControlLabel value="public" control={<Radio />} label="Public" />
                                            <FormControlLabel value="private" control={<Radio />} label="Private" />
                                        </RadioGroup>
                                    </FormControl>
                                    : user.visibility
                                }
                            </span>
                        </div>
                        : null
                    }
                    {user.verification
                        ? <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                            <span style={{ flex: '1' }}>Verified</span>
                            <span style={{ flex: '1' }} align="center">
                                {user.verification.verified === -1 ? 'Refered' : new Date(user.verification.verified).toDateString()}
                            </span>
                        </div>
                        : null
                    }
                    {user.referalCode
                        ? <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: '#000000', color: '#ffffff', padding: '1em', borderRadius: '0.5em', marginTop: '0.75em' }}>
                            <span style={{ flex: '1' }}>Referal Code</span>
                            <span style={{ flex: '1' }} align="center">{user.referalCode}</span>
                        </div>
                        : null
                    }
                    {self // Show logout button if viewing own profile
                        ? <Button style={{ color: 'white', width: '100%' }} onClick={() => {
                            loggedUser.setUser({});
                            return fetch("/api/user/logout", { credentials: 'include' });
                        }}>Logout</Button>
                        : null
                    }
                </Paper>
            }
        </React.Fragment>
    )


}