/**
* This file traverses through all the URLs given inn article_parser.json
* And then the retrieved HTML is parsed through article_parser.js file
* Returned articles are saved to DB.
**/
"use strict";
var Crawler = require("simplecrawler");
var parser = require("./article_parser");
var config = require("../config/parser_config");
var dbhandler = require("./news_db_handler");

var test_counter=0;
/**
* This function will get configuration parameters from article_parser.json which returns all the web urls,
* we need to crawl. Moreover, gives other specific configurations for each url.
**/
module.exports.startCrawlOverWeb = function(test_callback){
  var hosts = config.getHosts();
  var categories = config.getCategories();
  for (var i=0, len= hosts.length; i < len ; i++) {
    for (var j=0, cat_len= categories.length; j < cat_len ; j++) {
      var config_obj = config.getCrawlingConfig(hosts[i],categories[j]);
      if (typeof (config_obj) !== "undefined"){
         module.exports.startCrawlSpecific(hosts[i], categories[j],config_obj,test_callback);
      }
    }
  }
}

/**
* This function actually crawls through one news website for one particular category. And then calls
* article parser to retrieve article from html doc. Once article is found, it is saved into database.
**/
module.exports.startCrawlSpecific = function(host,category,config_obj,test_callback) {

if (typeof (config_obj.url) === "undefined") {
  console.log("There is some problem. Url is missing for "+host+", category :"+category);
  return;
}

var crawler = Crawler.crawl(config_obj.url);

crawler.interval = 500;
crawler.maxDepth = config_obj.depth; 
crawler.parseHTMLComments = false;
crawler.parseScriptTags = false;
var conditionID = crawler.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.css$/i) && !parsedURL.path.match(/\.js$/i) && !parsedURL.path.match(/\.jpg$/i) && !parsedURL.path.match(/\.png$/i) && !parsedURL.path.match(/\.ico$/i) ;
});

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
      var html = responseBuffer.toString('utf8');
      var articleArray = parser.readArticle(html,host,category,queueItem.url);
      for (var i=0, len=articleArray.length; i < len ; i++) {
          var article = articleArray[i];
          var host_obj = dbhandler.createModel(article.host);
          dbhandler.insertArticle(host_obj,article);
      }
      test_counter++;
      test_callback(null,{articles : articleArray, counter : test_counter});
});
};
