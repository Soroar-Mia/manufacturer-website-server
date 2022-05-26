const express = require('express');
const cors = require('cors');
const  jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rka2j.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
try{
    await client.connect();
    const serviceCollection = client.db('car_parts_manufacturer').collection('services');
    const userCollection = client.db('car_parts_manufacturer').collection('users');

    app.get('/service', async(req, res) =>{
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
  });
  app.get("/service-single/:id", async (req, res) => {
    const {id} = req.params;
    console.log(id);
    const query = { _id: ObjectId(id) };
    const result = await serviceCollection.findOne(query);
    res.send(result);
  });

  app.get('/user', async (req, res) => {
    const users = await userCollection.find().toArray();
    res.send(users);
  });

  app.get('/admin/:email', async(req, res) =>{
    const email = req.params.email;
    const user = await userCollection.findOne({email: email});
    const isAdmin = user.role === 'admin';
    res.send({admin: isAdmin})
  })

  app.put('/user/admin/:email', async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const updateDoc = {
      $set: {role:'admin'},
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  })

  app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: user,
    };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.send({ result, token });
  })
}
finally{

}
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`parts app listening on port ${port}`)
})