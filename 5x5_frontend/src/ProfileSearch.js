import React, { useState, useContext, useEffect } from 'react'
import { Paper, List, ListItem, ListItemText, Button, TextField, Fab, FormControl, FormControlLabel, RadioGroup, FormLabel, Radio } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import { Link } from 'react-router-dom'
import Profile from "./Profile.js"
import UserContext from './user'


export default function ProfileSearch({ loggedUser }) {
    const user = useContext(UserContext)
    // If the search dialog is opened
    const [open, setOpen] = useState(false);
    // Found users
    const [users, setUsers] = useState([]);

    // If a search has been made
    const [searched, setSearched] = useState(false);

    // Form values
    const [query, setQuery] = useState("");
    const [queryType, setQueryType] = useState('identifier');

    // Weight of latest squat, fetch the latest weight or use 100
    const [nextSquatWeight, setNextSquatWeight] = useState(100);
    useEffect(() => {
        fetch('/api/workout/next-squat-weight')
            .then(r => r.json())
            .then(({ weight }) => setNextSquatWeight(weight))
    }, [])

    // Input for each query type
    const input = {
        identifier: <TextField label="Username/Email" required name="query" value={query} onChange={(e) => setQuery(e.target.value)} />,
        age: <TextField type="number" required label="Age" name="query" value={query} onChange={(e) => setQuery(e.target.value)} />,
        weight: <TextField type="number" required label="Weight" name="query" value={query} onChange={(e) => setQuery(e.target.value)} />,
    }[queryType];

    // Update query based on changed query type, also clear users and searched status
    useEffect(() => {
        if (queryType === 'identifier') setQuery('');
        if (queryType === 'age') setQuery(loggedUser.age.toString());
        if (queryType === 'weight') setQuery(nextSquatWeight.toString());
        setUsers([]);
        setSearched(false);
    }, [queryType])

    return (
        <span>
            <Fab
                aria-label="Search"
                onClick={() => {
                    setOpen(!open)
                    // Clear query and users when closing
                    if (open) setQuery("") || setUsers([]) || setSearched(false)
                }}
                style={{ position: 'absolute', right: '1em' }}
            >
                <SearchIcon />
            </Fab>
            {
                open
                    ? <span style={{ position: 'absolute', right: '5em', zIndex: '1' }}>
                        <Paper
                            style={{
                                backgroundColor: 'darkgrey', padding: '0.5em', margin: '0.5em',
                                boxShadow: '0px 22px 35px -14px rgba(255,255,255,1),0px 48px 72px 6px rgba(255,255,255,1),0px 18px 92px 16px rgba(255,255,255,1)',
                                width: 'max-content',
                                margin: '0 auto'
                            }}
                        >
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                const data = new FormData(e.target);
                                return fetch(`/api/user/search`, {
                                    method: 'post',
                                    body: data
                                }).then(res => res.json())
                                    .then(users => setUsers(users) || setSearched(true))
                            }}>
                                <FormControl component="fieldset" style={{ display: 'flex' }}>
                                    <RadioGroup style={{ flexDirection: 'row' }} aria-label="Query Type" name="queryType" value={queryType} onChange={(e) => setQueryType(e.target.value)}>
                                        <FormControlLabel value="identifier" control={<Radio />} label="Username/Email" />
                                        <FormControlLabel value="age" control={<Radio />} label="Age" />
                                        <FormControlLabel value="weight" control={<Radio />} label="Weight" />
                                    </RadioGroup>
                                </FormControl>
                                <span style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                    {input}

                                    <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit">Search</Button>
                                </span>
                            </form>
                            <List>
                                {users.map((foundUser) => // Each found user is clickable, and linked to their own profile page
                                    <ListItem button selected={user._id === foundUser._id} key={foundUser._id} component={Link} to={`/profile/${foundUser.userName}`}>
                                        <ListItemText>{foundUser.userName}</ListItemText>
                                    </ListItem>
                                )}
                                {users.length === 0 && searched // If there has been a search, and no users are found, show no users found
                                    ? <ListItem>
                                        <ListItemText>No users found</ListItemText>
                                    </ListItem>
                                    : null}
                            </List>
                        </Paper>
                    </span>
                    : null
            }
        </span>
    )
}