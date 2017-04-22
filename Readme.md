## Purpose : 
This utility can be used to parse any news website to give the articles of a particular date.
After retrieving articles, they are currently saved to mongo db.
For different news websites, some configuration parameters need to be updated in config/article_parser.json file

## Technologies :
* Node.js
* mongo db
* npm package - simplecrawler (for web crawling)
* npm package - htmlparser2 (for parsing the html)
* mocha

## Installation steps :
* $ npm install
