var html_file = require('fs');
var cheerio = require('cheerio');

module.exports = function(grunt) {

	grunt.initConfig({

		convert: {
			options: {
			explicitArray: false,
			},
			xml2json: {
			options: {
			xml: {
			header: true
			}
			},
			src: ['./src2.xml'],
			dest: './dest.json'
			}
		},


	});
	
	/*******************************************************************************************
	*
	* Convenience Functions
	*
	********************************************************************************************/
	grunt.registerTask('cash-stache', "inserts HTML data into the JSON object", function(json) {
	
		var directory = '.';
		var $;
		
		for(member of json.members) {
			console.log(member.name);
			if(member.name.indexOf('(') != -1)
				member.name = member.name.slice(0, title.indexOf('(')); //remove parameters from title to better find HTML file
				console.log("Title: " + title);
				member.name = member.name.replace(/[.:]/gi, "_");
				
			if(grunt.file.exists(directory + '/html/' + member.name + '.htm')){
				$ = cheerio.load(html_file.readFileSync(directory + '/html/' + member.name + '.htm'));
			}

			
		}
		var json_results = "";
		var isClass = false;
		
		json_results += ",\"params\": {\"summary\": \"";					
		json_results += ($('.topicContent').children('.summary').text()).replace(/\r\n/gi, "") + "\",";
		
		if(filename.indexOf("T_") == 0)
			isClass = true;
		//change later, just for testing
		if(isClass){
			json_results += "\"inheritance\": {";
			$('#ID0RBSection').find('a').each(function() {
				$(this).find('script').remove();
				json_results += "\"" + $(this).attr('href') + "\":\"" + $(this).text() + "\",";
				if($(this).next('br').next('span').length != 0) {
				
					$(this).next('br').next('span').first().find('script').remove();
					json_results += "\"#\": \"" + $(this).next('br').next('span').first().text() + "\",";
				
				}
			});
			json_results = json_results.substr(0, json_results.length - 1);
								
			//close inheritance
			json_results += "},";
		}
		
		json_results += "\"namespace\": {";
		
		json_results += "\"" + $("strong:contains('Namespace:')").next("a").attr('href') + "\": \"" + $("strong:contains('Namespace:')").next("a").text() + "\"},";
							
		json_results += "\"assembly\": \"?\",";
		
		json_results += "\"syntax\": {";
		
		//gets all content in the Syntax block.
		$('.codeSnippetContainerCode').each(function() {
			var id = $(this).attr('id');
			grunt.log.writeln(id);
			switch(id.substr(id.indexOf("_Div"), id.length)) {
			
				case "_Div1":
					json_results += "\"C#\": \"";
					break;
				case "_Div2":
					json_results += "\"VB\": \"";
					break;
				case "_Div3":
					json_results += "\"C++\": \"";
					break;
			
			}
			
			$(this).find('pre').each(function() {
			
			
				json_results += $(this).text().replace(/\r\n/g, " ").replace(/\t/g, " ") + " ";
				
			});
			
			json_results = json_results.trim();
			
			json_results += "\",";
		});
		
		json_results = json_results.substr(0, json_results.length - 1) + "\r\n";
		
		//close syntax
		json_results += "},";
		
		//sentence below syntax box
		if(isClass)
			json_results += "\"lower_syntax_text\": \"" + $('#ID2RBSection').next('p').text() + "\",\r\n";
		
		if(isClass){
			//adds constructor data for all constructors
			json_results += "\"constructors\": {\r\n";
			
			$('#ID3RBSection table').find('tr[data]').each(function() {
			
				json_results += "\"" + $(this).find('td a').text() + "\": {";
				json_results += "\"link\":\"" + $(this).find('td a').attr('href') + "\",\r\n";
				json_results += "\"description\":\"" + $(this).find('td div').text() + "\",\r\n";
				
				var visibility = $(this).attr('data');
				var visibility = visibility.split(";");
				
				for (type of visibility) {
				
					if(type != "")
						json_results += "\"" + type + "\": \"\",";
				}
			
				json_results = json_results.substr(0, json_results.length - 1) + "\r\n},";
			});
			
			json_results = json_results.substr(0, json_results.length - 1) + "\r\n";
			
			//close constructor block
			json_results += "},";
		
			json_results += "\"methods\": {\r\n";
			
			//adds Method data for all methods
			$('#ID4RBSection table').find('tr[data]').each(function() {
			
				json_results += "\"" + $(this).find('td a').text().replace(/\r\n/, "") + "\": {\r\n";
				json_results += "\"link\":\"" + $(this).find('td a').attr('href') + "\",\r\n";
				
				json_results += "\"description\":\"" + $(this).find('td div').text().trim().replace("\r\n", " ") + "\",\r\n";
				
				var visibility = $(this).attr('data');
				var visibility = visibility.split(";");
				
				for (type of visibility) {
				
					if(type != "")
						json_results += "\"" + type + "\": \"\",";
				}
			
				json_results = json_results.substr(0, json_results.length - 1) + "\r\n},";
			});
			
			json_results = json_results.substr(0, json_results.length - 1) + "\r\n";
			
			//close methods block
			json_results += "},\r\n";
			
		}
		
		if(isClass){
			var property = false;
			for(var k = 0; k < 2; k++) {
				if($("div span[onclick*='ID" + (5 + k) + "RB']").text() == "Properties" && !property){
					json_results += "\"properties\": {\r\n";
					property = true;
				}
				else{
					json_results += "\"fields\": {\r\n";
				}
				
				//add all property/field data for class
				$("#ID" + (5 + k) + "RBSection table").find('tr[data]').each(function() {
				
					json_results += "\"" + $(this).find('td a').first().text().replace(/\r\n/, "") + "\": {\r\n";
					json_results += "\"link\":\"" + $(this).find('td a').attr('href') + "\",\r\n";
					
					json_results += "\"description\":\"" + $(this).find('td div').text().trim().replace("\r\n", " ") + "\",\r\n";
					
					var visibility = $(this).attr('data');
					var visibility = visibility.split(";");
					
					for (type of visibility) {
					
						if(type != "")
							json_results += "\"" + type + "\": \"\",";
					}
				
					json_results = json_results.substr(0, json_results.length - 1) + "\r\n},";
				});
				
				json_results = json_results.substr(0, json_results.length - 1) + "\r\n";					
				
				
				if(property)
					k++;		

				//close properties/fields
				json_results += "},";
			}
			
			
		}
		
		if($("h4:contains('Parameters')").length){
		
			json_results += "\"arguments\": {\r\n";
		
			$("h4:contains('Parameters')").next('dl').find('dt').each(function() {
			
				json_results += "\"" + $(this).children('.parameter').text() + "\" {\r\n";
				var type = "";
				$(this).next('dd').children().each(function() {
				
					if($(this).children().length){
					
						type += $(this).children(":not('script')").text();
					
					}
					else {
						type += $(this).text();
						
						}
				
				});
				json_results += "\"type\": \"" + type + "\",";
				
				$(this).next('dd').find('a').remove(); //narrows down the content to just the description text
				var descr_text = $(this).next('dd').html();
				descr_text = descr_text.split("<br>")[1];
				json_results += "\"description\": \"" + descr_text + "\"},";
			
			
			});
			
			json_results = json_results.substr(0, json_results.length - 1);
			//close argument bracket
			json_results += "},";
		}
		
		if($("h4:contains('Return Value')").length) {
		
			json_results += "\"return_val\": {\r\n";
		
			json_results += "\"type\": \"" + $("h4:contains('Return Value')").next('a').text() + "\",";
			
			$('#ID1RBSection').children().each(function() {

				$(this).empty();


			})	
			json_results += "\"description\": \"" + $('#ID1RBSection').text().split("Type:")[1] + "\"}},";
		
			
		}
		
		
		if($("h4:contains('Field Value')").length) {
		
			
			json_results += "\"type\": \"";
			
			
			$("h4:contains('Field Value')").nextUntil('div', ":not('script')").each(function() {

					json_results += $(this).text();
			
				
			});
			
			json_results += "\",";
		
		}
		
		json_results = json_results.substr(0, json_results.length - 1) + "\r\n},\r\n";
		
		json_results = json_results.substr(0, json_results.length - 1);	
		
		//close params
		json_results += "}";
		
	});
	
	grunt.loadNpmTasks('grunt-convert');

	var t = JSON.parse(grunt.file.read('dest.json'));
	grunt.registerTask('default', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', ['convert', 'cash-stache:'+ t]);

};