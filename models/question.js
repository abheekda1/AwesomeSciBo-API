const mongoose = require('mongoose');

const { categoryNames, subCategoryNames } = require('../helpers/data/categories');

const QuestionSchema = new mongoose.Schema({
    'Category': {
      type: String,
      enum: categoryNames
    },
    'Toss-Up Subcategory': {
      type: String,
      enum: subCategoryNames
    },
    'Bonus Subcategory': {
      type: String,
      enum: subCategoryNames
    },
    'Toss-Up Question Format': {
      type: String,
      enum: ["Multiple Choice", "Short Answer"]
    },
    'Toss-Up Question': String,
    'Toss-Up Answer': String,
    'Toss-Up Explanation': String,
    'Bonus Question Format': {
      type: String,
      enum: ['Multiple Choice', 'Short Answer']
    },
    'Bonus Question': String,
    'Bonus Answer': String,
    'Bonus Explanation': String,
    'Submitter': String,
    'Timestamp': String,
    'Source': String,
    'Round': Number
  });
  
  QuestionSchema.index(
    {
      "Toss-Up Question": "text",
      "Bonus Question": "text",
      "Toss-Up Answer": "text",
      "Bonus Answer": "text"
    }
  )
  
module.exports = mongoose.model('Questions', QuestionSchema);