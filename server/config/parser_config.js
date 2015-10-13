
/**
* This file parses article_parser.json to get the configuration parameters. And exposes API methods 
* for different configurations.
**/
"use strict";
var configData = require('./article_parser.json');

// var skiptag_regex;
// (function() {
// 	var skiptag = "";
// 	var len = configData.skiptags.length;
// 	for (var i=0; i < len; i++){
// 		skiptag = (skiptag === "") ? "" : (skiptag + "|");
// 		skiptag = skiptag + configData.skiptags[i];
// 	}
// 	skiptag = skiptag;
// 	skiptag_regex = new RegExp(skiptag);
// })();
module.exports.getCategories = function() {
	return configData.categories;
}

module.exports.getCountries = function() {
	return configData.countries;
}

module.exports.getHosts = function() {
	return configData.hosts;
}
// module.exports.getSkipTag = function() {
// 	return skiptag_regex;
// }

module.exports.getCrawlingConfig = function(host,category) {
	var obj = getHostCatObject(host,category);
	return {
		"url" : getParameter(obj,"url"),
		"depth" : getParameter(obj,"depth"),
		"min_article_size" : getParameter(obj,"min_article_size"),
		"min_text_size" : getParameter(obj,"min_text_size"),
		"match_words" : function() {
			var words = getParameter(obj,"match_words");
			var words_Regex = "";
			if (typeof(words) !== "undefined") {
				
				var len = words.length;
				for (var i=0; i < len; i++){
					words_Regex = (words_Regex === "") ? "" : (words_Regex + "|");
					words_Regex = words_Regex + words[i];
				}
			}
			return new RegExp(words_Regex);
		}(),
		// "skip_tags" : function() {
		// 	var skip_tags = getParameter(obj,"skip_tags");
		// 	var skip_tags_Regex = "";
		// 	if (typeof(skip_tags) !== "undefined") {
				
		// 		var len = skip_tags.length;
		// 		for (var i=0; i < len; i++){
		// 			skip_tags_Regex = (skip_tags_Regex === "") ? "" : (skip_tags_Regex + "|");
		// 			skip_tags_Regex = skip_tags_Regex + skip_tags[i];
		// 		}

		// 	}
		// 	return new RegExp(skip_tags_Regex) ;
		// }(),
		"skip_tags" : getParameter(obj,"skip_tags"),
		"heading_tag" : getParameter(obj,"heading_tag"),
		"skip_words" : getParameter(obj,"skip_words"),
		"end_string" : getParameter(obj,"end_string"),
		"article_tag" : getParameter(obj,"article_tag"),
		"date_matcher" : function() {
			var current_date = new Date();
			var current_year = current_date.getFullYear();
			var current_month = current_date.getMonth();
			var current_day = current_date.getDate();
			// console.log("current_Day:"+current_day);

			var date_format = getParameter(obj,"date_format");
			var mon = configData.mon[current_month.toString()];
			var month = configData.month[current_month.toString()];
			var day = (typeof(configData.dates[current_day.toString()]) === "undefined") ? current_day : configData.dates[current_day.toString()];  
			
			date_format = date_format.replace("<month>",month);
			date_format = date_format.replace("<mon>",mon);
			date_format = date_format.replace("<Y>",current_year);
			date_format = date_format.replace("<d>",day);
			// console.log("date_format : "+date_format);
			return new RegExp(date_format)
		}
	};
}

function getHostCatObject(host,category) {
	if (host !== "undefined" && category !== "undefined") {
		var hostConfig = configData[host];
		if (typeof (hostConfig) !== "undefined") {
			return hostConfig[category];
		}
	}	
}

function getParameter(hostConfigCategory,parameter) {
	if (typeof (hostConfigCategory) !== "undefined") {
		var value =  hostConfigCategory[parameter];
		if (typeof (value) !== "undefined") {
			return value;
		}
	}
	return configData.defaults[parameter];
}

module.exports.getDateType = function(date) {
	return new Date();
}