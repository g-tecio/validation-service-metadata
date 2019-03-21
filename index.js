const request = require('request');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const PORT = 3100;

app.use(bodyParser.json({ strict: false }));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))


app.post('/structure-content', function (req, res) {
    let jason = {};
    request.get('http://localhost:8080/metadata/getMetadata?id=' + req.body.metadata_id, (err, response, body) => {
        let metadata = JSON.parse(response.body);
        metadata = metadata[0].attributes;
        metadata.forEach(attribute => {
            jason[attribute.machine_name] = generateType(attribute.type);
        })
        jason = JSON.parse(JSON.stringify(jason));
        res.send(validateClass(jason, req.body));
    })
})


function validateClass(objectToValidate, parameter) {
    let r = true;
    for (var key in objectToValidate) {
        if (!(typeof objectToValidate[key] == typeof parameter[key])) {
            console.log("False in: " + key);
            console.log("typeof 1 " + key + ": " + typeof objectToValidate[key]);
            console.log("typeof 2 " + key + ": " + typeof parameter[key]);
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