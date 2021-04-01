const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var database, collection;
const port = process.env.API_PORT;

const DATABASE_NAME = process.env.DATABASE_NAME;
const CONNECTION_URL = "localhost:27017"

app.listen(process.env.API_PORT || 8000, () => {
  console.log("Running on port ", port);
    MongoClient.connect("mongodb://" + CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("questions");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.use("/", express.static("public"));

app.post("/addQuestion", (request, response) => {
    if (request.headers.apikey !== process.env.API_KEY) {
      response.status(403).send("Invalid API Key");
      return;
    }
    collection.insertOne(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.get("/questions", (request, response) => {
    let jsonQuery = "{ ";

    if (request.query.category) {
        jsonQuery += `"Category": { "$in": [${request.query.category}] },`
        if (request.query.subcategory) {
            jsonQuery += `"Subcategory": { "$in": [${request.query.subcategory}] },`
        }
    }

    if (request.query.author) {
        jsonQuery += `"Author": { "$in": [${request.query.author}] },`
    }

    if (request.query.mindifficulty && !request.query.maxdifficulty) {
        jsonQuery += `"Difficulty": { "$gte": ${request.query.mindifficulty} },`
    } else if (request.query.maxdifficulty && !request.query.mindifficulty) {
        jsonQuery += `"Difficulty": { "$lte": ${request.query.maxdifficulty} },`
    } else if (request.query.mindifficulty && request.query.maxdifficulty) {
        jsonQuery += `"Difficulty": { "$gte": ${request.query.mindifficulty}, "$lte": ${request.query.maxdifficulty} },`
    }

    jsonQuery = jsonQuery.substring(0, jsonQuery.length-1);
    jsonQuery += " }";
    collection.find(JSON.parse(jsonQuery)).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/questions/random", (request, response) => {
    let jsonQuery = "{ ";

    if (request.query.category) {
        jsonQuery += `"Category": { "$in": [${request.query.category}] },`;
        if (request.query.subcategory) {
            jsonQuery += `"Subcategory": { "$in": [${request.query.subcategory}] },`;
        }
    }

    if (request.query.author) {
        jsonQuery += `"Author": { "$in": [${request.query.author}] },`;
    }

    if (request.query.mindifficulty && !request.query.maxdifficulty) {
        jsonQuery += `"Difficulty": { "$gte": ${request.query.mindifficulty} },`;
    } else if (request.query.maxdifficulty && !request.query.mindifficulty) {
        jsonQuery += `"Difficulty": { "$lte": ${request.query.maxdifficulty} },`;
    } else if (request.query.mindifficulty && request.query.maxdifficulty) {
        jsonQuery += `"Difficulty": { "$gte": ${request.query.mindifficulty}, "$lte": ${request.query.maxdifficulty} },`;
    }

    jsonQuery = jsonQuery.substring(0, jsonQuery.length-1);
    jsonQuery += " }";
    collection.find(JSON.parse(jsonQuery)).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result[Math.floor(Math.random() * result.length)]);
    });
});

app.get("/questions/:id", (request, response) => {
  collection.findOne( { "_id": new ObjectID(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result[Math.floor(Math.random() * result.length)]);
  });
});
