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
const res = require('express/lib/response');
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
        const blogCollection = client.db('easy-inventory-stock').collection('blog')
        // Get all product list
        app.get('/inventory', async (req, res) => {
            const query = {}
            // console.log(req.query.limit, req.query.page)
            const limit = parseInt(req.query.limit)
            const page = parseInt(req.query.page)
            const cursor = stockCollection.find(query)
            let productList
            if (limit || page) {
                productList = await cursor.skip(page * limit).limit(limit).toArray()
            } else {
                productList = await cursor.toArray()
            }
            res.send(productList)
        })
        // Stock total count
        app.get('/inventorytotal', async (req, res) => {
            const inventoryItemsCount = await stockCollection.estimatedDocumentCount();
            res.send({ inventoryItemsCount })
        })
        // Get single product details
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id)
            const query = { _id: ObjectId(id) }
            const productItem = await stockCollection.findOne(query)
            res.send(productItem)
        })
        // insert Stock Item
        app.post('/inventory', async (req, res) => {
            const newProductItem = req.body
            // console.log(newProductItem)
            const insertedProduct = await stockCollection.insertOne(newProductItem)
            // console.log(insertedProduct)
            res.send(insertedProduct)
        })

        // Delete item
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            // console.log(query)
            const result = await stockCollection.deleteOne(query)
            res.send(result)
        })

        // Add blog post
        app.post('/blogs', async (req, res) => {
            const blogItem = req.body
            const blogInserted = await blogCollection.insertOne(blogItem)
            res.send(blogInserted)
        })
        // Get Blog posts
        app.get('/blogs', async (req, res) => {
            const query = {}
            const cursor = blogCollection.find(query)
            const blogs = await cursor.toArray()
            res.send(blogs)
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