import React, { useState, useEffect } from 'react';
import { Button, Dialog, Paper, TextField, Table, TableBody, TableHead, TableCell, TableRow, TableContainer } from '@material-ui/core'


export default function Challenges({ setChallenges }) {
    const [participating, setParticipating] = useState([]);
    const [requesting, setRequesting] = useState('jill');
    const [ending, setEnding] = useState('');
    const [requests, setRequests] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        (async () => {
            await fetch('/api/challenge/statuses')
                .then(r => r.json())
                .then(challenges => setStatuses(challenges));
            await fetch('/api/challenge/participating')
                .then(r => r.json())
                .then(challenges => setParticipating(challenges));
            await fetch('/api/challenge/requests')
                .then(r => r.json())
                .then(challenges => setRequests(challenges));
        })();
    }, []);

    return (
        <Paper
            style={{
                backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                width: 'max-content',
                margin: '0 auto'
            }}
        >
            <Button onClick={() => setChallenges(false)}>Hide Challenges</Button>
            <form onSubmit={(e) => {
                e.preventDefault();
                fetch('/api/challenge/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requests: requesting.split(',').map(un => un.trim()),
                        ending
                    }),
                }).then(r => r.json())
                    .then(challenge => {
                        setParticipating([...participating, challenge]);
                    })
                    .then(() => undefined); // todo - reset form
            }} style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto'
            }}>
                <TextField style={{ gridColumn: '1 / 3' }} label="Usernames" name="usernames" required value={requesting} onChange={(e) => setRequesting(e.target.value)} />
                <TextField type="date" name="ending" value={ending} onChange={(e) => setEnding(e.target.value)} />
                <Button type="submit">Send Requests</Button>
            </form>
            <p>Current Challenges</p>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Author</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map(challenge =>
                            <TableRow key={challenge._id}>
                                <TableCell>{challenge.author.userName}</TableCell>
                                <TableCell>{challenge.participants.map(p => p.user.userName).join(', ')}</TableCell>
                                <TableCell>
                                    <Button onClick={() => {
                                        fetch('/api/challenge/requests/accept', {
                                            method: 'POST',
                                            body: JSON.stringify({ id: challenge._id }),
                                            headers: { 'Content-Type': 'application/json' }
                                        }).then(r => r.json())
                                            .then(challenge => {
                                                setRequests(requests.filter(requestChallenge => requestChallenge._id !== challenge._id));
                                                setParticipating([...participating, challenge])
                                            })
                                    }}>Join</Button>
                                </TableCell>
                            </TableRow>
                        )}
                        {participating.map(challenge =>
                            <TableRow key={challenge._id}>
                                <TableCell>{challenge.author.userName}</TableCell>
                                <TableCell>{challenge.participants.map(p => p.user.userName).join(', ')}</TableCell>
                                <TableCell>
                                    <Button onClick={() => {
                                        fetch('/api/challenge/quit', {
                                            method: 'POST',
                                            body: JSON.stringify({ id: challenge._id }),
                                            headers: { 'Content-Type': 'application/json' }
                                        }).then((r) => {
                                            setParticipating(participating.filter(partChallenge => partChallenge._id !== challenge._id));
                                        })
                                    }}>Quit</Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <ul>
                <li>Statuses</li>
                {statuses.map(({ text, when }) =>
                    <li key={when + '_' + text}>
                        <p>{text} at {new Date(when).toLocaleString()}</p>
                    </li>
                )}
            </ul>
        </Paper >
    )
}