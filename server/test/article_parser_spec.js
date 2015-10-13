
var crawler = require("../controllers/news_crawler");
// var parser = require("../controllers/article_parser");
// var config = require("../config/parser_config");
var dbhandler = require("../controllers/news_db_handler");
var expect = require('chai').expect;

describe('server side crawling tests',function() {
  var articles;
  before(function(done){
    var config_obj = {
      "url" : "http://timesofindia.indiatimes.com/sports/hockey",
      "country" : "India",
      "depth" : 2,
      "min_letters" : 100,
      "match_words" : ["sport", "lose", "win", "cricket", ""]
    };

    crawler.startCrawlSpecific('test','sports',config_obj);

    done();

  }); 

  it('should retreive articles',function(){
    var count = false;
    if (crawler.totalArticles('test','sports') > 0) {
      count = true;
    }
    expect(count).equals(true);
  });

  describe('database check',function() {
    before(function(done){
      var host_obj = dbhandler.createModel('test');
      articles = dbhandler.getAllArticles(host_obj,function(err, returned_articles) {
        if (err) {
          console.log("Database error");
        } else {
          articles = returned_articles;
          console.log("received articles:"+articles);      
        }

      });
      done();

    });
    it('db should have articles',function(){
      
      var count = false;
      if (typeof(articles) !== "undefined" && articles != null && articles.length> 0) {
        count = true;
      }
      expect(count).equals(true);
    });  

    after(function(){
      // need to delete 'test' collection from db.
    });
  });

});