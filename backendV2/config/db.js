const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async (io) => {
  // Removed 'collections' parameter
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to ${conn.connection.host}`.bgCyan.white);

    // Fetch all collections from the database
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    // Set up change streams for each collection
    setUpChangeStreams(conn.connection, io, collectionNames);
  } catch (error) {
    console.log(`Error in MongoDB ${error}`.bgRed.white);
  }
};

const setUpChangeStreams = (connection, io, collectionNames) => {
  collectionNames.forEach((collectionName) => {
    const collection = connection.collection(collectionName);
    const changeStream = collection.watch();

    changeStream.on("change", (change) => {
      console.log(`Change occurred in ${collectionName}:`, change);
      io.emit(`${collectionName}Change`, change); // Emit event with change data
    });
  });
};

module.exports = connectDB;
