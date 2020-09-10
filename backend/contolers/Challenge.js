const Challenge = require("../models/Challenge")
const Workout = require("../models/Workout");
const User = require("../models/User");

// Toggleable comment to run script command in dev enviroment without stoping, running, and restarting dev enviroment
//require('../scripts/seed.js');


// Checks and updates challenges, returning eent messages
exports.statuses = async (req, res) => {
    const messages = [];
    // Get all challenges user is a participant or loser of
    const challenges = await Challenge.find({
        $or: [
            { 'participants.user': req.user._id },
            { 'lost.user': req.user._id },
        ]
    }).populate('participants.user').populate('lost.user').populate('author')

    // Add message describing the winner for all ended challenges
    for (const challenge of challenges.filter(chall => chall.ended)) {
        const winningNames = challenge.participants.map(part => part.user.userName).join(', ');
        messages.push({
            text: `${winningNames} won ${challenge.author.userName}'s challenge`,
            when: challenge.ended.getTime()
        });
    }

    // End all messages that are ending in the past
    const now = new Date();
    for (const challenge of challenges.filter(chall => chall.ending <= now)) {
        challenge.ended = new Date();
        const winningNames = challenge.participants.map(part => part.user.userName).join(', ');
        messages.push({
            text: `${winningNames} won ${challenge.author.userName}'s challenge`,
            when: challenge.ended.getTime()
        });
        await challenge.save();
    }

    // Go through all challenges that have not ended
    const interval = 604800000;
    const workoutsPerInterval = 3;
    for (const challenge of challenges.filter(chall => !chall.ended)) {
        let updated = false;
        // Go through all partipants
        for (const { user, joined } of [...challenge.participants]) {
            // Calculate number of intervals that have passed, minus one
            const intervalsPast = Math.max(0, Math.floor((Date.now() - joined.getTime()) / interval) - 1);
            // Number of workouts required based on number of intervals passed and required workouts per interval
            const requiredCount = intervalsPast * workoutsPerInterval;

            // Get all user workouts that were done after the joined, sorted in latest-first order
            const workouts = await Workout.find({
                user,
                createdAt: { $gt: joined }
            }).sort({ createdAt: -1, });

            // If the user has done enough or more then the required workouts
            if (workouts.length >= requiredCount) {
                // Continue checking how many workouts the user must do,
                // going forward week by week until the user actually needs to do some workouts
                let nextRollOver = new Date();
                let futureRequired = 0;
                let offset = 0;
                while (++offset) {
                    futureRequired = ((intervalsPast + offset) * workoutsPerInterval) - workouts.length;
                    nextRollOver = new Date(joined.getTime() + (interval * (intervalsPast + 1 + offset)));
                    // Break out of loop once user needs to do some workouts by nextRollOver
                    if (futureRequired > 0) break;
                }

                // If the challenge is set to end at a time, prevent nextRollOver from being after that time
                if (challenge.ending && challenge.ending < nextRollOver) nextRollOver = challenge.ending;
                messages.push({
                    text: `${user.userName} must perform ${futureRequired} workout${futureRequired > 1 ? 's' : ''} by ${nextRollOver.toLocaleString()} to stay in ${challenge.author.userName}'s challenge`,
                    when: Date.now()
                })
                continue;
            }
            // Otherwise, the user has not done the required number of workouts
            // therefore move them from partipants to losers

            updated = true;

            // Find index of participant
            const participantIndex = challenge.participants.findIndex(participant => participant.user._id === user._id);
            // Filter out participant with matching index
            challenge.participants = challenge.participants.filter((_, i) => i !== participantIndex);
            // Add participant to lost array
            challenge.lost = [...challenge.lost, { user, joined, lost: new Date() }]
            messages.push({
                text: `${user.userName} lost ${challenge.author.userName}'s challenge`,
                when: challenge.lost.slice(-1)[0].lost.getTime()
            });
        }
        // If challenge has only one particpant and no pending requests, then it has been won
        if (challenge.participants.length === 1 && !challenge.requests.length) {
            updated = true;

            challenge.ended = new Date();
            messages.push({
                text: `${challenge.participants[0].user.userName} won ${challenge.author.userName}'s challenge`,
                when: challenge.ended.getTime()
            });
        }
        // If the challenge has been updated, save it
        if (updated) await challenge.save();
    }

    return res.json(messages);
}

// Allow to create new challenge
exports.create = async (req, res) => {
    const { requests, ending: rawEnding } = req.body
    const now = new Date();

    // If ending is given, only accept if it not in the past,
    // otherwise ignore it
    let ending = rawEnding ? new Date(rawEnding) : undefined
    if (ending < now.getTime()) ending = undefined;
    // Create new challenge with the author as the first participant,
    // and adding all requested users
    // TODO - notify user of failed requests
    const challenge = await new Challenge({
        author: req.user,
        participants: [{ user: req.user, joined: new Date() }],
        requests: (await Promise.all(requests.map(un => User.findByUserName(un)))).filter(Boolean),
        lost: [],
        ending
    })
    await challenge.save();

    res.json(challenge);
}


// Get all challenges the user is participating in
exports.participating = async (req, res) => {
    // Find all challenges the user is a participant in that haven't ended, populating the author and other participants
    const challenges = await Challenge.find({ 'participants.user': req.user._id, ended: { $exists: false } })
        .populate('author').populate('participants.user');

    return res.json(challenges);
}


// Get all completed challenges
exports.completed = async (req, res) => {
    // Find all challenges that user is participating in or has lost that have ended,
    // aka has won or lost

    // Populate both participants and losers to display them
    const challenges = await Challenge.find({
        $or: [
            { 'participants.user': req.user._id },
            { 'lost.user': req.user._id },
        ],
        ended: { $exists: true }
    }).populate('participants.user').populate('lost.user').populate('author')

    return res.json(challenges);
}


// Get all challenges the user has been requested to join
exports.requests = async (req, res) => {
    // Find all challenges the user is a member of requests that have not ended, populating only user
    const challenges = await Challenge.find({ requests: req.user._id, ended: { $exists: false } })
        .populate('author');

    return res.json(challenges);
}

// Accept a challenge request
exports.acceptRequest = async (req, res) => {
    const { id } = req.body;

    // Find challenge by id
    const challenge = await Challenge.findById(id).populate('author').populate('requests');
    if (!challenge) return res.status(404).send('challenge not found');

    // Find index of request, returning if the user was never requested
    const requestIndex = challenge.requests.findIndex(requestedUser => requestedUser.equals(req.user._id));
    if (requestIndex === -1) return res.status(400).send('not requested for challenge');

    // Remove request from requests, and add participant object to participants array
    challenge.requests = challenge.requests.filter((_, i) => i !== requestIndex);
    challenge.participants = [...challenge.participants, { user: req.user._id, joined: new Date() }];
    await challenge.save();

    res.json(challenge);
}


// Quit a participating challenge
exports.quit = async (req, res) => {
    const { id } = req.body;

    // Find challenge by id
    const challenge = await Challenge.findById(id).populate('author').populate('participants').populate('requests');
    if (!challenge) return res.status(404).send('challenge not found');

    // Find index of participant object, returning if not found
    const participantIndex = challenge.participants.findIndex(participation => participation.user.equals(req.user._id));
    if (participantIndex === -1) return res.status(400).send('not participating in challenge');

    // Remove participant from participants
    challenge.participants = challenge.participants.filter((_, i) => i !== participantIndex);
    await challenge.save();

    res.status(200).end();
}

exports.submitVideo = async (req, res) => {
    const { id: _id, video } = req.body;
    // Toggleable comment to save browser-base64-encoded video on server
    //require('fs').writeFileSync('./earth.mp4.b64', video);

    const createdAt = new Date()
    // Get all challenge videos with video data selected
    const challenge = await Challenge.find({
        _id,
        ended: { $exists: false },
        $or: [
            { 'participants.user': req.user._id },
            { 'lost.user': req.user._id },
        ]
    }).select('videos.video');
    // TODO - ensure previous video data is not lost
    // Add new video data to videos array
    challenge.videos = [...challenge.videos, { user: req.user._id, video, createdAt }]
    await challenge.save()

    return res.json({ user: req.user._id, video, createdAt: createdAt.getTime() });
}


// Get all video data for challenge
exports.getVideos = async (req, res) => {
    const { id } = req.query;

    // Find challenge by id, selecting the videos video and user
    const challenge = await Challenge.findById(id).select('videos.video').select('videos.user')

    return res.json(challenge.videos)
}