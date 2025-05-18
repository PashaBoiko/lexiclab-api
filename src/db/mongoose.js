import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error with mongoDB connection'));

export default db;