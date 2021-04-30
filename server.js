const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const categories = require("./categories.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var database, collection;
const port = process.env.API_PORT;

const DATABASE_NAME = process.env.DATABASE_NAME;
const CONNECTION_URL = `mongodb://localhost/${DATABASE_NAME}`;
const Schema = mongoose.Schema;

const categoryNames = [];
categories.forEach(category => {
  categoryNames.push(category.name);
});

const subCategoryNames = [];
categories.forEach(category => {
  category.subcategories.forEach(subcategory => {
    subCategoryNames.push(subcategory);
  });
});

const QuestionsSchema = new Schema({
  category: {
    type: String,
    enum: categoryNames
  },
  subcategory: {
    type: String,
    enum:subCategoryNames
  }
});

var Questions = mongoose.model('Questions', QuestionsSchema);

app.listen(process.env.API_PORT || 8000, () => {
  console.log("Running on port ", port);
    mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
      if (error) throw error;
    });
  });

app.set('view engine', 'pug');

app.get("/", async (req, res) => {
  res.render('index', { categories: categories, questionData: {}, requestInfo: { method: "POST", endpoint: `/addQuestion` } })
});

app.get("/questions/:id/update", (request, response) => {
  Questions.findOne( { "_id": new mongoose.Types.ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }

      let questionJSON;

      if (result) {
        questionJSON = result;
        console.log(questionJSON);
        response.render('index', { categories: categories, questionData: questionJSON, requestInfo: { method: "POST", endpoint: `/questions/${request.params.id}/update` } });
      } else {
        response.redirect('/?updateNotFound=true')
      }
  });
});

app.post("/questions/:id/update", (request, response) => {
  const qJSON = { "category": request.body.category, "subcategory": request.body[request.body.category]};
  console.log(qJSON);
  let responseJSON = {};
  let subcategories;

  categories.some(category => {
    if (qJSON.category === category.name) {
      subcategories = category.subcategories;
      return true;
    } else {
      return false;
    }
  })
  if (categoryNames.includes(qJSON.category)) {
    if (subcategories.includes(qJSON.subcategory)) {
      responseJSON.subcategory = "ok";
      responseJSON.category = "ok";
    } else {
      responseJSON.category = "ok";
      responseJSON.subcategory = "invalid";
    }
  } else {
    responseJSON.category = "invalid";
    responseJSON.subcategory = "invalid";
  }

  let statusArray = [];

  for (var key in responseJSON) {
    const value = responseJSON[key];
    statusArray.push(value);
  }

  if (statusArray.includes("invalid")) {
    return response.status(400).send(responseJSON);
  } else {
    Questions.findByIdAndUpdate(request.params.id, qJSON, function (err) {
      if (err) {
        return response.status(500).send(err);
      }
      response.status(200).redirect("/");
    });
  }
});

app.post("/addQuestion", (request, response) => {
  const qJSON = { "category": request.body.category, "subcategory": request.body[request.body.category]};
  console.log(qJSON);
  const question = new Questions(qJSON);
  let responseJSON = {};
  let subcategories;

  categories.some(category => {
    if (qJSON.category === category.name) {
      subcategories = category.subcategories;
      return true;
    } else {
      return false;
    }
  })
  if (categoryNames.includes(qJSON.category)) {
    if (subcategories.includes(qJSON.subcategory)) {
      responseJSON.subcategory = "ok";
      responseJSON.category = "ok";
    } else {
      responseJSON.category = "ok";
      responseJSON.subcategory = "invalid";
    }
  } else {
    responseJSON.category = "invalid";
    responseJSON.subcategory = "invalid";
  }

  let statusArray = [];

  for (var key in responseJSON) {
    const value = responseJSON[key];
    statusArray.push(value);
  }

  if (statusArray.includes("invalid")) {
    return response.status(400).send(responseJSON);
  } else {
    question.save(function (err) {
      if (err) {
        return response.status(500).send(err);
      }
      response.status(200).redirect("/");
    });
  }
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
    Questions.find(JSON.parse(jsonQuery), (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

/*app.get("/questions/random", (request, response) => {
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
    Questions.find(JSON.parse(jsonQuery), (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result[Math.floor(Math.random() * result.length)]);
    });
});*/
app.get("/questions/:id", (request, response) => {
  Questions.findOne( { "_id": new mongoose.Types.ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});
