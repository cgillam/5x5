import React, { useContext } from "react"
import UserContext from './user.js'

export default function Authenticate() {
    const user = useContext(UserContext)
    if (user._id) return (
        <button onClick={() => {
            fetch("/api/user/logout", { credentials: 'include' })
                .then((res) => {
                    console.log(res)
                    user.setUser({})
                })
        }}>
            log out of {user.userName}
        </button>
    );


    return (
        <form onSubmit={(e) => {
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

        }}>
            <input name="userName" placeholder="Username" />
            <input name="password" placeholder="Password" />
            <button name="action" value="login">Login</button>
            <button name="action" value="signup">sighn up</button>


        </form >


    )
}