"use strict";

var htmlparser = require('htmlparser2');
var config = require('../config/parser_config.js');
var articlejs = require('../models/article.js');

var config_obj;
var article ;
var array_Articles;

module.exports.readArticle = function(html,host,category,url,callback) {
  config_obj = config.getCrawlingConfig(host,category);
  article = articlejs.getNewInstance();
  // console.log("article_tag:"+config_obj.article_tag);
  array_Articles = new Array();
  // console.log("config_obj.date_matcher() :"+config_obj.date_matcher());
  // console.log("config.getDates() :"+config.getDates());
  
  var process = processResults();
  process.setBasicParams(host,category,url);
  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
      var m;
      // console.log("--Open tag:"+name);
      if (config_obj.skip_tags.indexOf(name) > -1) {
        process.setdoNotProcessThisTagFlag(true);     
        process.setSkipTag(name);
      }
    
      if (!process.getdoNotProcessThisTagFlag()) {

        if (config_obj.heading_tag.indexOf(name) > -1) {
          process.setSaveHeadingFlag(true);
        }
          
        if (process.getFoundDateFlag() && name === config_obj.article_tag) {
        // console.log("--Open tag:"+name);
          process.setSaveArticleFlag(true);
        }
        if (process.getSaveArticleFlag() ) {
          process.addTag(name);
          if (name === "img") {
            if (typeof (attribs.src) !== "undefined") {
              process.setImageURL(attribs.src);
            }
          }
        }

      }
    },
    ontext: function(text){
// console.log("article:"+text);
      if (!process.getdoNotProcessThisTagFlag()) {
        text = text.trim();
        if(process.getSaveHeadingFlag()) {  
        console.log("heading:"+text);      
          process.saveHeading(text);
          process.setSaveHeadingFlag(false);
        }

        if (process.getSaveArticleFlag()) {
          // if (text.length > config_obj.min_text_size && config_obj.skip_words.indexOf(text) < 0) {
          if (config_obj.skip_words.indexOf(text) < 0) {
              process.saveArticle(text);            
              // console.log("article:"+text);
          }
        } else if (!process.getFoundDateFlag()){
          // check for date pattern.
          var m;
          if ((m = config_obj.date_matcher().exec(text))  != null) {
            // process.setSaveArticleFlag(true);
            console.log("Matched date :"+m);
            process.saveDate(config.getDateType(m));
            process.setFoundDateFlag(true);
          }
        }        
      }
    },
    onclosetag: function(tagname){
      // console.log("--Close tag:"+tagname);
        if(!process.getdoNotProcessThisTagFlag() && process.getSaveArticleFlag()) {
            process.removeTag();
            // console.log("--Close tag:"+tagname+",stack :"+process.getStack());
          if (tagname == config_obj.article_tag && process.getStackSize() == 0) {
            
            process.done();
          }
        } else if (process.getdoNotProcessThisTagFlag() && process.getSkipTag() === tagname ) {
          process.setdoNotProcessThisTagFlag(false);     
          process.setSkipTag("");
        }
    }
  }, {decodeEntities: true});
  parser.write(html);
  parser.end();
  // console.log("pattern:"+config.getSkipTag());

// return array_Articles;

};

/* A closure to maintain required data while parsing an html page. This data includes all
the information related to articles. */
function processResults(){
var article_content ="";
var date ="";
var heading = "";
var foundDateFlag;
var saveHeadingFlag;
var saveArticleFlag;
var doNotProcessThisTagFlag;
var image_url = "";
var host = "";
var category = "";
var src_url = "";
var tag_stack = new Array();
var skip_tag;

return  {
  setBasicParams : function(h,cat,src) {
    host = h;
    cat = category;
    src_url = src;
  },
  setFoundDateFlag : function(bool) {foundDateFlag = bool;},
  getFoundDateFlag : function() {return foundDateFlag;},
  setSaveHeadingFlag : function(bool) {saveHeadingFlag = bool;},
  getSaveHeadingFlag : function() {return saveHeadingFlag;},
  setSaveArticleFlag : function(bool) {saveArticleFlag = bool;},
  getSaveArticleFlag : function() {return saveArticleFlag;},
  setdoNotProcessThisTagFlag : function(bool) { doNotProcessThisTagFlag = bool;},
  getdoNotProcessThisTagFlag : function() {return doNotProcessThisTagFlag;},
  setSkipTag : function(tag) {skip_tag = tag;},
  getSkipTag : function() {return skip_tag;},
  setImageURL : function(url) {this.image_url = url;},
  saveHeading : function(head) {heading = head;},
  saveArticle : function(arc) {article_content = article_content + "<br>" + arc;},
  saveDate : function(dt) {date = dt;},
  addTag : function(tag) {tag_stack.push(tag);},
  removeTag : function() {tag_stack.pop();},
  getStackSize : function() {return tag_stack.length;},
  getStack : function() {return tag_stack;},
  done : function() {
    var m;
    var result = (m = config_obj.match_words.exec(article_content)) ;
    if (result != null && article_content.length >  config_obj.min_article_size) {
      console.log("******************************************************************************");
      console.log("url :"+src_url);
      console.log("Finally date :"+date+", article :"+article_content);
      console.log("******************************************************************************");
      article.date = date;
      article.heading = heading;
      article.article_content = "" + article_content + "" ;
      article.img_url = image_url;
      article.host = host;
      article.category = category;
      article.src_url = src_url;
      
      array_Articles.push(article);

      saveArticleFlag = false;
      foundDateFlag = false;
    } else {
      // console.log("came here means length is less than  "+config_obj.min_letters);
      saveArticleFlag = false;
      
    }
    article_content = "";

  }
};
}
