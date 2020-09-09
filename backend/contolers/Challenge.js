const Challenge = require("../models/Challenge")
const Workout = require("../models/Workout");
const User = require("../models/User");

//require('../scripts/seed.js');

exports.statuses = async (req, res) => {
    const messages = [];
    const challenges = await Challenge.find({
        $or: [
            { 'participants.user': req.user._id },
            { 'lost.user': req.user._id },
        ]
    }).populate('participants.user').populate('lost.user').populate('author')

    for (const challenge of challenges.filter(chall => chall.ended)) {
        messages.push({
            text: `${challenge.participants[0].user.userName} won ${challenge.author.userName}'s challenge`,
            when: challenge.ended.getTime()
        });
    }

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

    const interval = 604800000;
    const workoutsPerInterval = 3;
    for (const challenge of challenges.filter(chall => !chall.ended)) {
        let updated = false;
        for (const { user, joined } of [...challenge.participants]) {
            const intervalsPast = Math.max(0, Math.floor((Date.now() - joined.getTime()) / interval) - 1);
            const requiredCount = intervalsPast * workoutsPerInterval;

            const workouts = await Workout.find({
                user,
                createdAt: { $gt: joined }
            }).sort({ createdAt: -1, });
            if (workouts.length >= requiredCount) {
                let nextRollOver = new Date();
                let futureRequired = 0;
                let offset = 0;
                while (++offset) {
                    futureRequired = ((intervalsPast + offset) * workoutsPerInterval) - workouts.length;
                    nextRollOver = new Date(joined.getTime() + (interval * (intervalsPast + 1 + offset)));
                    if (futureRequired > 0) break;
                }

                if (challenge.ending && challenge.ending < nextRollOver) nextRollOver = challenge.ending;
                messages.push({
                    text: `${user.userName} must perform ${futureRequired} workout${futureRequired > 1 ? 's' : ''} by ${nextRollOver.toLocaleString()} to stay in ${challenge.author.userName}'s challenge`,
                    when: Date.now()
                })
                continue;
            }

            updated = true;

            const loserIndex = challenge.participants.findIndex(participant => participant.user._id === user._id);
            challenge.participants = challenge.participants.filter((_, i) => i !== loserIndex);
            challenge.lost = [...challenge.lost, { user, joined, lost: new Date() }]
            messages.push({
                text: `${user.userName} lost ${challenge.author.userName}'s challenge`,
                when: challenge.lost.slice(-1)[0].lost.getTime()
            });
        }
        if (challenge.participants.length === 1 && !challenge.requests.length) {
            updated = true;

            challenge.ended = new Date();
            messages.push({
                text: `${challenge.participants[0].user.userName} won ${challenge.author.userName}'s challenge`,
                when: challenge.ended.getTime()
            });
        }

        if (updated) await challenge.save();
    }

    return res.json(messages);
}

exports.create = async (req, res) => {
    const { requests, ending: rawEnding } = req.body
    const now = new Date();
    let ending = rawEnding ? new Date(rawEnding) : undefined
    if (ending < now.getTime()) ending = undefined;
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

exports.participating = async (req, res) => {
    const challenges = await Challenge.find({ 'participants.user': req.user._id, ended: { $exists: false } })
        .populate('author').populate('participants.user');

    return res.json(challenges);
}



exports.requests = async (req, res) => {
    const challenges = await Challenge.find({ requests: req.user._id, ended: { $exists: false } })
        .populate('author');

    return res.json(challenges);
}

exports.acceptRequest = async (req, res) => {
    const { id } = req.body;

    const challenge = await Challenge.findById(id).populate('author').populate('participants').populate('requests');
    if (!challenge) return res.status(404).send('challenge not found');

    const requestIndex = challenge.requests.findIndex(requestedUser => requestedUser.equals(req.user._id));
    if (requestIndex === -1) return res.status(400).send('not requested for challenge');

    challenge.requests = challenge.requests.filter((_, i) => i !== requestIndex);
    challenge.participants = [...challenge.participants, { user: req.user._id, joined: new Date() }];
    await challenge.save();

    res.json(challenge);
}

exports.quit = async (req, res) => {
    const { id } = req.body;

    const challenge = await Challenge.findById(id).populate('author').populate('participants').populate('requests');
    if (!challenge) return res.status(404).send('challenge not found');

    const participantIndex = challenge.participants.findIndex(participation => participation.user.equals(req.user._id));
    if (participantIndex === -1) return res.status(400).send('not participating in challenge');

    challenge.participants = challenge.participants.filter((_, i) => i !== participantIndex);
    await challenge.save();

    res.status(200).end();
}