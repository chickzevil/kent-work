const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const firebase = require('firebase');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const config = {
	apiKey: "AIzaSyB0izn6BNHwOwrnQMa_7p355bPNQ9oEUxE",
    authDomain: "restful-c8ce2.firebaseapp.com",
    databaseURL: "https://restful-c8ce2.firebaseio.com",
    projectId: "restful-c8ce2",
    storageBucket: "restful-c8ce2.appspot.com",
    messagingSenderId: "570356089960"
};
firebase.initializeApp(config);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/timestamp', (req, res) => {
    res.send(`${Date.now()}`);
});

// Read all users
app.get('/api/users', (req, res) => {
    const usersRef = firebase.database().ref('restful/users');
    usersRef.on('value', (snapshot) => {
        let userData = [];
        let items = snapshot.val();
        for (let item in items) {
            userData.push({
                id: item,
                name: items[item].name,
                email: items[item].email
            });
        }
        res.status(200).send({
            success: 'true',
            message: 'Successfully Retrived',
            result: userData
        });
    });
});

// Create a new user
app.post('/api/users', (req, res) => {
    const userData = {
        name: req.body.name,
        email: req.body.email
    };
    const userID = Date.now();
    const usersRef = firebase.database().ref('restful/users/'+userID);
    usersRef.set(userData);
    res.status(201).send({
        success: 'true',
        message: 'Successfully Created',
        id: userID,
        result: userData
    });
});

// Get a specific user
app.get('/api/users/:userid', (req, res) => {
    const userID = req.params.userid;
    const usersRef = firebase.database().ref('restful/users/'+userID);
    usersRef.once('value', (snapshot) => {
        if (snapshot.val() !== null) {
            res.status(200).send({
                success: 'true',
                message: 'Successfully Retrived',
                id: userID,
                result: snapshot.val()
            });
        } else {
            res.status(404).send({
                success: 'false',
                message: 'Not Found',
            });
        }       
    });
});

// Update details of a user
app.put('/api/users/:userid', (req, res) => {
    const userID = req.params.userid;
    const userData = {
        name: req.body.name,
        email: req.body.email
    }; 
    const usersRef = firebase.database().ref('restful/users/'+userID);
    usersRef.update(userData);
    res.status(202).send({
        success: 'true',
        message: 'Successfully Updated',
        id: userID,
        result: userData
    });
});

// Delete a user
app.delete('/api/users/:userid', (req, res) => {
    const userID = req.params.userid;
    const usersRef = firebase.database().ref('restful/users/'+userID);
    usersRef.remove();
    res.status(202).send({
        success: 'true',
        message: 'Successfully Removed',
        id: userID,
    });
});

exports.app = functions.https.onRequest(app);
