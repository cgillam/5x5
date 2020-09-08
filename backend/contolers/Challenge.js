const Challenge = require("../models/Challenge")
const Workout = require("../models/Workout");
const User = require("../models/User");

//require('../scripts/seed.js');

exports.statuses = async (req, res) => {
    const messages = [];
    const challenges = await Challenge.find({ 'participants.user': req.user._id }).populate('participants.user').populate('lost.user').populate('author')

    for (const challenge of challenges.filter(chall => chall.ended)) {
        messages.push({
            text: `${challenge.participants[0].user.userName} won ${challenge.author.userName}'s challenge`,
            when: challenge.ended.getTime()
        });
    }

    for (const challenge of challenges.filter(chall => !chall.ended)) {
        let updated = false;
        for (const { user, joined } of [...challenge.participants]) {
            const lastThree = await Workout.find({
                user,
                //createdAt: { $gt: joined }
            }).sort({ createdAt: -1, }).limit(3);
            if (!lastThree.length) {
                // todo - n workouts every week...
            }
            else {
                if (lastThree.length === 3) {
                    const oldestWorkout = lastThree.slice(-1)[0];
                    const weekAgo = new Date(Date.now() - 604800000);

                    if (oldestWorkout < weekAgo) continue;
                    // todo - handle workouts done before joined...
                }
                else {

                }
            }
            if (true) continue;
            console.log(user, 'lost', joined);
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
    const { requests } = req.body

    const challenge = await new Challenge({
        author: req.user,
        participants: [{ user: req.user, joined: new Date() }],
        requests: (await Promise.all(requests.map(un => User.findByUserName(un)))).filter(Boolean),
        lost: [],
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

    console.log(participantIndex)
    console.log(challenge.participants)
    challenge.participants = challenge.participants.filter((_, i) => i !== participantIndex);
    console.log(challenge.participants)
    console.log(participantIndex)
    await challenge.save();

    res.status(200).end();
}