import React, { useState, useEffect } from 'react';



export default function Challenges() {
    const [participating, setParticipating] = useState([]);
    const [requesting, setRequesting] = useState('jill');
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
        <>
            <form onSubmit={(e) => {
                e.preventDefault();
                fetch('/api/challenge/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requests: requesting.split(',').map(un => un.trim()) }),
                }).then(r => r.json())
                    .then(challenge => {
                        setParticipating([...participating, challenge]);
                    })
                    .then(() => undefined); // todo - reset form
            }}>
                <input name="usernames" value={requesting} onChange={(e) => setRequesting(e.target.value)} />
                <button>Send</button>
            </form>
            <ul>
                <li>Participating</li>
                {participating.map(challenge =>
                    <li key={challenge._id}>
                        <p>{challenge.author.userName}</p>
                        <p>{challenge.participants.map(p => p.user.userName).join(', ')}</p>
                        <button onClick={() => {
                            fetch('/api/challenge/quit', {
                                method: 'POST',
                                body: JSON.stringify({ id: challenge._id }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then((r) => {
                                setParticipating(participating.filter(partChallenge => partChallenge._id !== challenge._id));
                            })
                        }}>Quit</button>
                    </li>
                )}
            </ul>
            <ul>
                <li>Requests</li>
                {requests.map(challenge =>
                    <li key={challenge._id}>
                        <p>{challenge.author.userName}</p>
                        <button onClick={() => {
                            fetch('/api/challenge/requests/accept', {
                                method: 'POST',
                                body: JSON.stringify({ id: challenge._id }),
                                headers: { 'Content-Type': 'application/json' }
                            }).then(r => r.json())
                                .then(challenge => {
                                    setRequests(requests.filter(requestChallenge => requestChallenge._id !== challenge._id));
                                    setParticipating([...participating, challenge])
                                })
                        }}>Join</button>
                    </li>
                )}
            </ul>
            <ul>
                <li>Statuses</li>
                {statuses.map(({ text, when }) =>
                    <li key={when}>
                        <p>{text} at {new Date(when).toLocaleString()}</p>
                    </li>
                )}
            </ul>
        </>
    )
}