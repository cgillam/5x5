import React, { useState, useEffect } from 'react';
import { Link, Button, Dialog, Paper, TextField, Table, TableBody, TableHead, TableCell, TableRow, TableContainer } from '@material-ui/core'

import { fileToBase64 } from './helper'

export default function Challenges({ setChallenges, loggedUser }) {
    // Form values
    const [requesting, setRequesting] = useState('jill');
    const [ending, setEnding] = useState('');


    // challenge API data for challenge types and statuses
    const [participating, setParticipating] = useState([]);
    const [requests, setRequests] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [statuses, setStatuses] = useState([]);


    // Currently displayed video
    const [video, setVideo] = useState();

    useEffect(() => {
        (async () => {
            // Ensure statuses is first, as other endpoints may be invalid
            // if it's not
            await fetch('/api/challenge/statuses')
                .then(r => r.json())
                .then(challenges => setStatuses(challenges));
            await fetch('/api/challenge/completed')
                .then(r => r.json())
                .then(challenges => setCompleted(challenges));
            await fetch('/api/challenge/participating')
                .then(r => r.json())
                .then(challenges => setParticipating(challenges));
            await fetch('/api/challenge/requests')
                .then(r => r.json())
                .then(challenges => setRequests(challenges));
        })();
    }, []);

    return (
        <>
            <Dialog
                open={!!video}
                onClose={() => setVideo(undefined)}
                scroll="body"
                fullWidth={true}
                maxWidth={'xs'}
            >
                <video controls style={{ width: '100%' }}>
                    <source src={video} />
                </video>
            </Dialog>
            <Paper
                style={{
                    backgroundColor: 'darkgrey', padding: '0.5em',
                    boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                    margin: '0 auto',
                    width: 'min-content',
                    minWidth: '50vw'
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
                                                    // Upon joining, move into participating list
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
                                                // Upon quitting, remove from participating
                                                setParticipating(participating.filter(partChallenge => partChallenge._id !== challenge._id));
                                            })
                                        }}>Quit</Button>
                                    </TableCell>
                                </TableRow>
                            )}
                            {completed.map(challenge =>
                                <TableRow key={challenge._id}>
                                    <TableCell>{challenge.author.userName}</TableCell>
                                    <TableCell>
                                        Winners: {challenge.participants.map((p, i) => {
                                        // Add comma to front if it's not the first element
                                        const justText = <>
                                            {i > 0 && ", "}
                                            <span key={p.user._id} >{p.user.userName}</span>
                                        </>
                                        // If the user has no video, return just the span
                                        if (!challenge.videoMap) return justText;
                                        // Otherwise, return a link that opens the video
                                        return challenge.videoMap[p.user._id]
                                            ? <>
                                                {i > 0 && ", "}
                                                <Link key={p.user._id} onClick={() => setVideo(challenge.videoMap[p.user._id])}>
                                                    {p.user.userName}
                                                </Link>
                                            </>
                                            : justText;
                                    })}
                                        <br />
                                        Losers: {challenge.lost.map(p => p.user.userName).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => {
                                            fetch('/api/challenge/videos/get?id=' + challenge._id).then(r => r.json())
                                                .then(videos => {
                                                    // Build map of userID->videoData from array of userID, videoData objects
                                                    const challengeIndex = completed.findIndex(c => c._id === challenge._id);
                                                    const completedCopy = [...completed];
                                                    completedCopy.splice(challengeIndex, 1, {
                                                        ...challenge,
                                                        videoMap: videos.reduce((videoMap, { user, video }) => ({ ...videoMap, [user]: video }), {})
                                                    });
                                                    setCompleted(completedCopy);
                                                })
                                        }}>Prove a Point</Button>
                                        {challenge.videoMap && !challenge.videoMap[loggedUser._id] // If the video map is populated and the logged in user is not in it, show this button
                                            ? <Button style={{ float: 'right', boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)' }} color="primary" variant="contained" component="label">
                                                Upload Swellfie
                                                <input type="file" style={{ display: "none" }} onChange={async (e) => {
                                                    const video = e.target.files[0];
                                                    const rawVideo = await fileToBase64(video);
                                                    fetch('/api/challenge/videos/submit', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ id: challenge._id, video: rawVideo })
                                                    }).then(r => r.json())
                                                        .then(videoData => {
                                                            const challengeIndex = completed.findIndex(c => c._id === challenge._id);
                                                            const completedCopy = [...completed];
                                                            // Add video data to video map, creating if it doesn't exist
                                                            completedCopy.splice(challengeIndex, 1, {
                                                                ...challenge,
                                                                videoMap: {
                                                                    ...(challenge.videoMap || {}),
                                                                    [videoData.user]: videoData.video
                                                                }
                                                            });
                                                            setCompleted(completedCopy);
                                                        });
                                                }} />
                                            </Button>
                                            : null
                                        }
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <p>Statuses</p>
                <ul style={{ wordWrap: '' }}>
                    {statuses.map(({ text, when }) => // Combine when with text to avoid conflict when two messages have the same time - has happened on more then one occation
                        <li key={when + '_' + text}>
                            <p class="normal-font">{text} at {new Date(when).toLocaleString()}</p>
                        </li>
                    )}
                </ul>
            </Paper >
        </>
    )
}