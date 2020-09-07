import React from "react"
import { Button, Dialog, Paper, Table, TableBody, TableHead, TableCell, TableRow, TableContainer } from '@material-ui/core'

export default function Profile({ user, self }) {
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
                            user.setUser({});
                            return fetch("/api/user/logout", { credentials: 'include' });
                        }}>Logout</Button>
                    </div>
                    : <p>Friend/Challenge</p>
                }
            </Paper>
        </React.Fragment>
    )


}