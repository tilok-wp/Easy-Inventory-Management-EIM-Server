const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware to pass data between two server
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Easy Inventory Management server is running.......!')
})

app.listen(port, () => {
    console.log('Easy Inventory Management server running port is: ', port)
})