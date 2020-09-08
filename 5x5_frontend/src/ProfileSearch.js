import React, { useState, useContext } from 'react'
import { Paper, List, ListItem, ListItemText, Button, TextField, Fab } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
import { Link } from 'react-router-dom'
import Profile from "./Profile.js"
import UserContext from './user'


export default function ProfileSearch() {
    const user = useContext(UserContext)
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);

    return (
        <span>
            <Fab
                aria-label="Search"
                onClick={() => {
                    setOpen(!open)
                    if (open) setQuery("") || setUsers([])
                }}
                style={{ position: 'absolute', right: '1em' }}
            >
                <SearchIcon />
            </Fab>
            {
                open
                    ? <span style={{ position: 'absolute', right: '5em' }}>
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
                                    .then(users => setUsers(users))
                            }}>
                                <TextField label="Query" name="query" value={query} onChange={(e) => setQuery(e.target.value)} />
                                <Button variant="outlined" color="primary" style={{ color: 'white' }} classes={{ label: 'left-label' }} type="submit">Search</Button>
                            </form>
                            <List>
                                {users.map((foundUser) =>
                                    <ListItem button selected={user._id === foundUser._id} key={foundUser._id} component={Link} to={`/profile/${foundUser.userName}`}>
                                        <ListItemText>{foundUser.userName}</ListItemText>
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </span>
                    : null
            }
        </span>
    )
}