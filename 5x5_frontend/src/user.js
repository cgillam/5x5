import React from 'react'

// User context
export default React.createContext({
    _id: -1,
    userName: "default",
    age: 1,
    email: 'email',
    conversion: 'lb',
    setUser: (newUser) => { },
    toUserWeight: (lb) => { },
    fromUserWeight: (weight) => { }
})