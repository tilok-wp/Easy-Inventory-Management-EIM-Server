const express = require('express');
const cors = require('cors');
const app = express();
// Must need to add local .env file content here
require('dotenv').config()
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware to pass data between two server
app.use(cors());
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.zjdoc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const collection = client.db("easy-inventory-stock").collection("product");
//     // perform actions on the collection object
//     console.log('Db connected')
//     client.close();
// });

async function run() {
    try {
        await client.connect();
        const stockCollection = client.db('easy-inventory-stock').collection('product')
        // Get all product list
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = stockCollection.find(query)
            const itemsList = await cursor.toArray()

            res.send(itemsList)
        })
        // Get single product details
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: ObjectId(id) }
            const productItem = await stockCollection.findOne(query)
            res.send(productItem)
        })
    }
    finally { }
}
run().catch(console.dir)














app.get('/', (req, res) => {
    res.send('Easy Inventory Management server is running.......!')
})



app.listen(port, () => {
    console.log('Easy Inventory Management server running port is: ', port)
})