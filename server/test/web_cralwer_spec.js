
var crawler = require("../controllers/news_crawler");
var dbhandler = require("../controllers/news_db_handler");
var expect = require('chai').expect,
    fs = require('fs'),
    path = require('path');


describe('News website crawling Tests',function() {
  var articles;
  before(function(done){
    crawler.startCrawlOverWeb(function(err,data){
        if (data.counter === 1) {
          articles = data.articles;
          done();
        }
    });   
  }); 

  it('should retreive articles',function(){
    // var array = article_parser.readArticle(html,host,category, new Date(2015,09,13,0,0,0));
    expect(articles).to.have.length(1);
  });

});