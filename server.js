const app = require('./app');
const dotnev = require('dotenv');
const mongoose = require('mongoose');

// handle synchoronous errors
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotnev.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db).then(() => console.log('DB connection successful!'));

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// handle asynchoronous errors
process.on('unhandledRejection', (err) => {
    server.close(() => {
        console.log(err.name, err.message);
        process.exit(1);
    });
});
