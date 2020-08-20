const mongoose = require("mongoose")

module.exports = () => new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_URL, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    mongoose.connection.on("error", reject)
    mongoose.connection.on("open", resolve)
})