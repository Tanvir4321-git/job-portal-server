const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//mideleware
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@first-mongobd-porject.tmjl5yc.mongodb.net/?appName=first-mongobd-porject`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   const db = client.db('Job-Portal')
   const usercollection=db.collection('users')
   const jobcollection=db.collection('jobs')
   const userapplication=db.collection('applied-job')

        //users related api 

    app.post('/users', async (req, res) => {
      const userinfo = req.body
      userinfo.role='users'
      
      
      const query = { email: userinfo.email }
      const findUser = await usercollection.findOne(query)
      if (findUser) {
       
        return res.send('usres already exist')
      }

      const result = await usercollection.insertOne(userinfo)
      res.send(result)
    })

    // get user role
    app.get('/users/:email/role',  async (req, res) => {
      const email = req.params.email
      const user = await usercollection.findOne({ email })
      res.send({ role: user?.role || 'users',  })
    })


   // post job in  db by admin
   app.post ('/post-job', async (req,res)=>{
    const jobInfo=req.body

      const result = await jobcollection.insertOne(jobInfo)
      res.send(result)

   })

   // jod details 

  app.get('/job-details/:id', async(req,res)=>{
      const id=req.params.id
      const query={_id : new ObjectId(id)}
      const result =await jobcollection.findOne(query)
      res.send(result)

    })
   // get added jobs for admin

 app.get('/jobs', async (req, res) => {
    const { search, filter } = req.query

    let query = {}

    if (search) {
        query.title = { $regex: search, $options: 'i' }
    }

    if (filter) {
        query.tags = { $in: [filter] }
    }

    const result = await jobcollection.find(query).toArray()
    res.send(result)
})

// apply job by user
 app.post ('/apply-job', async (req,res)=>{
    const jobInfo=req.body

      const result = await userapplication.insertOne(jobInfo)
      res.send(result)

   })


  
    // job delete by admin

    app.delete('/job-delete/:id', async(req,res)=>{
      const id=req.params.id
      const query={_id : new ObjectId(id)}
      const result =await jobcollection.deleteOne(query)
      res.send(result)

    })








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
