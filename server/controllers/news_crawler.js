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
var counter = {};
/**
* This function will get configuration parameters from article_parser.json which returns all the web urls,
* we need to crawl. Moreover, gives other specific configurations for each url.
**/
module.exports.startCrawlOverWeb = function(){
  var hosts = config.getHosts();
  var categories = config.getCategories();
  for (var i=0, len= hosts.length; i < len ; i++) {
    console.log("length :"+len);
    for (var j=0, cat_len= categories.length; j < cat_len ; j++) {
      var config_obj = config.getCrawlingConfig(hosts[i],categories[j]);
      if (typeof (config_obj) !== "undefined"){

        module.exports.startCrawlSpecific(hosts[i], categories[j],config_obj);
      }
    }
  }
}

/**
* This function actually crawls through one news website for one particular category. And then calls
* article parser to retrieve article from html doc. Once article is found, it is saved into database.
**/
module.exports.startCrawlSpecific = function(host,category,config_obj) {
counter[host+" "+category] = 0;

if (typeof (config_obj.url) === "undefined") {
  console.log("There is some problem. Url is missing for "+host+", category :"+category);
  return;
}

var crawler = Crawler.crawl(config_obj.url);
var host_obj = dbhandler.createModel(host);
crawler.interval = 500;
crawler.maxDepth = config_obj.depth; 
crawler.parseHTMLComments = false;
crawler.parseScriptTags = false;
console.log("processing : url :"+config_obj.url);
var conditionID = crawler.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.css$/i) && !parsedURL.path.match(/\.js$/i) && !parsedURL.path.match(/\.jpg$/i) && !parsedURL.path.match(/\.png$/i) && !parsedURL.path.match(/\.ico$/i) ;
});

crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
      var html = responseBuffer.toString('utf8');
      parser.readArticle(html,host,category,queueItem.url,callback);
      
     
});
// crawler.on("complete", function() {
    // console.log("Total count:"+counter);
// });
};
function callback(articleArray){
  for (var i=0, len=articleArray.length; i < len ; i++) {
        counter[host+" "+category] = counter[host+" "+category]++;
        var article = articleArray[i];
       dbhandler.insertArticle(host_obj,article);
      }
}
module.exports.totalArticles = function(host,category) {
  return counter[host+" "+category];
}