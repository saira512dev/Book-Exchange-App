const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const multer = require('multer');
const upload = multer();
const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(upload.array()); 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
const { check, validationResult } = require('express-validator');


MongoClient.connect(
   'mongodb+srv://quiz_user:quizUser_109@clusterquiz.qu2x8.mongodb.net/?retryWrites=true&w=majority'
    ).then((client) => {
    console.log("Connected to Database");
    const db = client.db("QUIZ");
    const scores = db.collection("scores");
    const questions = db.collection("questions");

  
    app.get("/api/scores/all", (req, res) => {
      scores
        .find()
        .sort({score:-1, time:1})
        .toArray()
        .then((results) => {
          res.json(results)
        })
        .catch((error) => console.error(error));
    });
    app.post("/api/scores/add", (req, res) => {
        console.log(req)
        scores.insertOne(req.body)
        .then((result) => {
          res.json("OK")
        })
        .catch((error) => console.error(error));
    });

    app.get("/api/questions/view/:id",
    (req, res) => {
        console.log(req)
        questions.
        find({'_id' : ObjectId(req.params.id)})
        .toArray()
        .then((results) => {
            res.json(results)
        })
        .catch((error) => console.error(error));
    });

    app.post("/api/questions/add",[
        check('question').not().isEmpty().withMessage('Question cannot be empty.'),
        check('choices').not().isEmpty().withMessage('Choices cannot be empty.'),
        check('answer_index').not().isEmpty().withMessage('Answer index cannot be empty.'),
        check('info').not().isEmpty().withMessage('Info cannot be empty.'),
    ] ,(req, res) => {
        const errors = validationResult(req);
        console.log(req.body,errors, "HEROKU");
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }

        questions.insertOne(req.body)
        .then((result) => {
            res.json("OK")
        })
        .catch((error) => console.error(error));
    });
    
    app.put("/api/questions/edit/id/:id",[
        check('question').not().isEmpty().withMessage('Question cannot be empty.'),
        check('choices').not().isEmpty().withMessage('Choices cannot be empty.'),
        check('answer_index').not().isEmpty().withMessage('Answer index cannot be empty.'),
        check('info').not().isEmpty().withMessage('Info cannot be empty.'),
    ] ,(req, res) => {
        const errors = validationResult(req);
        console.log(req)
        console.log(ObjectId(req.params.id))
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        questions.updateOne({ "_id" : ObjectId(req.params.id)},{$set : req.body})
        .then((result) => {
            res.json('Item Updated!');
        })
        .catch((error) => console.error(error));
    });
    app.get("/api/questions/all", (req, res) => {
        console.log(req)
        questions.
        find()
        .toArray()
        .then((results) => {
            res.json(results)
        })
        .catch((error) => console.error(error));
    });
    app.post("/api/questions/delete/:id",(req, res) => {
        console.log(req)
        console.log(ObjectId(req.params.id))
        questions.deleteOne({ "_id" : ObjectId(req.params.id)})
        .then((results) => {
           return res.status(200).json("DELETED")
        })
        .catch((error) => console.error(error));
    });
  });
  
app.get('/',(req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/api/js',(req, res) => {
    res.json(questions)
})

app.listen(process.env.PORT || PORT,() => {
    console.log("SERVER IS UP & RUNNING");
})

