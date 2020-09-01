import React from 'react'

// User context
export default React.createContext({
    _id: -1,
    userName: "default",
    setUser: (newUser) => { }
})