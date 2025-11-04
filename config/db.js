const { default: mongoose } = require('mongoose')

const connectDB = async () => {
    try {
          await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected")
    } catch (error) {
        console.error("Mongodb connection error:", error.message)
    }
}
module.exports = connectDB