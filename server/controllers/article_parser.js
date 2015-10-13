/**
* This parser parses the html document of each page of the news website. It assumes that the way html 
* is written for one website is consistent on each page.
**/
"use strict";

var htmlparser = require('htmlparser2');
var config = require('../config/parser_config.js');
var articlejs = require('../models/article.js');

var config_obj;
 
var array_Articles;

module.exports.readArticle = function(html,host,category,url,date_override) {
  var date;
  if (typeof(date_override) !== "undefined" && date_override instanceof Date) date = date_override;
  else date = new Date();

  config_obj = config.getCrawlingConfig(host,category);
  array_Articles = new Array();
  var process = processResults();
  process.setBasicParams(host,category,url);
  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
      var m;
      if (config_obj.skip_tags.indexOf(name) > -1) {
        process.setdoNotProcessThisTagFlag(true);     
        process.setSkipTag(name);
      } else {
        process.setdoNotProcessThisTagFlag(false);     
        process.setSkipTag("");
      }
    
      if (!process.getdoNotProcessThisTagFlag()) {

        if (config_obj.heading_tag.indexOf(name) > -1) {
          process.setSaveHeadingFlag(true);
        }
        if (process.getFoundDateFlag())
        if (process.getFoundDateFlag() && name === config_obj.article_tag) {
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
      if (!process.getdoNotProcessThisTagFlag()) {
        text = text.trim();
        if(process.getSaveHeadingFlag()) {  
          process.saveHeading(text);
          process.setSaveHeadingFlag(false);
        }

        if (process.getSaveArticleFlag()) {
          // if (text.length > config_obj.min_text_size && config_obj.skip_words.indexOf(text) < 0) {
          if (config_obj.skip_words.indexOf(text) < 0) {
              process.saveArticle(text);            
          }
        } else if (!process.getFoundDateFlag()){
          // check for date pattern.
          var m;
          if ((m = config_obj.date_matcher(date).exec(text))  != null) {
            process.saveDate(date);
            process.setFoundDateFlag(true);
          }
        }        
      }
    },
    onclosetag: function(tagname){
        if(!process.getdoNotProcessThisTagFlag() && process.getSaveArticleFlag()) {
            process.removeTag();
          if (tagname == config_obj.article_tag && process.getStackSize() == 0) {
            
            process.done();
          }
        }
    }
  }, {decodeEntities: true});
  parser.write(html);
  parser.end();
  return array_Articles;
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
    category = cat;
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
      // console.log("******************************************************************************");
      // console.log("url :"+src_url);
      // console.log("Finally date :"+date+", article :"+article_content);
      // console.log("******************************************************************************");
      var article = articlejs.getNewInstance();
      article.date = date;
      article.heading = heading;
      article.article_content = "" + article_content + "" ;
      article.img_url = image_url;
      article.host = host;
      article.category = category;
      article.src_url = src_url;
      
      array_Articles.push(JSON.parse(JSON.stringify(article)));

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
