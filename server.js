const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { v4: uuid } = require('uuid');

const emailData = require("./email.json");
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
  'Category': {
    type: String,
    enum: categoryNames
  },
  'Subcategory': {
    type: String,
    enum: subCategoryNames
  },
  'Toss-Up Question Format': {
    type: String,
    enum: ["Multiple Choice", "Short Answer"]
  },
  'Toss-Up Question': String,
  'Toss-Up Answer': String,
  'Bonus Question Format': {
    type: String,
    enum: ['Multiple Choice', 'Short Answer']
  },
  'Bonus Question': String,
  'Bonus Answer': String,
  'Explanation': String,
  'Submitter': String,
  'Timestamp': String
});

const Questions = mongoose.model('Questions', QuestionsSchema);

const APIKeySchema = Schema({
  'Email': String,
  'API Key': String,
  'Valid': Boolean
});

const APIKeys = mongoose.model('APIKeys', APIKeySchema);

app.listen(process.env.API_PORT || 8000, () => {
  console.log("Running on port ", port);
    mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (error, client) => {
      if (error) throw error;
    });
  });

const transporter = nodemailer.createTransport(emailData.smtp);

app.set('view engine', 'pug');

app.get("/", async (req, res) => {
  res.render('index');
})

app.get("/val-api-keys", async (req, res) => {
  res.render('validateapikeys', { apiKeyData: [] });
})

app.post("/val-api-keys", async (req, res) => {
  if (!req.body['Email']) {
    if (req.body['Master API Key'] === process.env.MASTER_API_KEY) {
      await APIKeys.find({}, async (error, result) => {
        if (error) {
          return res.status(500).send(err);
        }
        return res.status(200).render('validateapikeys', { masterAPIKey: req.body['Master API Key'], apiKeyData: result });
      });
    } else {
      return res.status(401);
    }
  } else {
    if (req.body['Master API Key'] === process.env.MASTER_API_KEY) {
      await APIKeys.findOneAndUpdate({ "API Key": req.body['API Key'] }, { "Valid": req.body['Valid'] }, async (error, result) => {
        if (error) {
          return res.status(500).send(err);
        }
        return res.status(200);
      });
    } else {
      return res.status(401);
    }
  }
});

app.get("/questions/add", async (req, res) => {
  res.render('question', { categories: categories, questionData: {}, requestInfo: { method: "POST", endpoint: `/questions/add` }, title: "Add" });
});

app.get("/req-api-key", async (req, res) => {
  res.render('apikey');
});

app.post("/req-api-key", async (req, res) => {
  if (!req.body['Email']) {
    return rest.status(400).send("Missing E-mail");
  } else {
    APIKeys.findOne({ Email: req.body['Email'] }, async (error, result) => {
      if (!result) {
        const generatedAPIKey = uuid();
        const apiKeyData = {};
        apiKeyData['Email'] = req.body['Email'];
        apiKeyData['API Key'] = generatedAPIKey;
        apiKeyData['Valid'] = false;
        const apiKey = new APIKeys(apiKeyData);
        await transporter.sendMail({
          from: `"${emailData.from.name}" <${emailData.from.email}>`,
          to: req.body['Email'],
          subject: "API Key",
          text: generatedAPIKey,
        })
        .then(info => {
          apiKey.save(function (err) {
            if (err) {
              return response.status(500).send(err);
            }
          });
          res.status(200).send("Message ID: " + info.messageId);
        });
      } else {
        return res.status(400).send('E-mail already has API key');
      }
    });
  }
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
        response.render('question', { categories: categories, questionData: questionJSON, requestInfo: { method: "POST", endpoint: `/questions/${request.params.id}/update` }, title: "Update" });
      } else {
        response.redirect('/questions/add?updateNotFound=true')
      }
  });
});

app.post("/questions/:id/update", async (request, response) => {
  //const qJSON = { "category": request.body.category, "subcategory": request.body[request.body.category]};
  const apiKey = request.body['API Key'];
  const qJSON = request.body;
  console.log(qJSON);
  qJSON['Toss-Up Question'] = qJSON['Toss-Up Question'].replace(/w\)/gi, "\nW)").replace(/x\)/gi, "\nX)").replace(/y\)/gi, "\nY)").replace(/z\)/gi, "\nZ)")
  qJSON['Bonus Question'] = qJSON['Bonus Question'].replace(/w\)/gi, "\nW)").replace(/x\)/gi, "\nX)").replace(/y\)/gi, "\nY)").replace(/z\)/gi, "\nZ)")
  let responseJSON = {};
  let subcategories;

  const missingElements = [];

  if (!request.body['Category'] || !request.body['Subcategory'] || !request.body['Toss-Up Question Format'] || !request.body['Toss-Up Question'] || !request.body['Toss-Up Answer'] || !request.body['Bonus Question Format'] || !request.body['Bonus Question'] || !request.body['Bonus Answer'] || !request.body['API Key']) {
    console.log(request.body)
    Object.keys(request.body).forEach(key => {
      if (!request.body[key]) {
        missingElements.push(key);
      }
    });
  }

  await APIKeys.findOne( { "API Key": apiKey.toLowerCase() }, (error, result) => {
    if (result) {
      qJSON['Submitter'] = result['Email'];
      console.log(qJSON['Submitter']);
    } else {
      return response.status(401).redirect(`/questions/${request.params.id}/update/?missing=a valid API key`);
    }
  });

  delete qJSON['API Key'];

  categories.some(category => {
    if (qJSON['Category'] === category.name) {
      subcategories = category.subcategories;
      return true;
    } else {
      return false;
    }
  });

  if (categoryNames.includes(qJSON['Category'])) {
    if (!subcategories.includes(qJSON['Subcategory'])) {
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
  if (missingElements.length > 0) {
    return response.status(400).redirect(`/?missing=${missingElements}`);
  } else if (statusArray.length > 0) {
    return response.status(400).redirect(`/?missing=${category},${subcategory}`);
  } else {
    console.log(qJSON);
    Questions.findByIdAndUpdate(request.params.id, qJSON, function (err) {
      if (err) {
        return response.status(500).send(err);
      }
      response.status(200).redirect(`/questions/${request.params.id}`);
    });
  }
});

app.post("/questions/add", async (request, response) => {
  const apiKey = request.body['API Key'];
  const qJSON = request.body;
  qJSON['Toss-Up Question'] = qJSON['Toss-Up Question'].replace(/w\)/gi, "\nW)").replace(/x\)/gi, "\nX)").replace(/y\)/gi, "\nY)").replace(/z\)/gi, "\nZ)")
  qJSON['Bonus Question'] = qJSON['Bonus Question'].replace(/w\)/gi, "\nW)").replace(/x\)/gi, "\nX)").replace(/y\)/gi, "\nY)").replace(/z\)/gi, "\nZ)")
  let responseJSON = {};
  let subcategories;

  const missingElements = [];

  if (!request.body['Category'] || !request.body['Subcategory'] || !request.body['Toss-Up Question Format'] || !request.body['Toss-Up Question'] || !request.body['Toss-Up Answer'] || !request.body['Bonus Question Format'] || !request.body['Bonus Question'] || !request.body['Bonus Answer'] || !request.body['API Key']) {
    console.log(request.body)
    Object.keys(request.body).forEach(key => {
      if (!request.body[key]) {
        missingElements.push(key);
      }
    });
  }

  await APIKeys.findOne( { "API Key": apiKey.toLowerCase() }, (error, result) => {
    if (result) {
      qJSON['Submitter'] = result['Email'];
      qJSON['Timestamp'] = new Date().toISOString();
    } else {
      return response.status(401).redirect(`/questions/${request.params.id}/update/?missing=a valid API key`);
    }
  });

  delete qJSON['API Key'];

  categories.some(category => {
    if (qJSON['Category'] === category.name) {
      subcategories = category.subcategories;
      return true;
    } else {
      return false;
    }
  });

  if (categoryNames.includes(qJSON['Category'])) {
    if (!subcategories.includes(qJSON['Subcategory'])) {
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
  if (missingElements.length > 0) {
    return response.status(400).redirect(`/questions/add?missing=${missingElements}`);
  } else if (statusArray.length > 0) {
    return response.status(400).redirect(`/questions/add?missing=${category},${subcategory}`);
  } else {
    const question = new Questions(qJSON);
    question.save(function (err) {
      if (err) {
        return response.status(500).send(err);
      }
      response.status(200).redirect("/questions/add");
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

app.get("/questions/random", (req, res) => {

});

app.get("/questions/:id", (request, response) => {
  Questions.findOne( { "_id": new mongoose.Types.ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      return response.send(result);
  });
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(__dirname + "/views/images/favicon.png");
});
