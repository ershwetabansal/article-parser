"use strict";
function article() {
} 
// Adding following just to know the parameters in article object
article.prototype.date = new Date();
article.prototype.article_content = "";
article.prototype.category = "";
article.prototype.host = "";
article.prototype.heading = "";
article.prototype.src_url = "";
article.prototype.img_url = "";

module.exports.getNewInstance = function() {
	return new article();
}

