Purpose : This utility will parse any news website to give the articles of a particular date.
After retrieving articles, they are currently saved to mongo db.
For different news websites, some configuration parameters need to be updated in config/article_parser.json file

Used Technology

1)Node.js
2)mongoose
3)simplecrawler (for web crawling)
4)htmlparser2 (for parsing the html)
5)mocha, chai (should)


1. Run $ npm install
2. To test run mocha test/article_parser_spec.js
		mocha test/web_crawler_spec.js