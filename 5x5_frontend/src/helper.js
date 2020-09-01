// setTimeout as a promise
export const Delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Break array into groups of elements chunkLength long
export const chunkify = (arr, chunkLength) => arr.reduce((chunks, item) => {
    const current = chunks[chunks.length - 1];

    if (current && current.length < chunkLength) current.push(item)
    else chunks.push([item]);

    return chunks;
}, [])