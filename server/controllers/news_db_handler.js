/**
 * Handles blog posts.
 */


var mongoose = require('mongoose');
var path = require('path');
var newsjs = require('../models/article.js');
/**************************************************************
 * Schema definition
 **************************************************************/

/**
 * Mongoose schema for a news.
 * @type {mongoose.Schema}
 */
var newsSchema = new mongoose.Schema({
  date:     {type : Date},
  category: String,
  heading:   String,
  article_content:    String,
  img_url:  String,
  src_url: String
});

// Create a reverse index on date so we can sort on it quicker
newsSchema.index({date: -1,category: 1});

/**************************************************************
 * API Functions
 **************************************************************/
/**
Creates a model with the host name.
*/
exports.createModel = function(host) {
  var hostObj = mongoose.model(host, newsSchema);
  return hostObj;
}
/**
 * Gets all articles posted on a particular date. But it will be required for a particular host
 */
exports.getArticles = function(host,date,callback) {

  // Find all articles for a particular date. Return plain JSON objects (not
  // mongoose objects) by specifying lean(true). Return all fields but content.
  host.find({date : date}, 'date heading article_content category img_url src_url').lean(true).exec(callback);
};

/**
 * Gets all articles. But it will be required for a particular host
 */
exports.getAllArticles = function(host,callback) {

  // Find all articles for a particular date. Return plain JSON objects (not
  // mongoose objects) by specifying lean(true). Return all fields but content.
  host.find({}, 'date heading article_content category img_url src_url').lean(true).exec(callback);
};


/**
 * Saves a new article. 
 *
 */
exports.insertArticle = function(host_obj, article) {

 //TODO check if the article is duplicate. If yes, then don't insert.
    var host_inst = new host_obj(
        {
          date : article.date,
          category : article.category,
          heading : article.heading,
          article_content : article.article_content,
          img_url : article.img_url,
          src_url : article.src_url
        }
      );
    
    host_inst.save(function(err,resp) {
      if (err) {
        // res.send(500, 'Database Error. Could not save post.');
        console.log("Database Error. Could not save the article.");
      } else {
        console.log("Article successfully saved."+resp);
      }
    });
  
};

