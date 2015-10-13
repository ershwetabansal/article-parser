
/**
 * Module dependencies.
 */
// var blogPosts = {JSON.stringify(blogPosts)};
var express   = require('express'),
    http      = require('http'),
    path      = require('path'),
    mongoose  = require('mongoose'),
    Post      = require('./post.js');
    News_Crawler = require('./news_crawler.js'),
    dbhandler = require('./news_db_handler.js');
var bodyParser = require('body-parser');
var newsjs = require('../models/article.js');
var methodOverride = require('method-override');

var app = express();
exports.startServer = function() {
  // app.configure(function(){
    
  // });
app.set('port', process.env.PORT || 3000);
app.engine('.html', require('ejs').__express);

app.set('views', path.join(__dirname, '../../public/views'));
app.set('view engine', 'html');
    // parse request bodies (req.body)
app.use(bodyParser.urlencoded({ extended: true }));

// allow overriding methods in query (?_method=put)
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../../public')));

  app.get('/posts', Post.getPosts);
  app.get('/post/:postId', Post.getPostContent);
  app.post('/post/save', Post.savePost);
  app.get('/crawl',News_Crawler.startCrawlOverWeb);
  app.get('/testdb',function() {
      var article_content = "Jasmine is a behavior-driven development framework for testing JavaScript code.",
  date = new Date(2000,01,01,01,00,00,00),
  src_url = "http://source/check",
  img_url = "http://mynews/found.png",
  category = "sports",
  heading = "What is Jasmine?",
  host = "news";
  var article = newsjs.getNewInstance();
  article.date = date;
  article.heading = heading;
  article.article_content = article_content;
  article.category = category;
  article.host = host;
  article.src_url = src_url;
  article.img_url = img_url;

  var hostObj = dbhandler.createModel("hindustantimes");
    // dbhandler.insertArticle(hostObj,article);
    dbhandler.getAllArticles(hostObj);
    dbhandler.getArticles(hostObj,date);
  });

  app.get('/articles', function(){
    var host_obj = dbhandler.createModel('hindustantimes');
      articles = dbhandler.getAllArticles(host_obj,function(err, returned_articles) {
        if (err) {
          console.log("Database error");
        } else {
          articles = returned_articles;
          console.log("received articles:"+articles);      
          if (typeof(articles) !== "undefined" && articles != null && articles.length> 0) {
          console.log('total articles :'+articles.length);
          }
        }

      });
  
  });
    app.get('/article', function(){
    var host_obj = dbhandler.createModel('hindustantimes');
      articles = dbhandler.getArticles(host_obj,new Date(2015,10,11,00,00,00),function(err, returned_articles) {
        if (err) {
          console.log("Database error");
        } else {
          articles = returned_articles;
          console.log("received articles:"+articles);      
          if (typeof(articles) !== "undefined" && articles != null && articles.length> 0) {
          console.log('total articles :'+articles.length);
          }
        }

      });
  
  });
  app.get('/*');

  // app.use(express.static(__dirname, 'css'));

  // Connect to mongo before starting the server
  mongoose.connect('127.0.0.1', 'News_Portal', 27017, function(err) {
    if (err) {
      console.log('Could not connect to mongo: ' + err);
      process.exit(1);
    }

    // We've connected to Mongo, so start the web server
    http.createServer(app).listen(app.get('port'), function(){
      console.log('Demo server listening on port ' + app.get('port'));
    });
  });

};
