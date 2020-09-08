import React, { useContext, useEffect } from "react"
import { Button, Dialog, Paper, Table, TableBody, TableHead, TableCell, TableRow, TableContainer } from '@material-ui/core'
import { useLocation } from 'react-router-dom';

import UserContext from './user';

import Challenges from './Challenges'

export default function Profile({ self, loggedUser }) {
    const user = useContext(UserContext);

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
    return (
        <React.Fragment>
            <Paper
                style={{
                    backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                    boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                    width: 'max-content',
                    margin: '0 auto'
                }}
            >
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
                                <TableCell classes={{ root: 'black-paper' }} align="center">{user.gender}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell classes={{ root: 'black-paper' }}>Conversion</TableCell>
                                <TableCell classes={{ root: 'black-paper' }} align="center">{user.conversion}</TableCell>
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
                    : <p>Friend/Challenge</p>
                }
            </Paper>
            <Challenges />
        </React.Fragment>
    )


}