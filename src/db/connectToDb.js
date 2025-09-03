const mongoose = require('mongoose')

const connectToDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
        );

        console.log(
            "\nDatabase connected to host: ",
            connectionInstance.connection.host
        );
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
};

module.exports = connectToDb