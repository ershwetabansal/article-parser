
var expect = require('chai').expect,
    fs = require('fs'),
    path = require('path'),
    article_parser = require('../controllers/article_parser.js');


describe('Article Parsing Tests',function() {
  var articles;
  var html;
  var host = "hindustantimes";
  var category = "sports";

  before(function(done){
    var file = path.join(__dirname, '', 'Hindustan_times_article');
    html = fs.readFile(file, 'utf-8',function(err,data){
      if (err) {
        throw new Error();
      }
      html = data;
       done();
    });
   
  }); 

  it('should retreive articles',function(){
    var array = article_parser.readArticle(html,host,category, new Date(2015,09,13,0,0,0));
    expect(array).to.have.length(1);
  });

});