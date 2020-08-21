import React from 'react'

export default React.createContext({
    _id: -1,
    title: 'Default',
    buffer: 1000,
    stages: [{ action: 'Default', duration: 1000 }],
})