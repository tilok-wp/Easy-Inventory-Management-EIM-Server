const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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

// Token varification
const verifyAuthJWT = (req, res, next) => {
    const authorise = req.headers.authorization
    if (!authorise) {
        return res.status(401).send({ message: '401!! Unauthorized user access! Please login first' })
    }
    const receivedTocken = authorise.split(' ')[1]
    jwt.verify(receivedTocken, process.env.ACCESS_TOKEN_SECKEY, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: '403!! Forbidden access.Your request Not valid.' })
        }
        req.decoded = decoded
        next()
    })
}


async function run() {
    try {
        await client.connect();
        const stockCollection = client.db('easy-inventory-stock').collection('product')
        const blogCollection = client.db('easy-inventory-stock').collection('blog')

        // Get all product list
        app.get('/inventory', async (req, res) => {
            const query = {}
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
        // My items filter API
        app.get('/myinventory', verifyAuthJWT, async (req, res) => {
            const email = req.query.email
            const varifyed = req.decoded.email
            if (email === varifyed) {
                const query = { userEmail: email }
                const cursor = stockCollection.find(query)
                const filterProduct = await cursor.toArray()
                res.send(filterProduct)
            } else {
                res.status(403).send({ message: '403!! Forbidden access.' })
            }

        })
        // Stock total count
        app.get('/inventorytotal', async (req, res) => {
            const inventoryItemsCount = await stockCollection.estimatedDocumentCount();
            res.send({ inventoryItemsCount })
        })
        // Get single product details
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const productItem = await stockCollection.findOne(query)
            res.send(productItem)
        })
        // insert Stock Item
        app.post('/inventory', async (req, res) => {
            const newProductItem = req.body
            const insertedProduct = await stockCollection.insertOne(newProductItem)
            res.send(insertedProduct)
        })

        // Delete item
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await stockCollection.deleteOne(query)
            res.send(result)
        })
        // Update inventory
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStock = req.body
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    quantity: updatedStock.quantity,
                    delivered: updatedStock.delivered
                }
            };

            const result = stockCollection.updateOne(filter, updatedDoc, option)
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

        // Generate Token key
        app.post('/generate-token', async (req, res) => {
            const email = req.body
            const secretToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECKEY, {
                expiresIn: '600m'
            })
            res.send({ secretToken })
        })


    }
    finally { }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Easy Inventory Management server is running.......!')
})



app.listen(port, () => {
    console.log('EIM server running port is: ', port)
})