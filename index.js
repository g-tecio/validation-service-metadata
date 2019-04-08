const request = require('request');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const PORT = 3100;
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://marcolobezno:1234@clusterlobezno-vjzh4.mongodb.net/test?retryWrites=true');
var db = mongoose.connection;
var contentSchema = new mongoose.Schema({  }, { strict: false });
app.use(bodyParser.json({ strict: false }));

//The app doesn't need to listen TCP anymore
//app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`)) 


module.exports = app; //Export the application from the module so it can be use Lambda

app.post('/content/addContent', function (req, res) {
    let jason = {};
    request.get('https://0795jhayp2.execute-api.us-east-1.amazonaws.com/Stage/metadata?id=' + req.body.metadata_id, async (err, response, body) => {
        let metadata = JSON.parse(response.body);
        metadata = metadata[0].attributes;
        metadata.forEach(attribute => {
            jason[attribute.machine_name] = generateType(attribute.type);
        })
        jason = JSON.parse(JSON.stringify(jason));
        if (validateClass(req.body.data, jason)) {

            var result = req.body;
            var Content = mongoose.model('Content', contentSchema);
            var content = new Content(result);
            var api_response = await content.save();
            res.send(api_response);
        } else {
            res.send("Invalid data");
        }
    })
})

app.get('/content', async (request, response) => {
    try {
        var Content = mongoose.model('Content', contentSchema);
        var result = await Content.find().exec();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});

//Get by id endpoint
app.get('/content/:_id', async (req, res) => {
    try{
       var Content = mongoose.model('Content', contentSchema);
       var result = await Content.findById(req.params._id).exec();
       res.send(result);
    } catch (error){
        res.status(500).send(error);
    } 
  
});


function validateClass(objectToValidate, parameter) {
    let r = true;
    for (var key in objectToValidate) {
        // console.log("type of 1 " + key + ": " + typeof objectToValidate[key]);
        // console.log("type of 2 " + key + ": " + typeof parameter[key]);
        if (!(typeof objectToValidate[key] == typeof parameter[key])) {
            console.log("False in: " + key);

            r = false;
        }
    }
    return r;
}

function generateType(type) {
    switch (type) {
        case 'string':
            return "string"
        case 'number':
            return 100
        case 'boolean':
            return true
        case 'array':
            return []
        case 'date':
            return new Date();
        default:
            return new Object();
    }
}
