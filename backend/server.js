import http, { createServer } from 'http'
import connectDB from './config/db.js';
import app from './app.js'
const port = process.env.PORT || 3000;
connectDB();
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
// trigger nodemon restart
