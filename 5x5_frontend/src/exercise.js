import React from 'react'

// Context for exercise
export default React.createContext({
    _id: -1,
    title: 'Default',
    buffer: 1000,
    image: null,
    stages: [{ action: 'Default', duration: 1000 }],
})