var html_file = require('fs');
var cheerio = require('cheerio');

module.exports = function(grunt) {

	grunt.initConfig({
	  gyzoomz: {
		"./final.json": "./index.html" 
	  }
	});
	
	/*******************************************************************************************
	*
	* Convenience Functions
	*
	********************************************************************************************/
	function check_forward(copy_contents, i) {
	
		var j = i;
		while(copy_contents.charAt(j + 1) == '\r' || copy_contents.charAt(j + 1) == '\n' ||
		copy_contents.charAt(j+1) == ' ') {
		
			//skip over any formatting
			j++;
		}
	
		return j;
	}	
	
	function check_and_write_params($, filename) {
	
		var json_results = "";
		var isClass = false;
		
		json_results += ",\"params\": {\"summary\": \"";					
		json_results += ($('.topicContent').children('.summary').text()).replace(/\r\n/gi, "") + "\",";
		
		if(filename.indexOf('T_') == 0)
			isClass = true;
		//change later, just for testing
		if(!isClass){
			json_results += "\"inheritance\": {";
			$('#ID0RBSection').find('a').each(function() {
				$(this).find('script').remove();
				json_results += "\"" + $(this).attr('href') + "\":\"" + $(this).text() + "\",";
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
		json_results += "},\r\n";
		
		//sentence below syntax box
		if(!isClass)
			json_results += "\"lower_syntax_text\": \"" + $('#ID2RBSection').next('p').text() + "\",\r\n";
		
		if(!isClass){
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
						json_results += "\"" + type + "\": \"\",\r\n";
				}
			
				json_results = json_results.substr(0, json_results.length - 1) + "},\r\n";
			});
			
			json_results = json_results.substr(0, json_results.length - 1);
			
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
						json_results += "\"" + type + "\": \"\",\r\n";
				}
			
				json_results = json_results.substr(0, json_results.length - 1) + "},\r\n";
			});
			
			json_results = json_results.substr(0, json_results.length - 1);
			
			//close methods block
			json_results += "},\r\n";
			
		}
		
		if(!isClass){
			var property = false;
			for(var k = 0; k < 2; k++) {
				if($("div span[onclick*='ID5RB']").text() == "Properties" && !property){
					json_results += "\"properties\": {\r\n";
					property = true;
				}
				else{
					json_results += "\"fields\": {\r\n";
				}
				
				//add all property/field data for class
				$("#ID" + (5 + k) + "RBSection table").find('tr[data]').each(function() {
				
					json_results += "\"" + $(this).find('td a').text().replace(/\r\n/, "") + "\": {\r\n";
					json_results += "\"link\":\"" + $(this).find('td a').attr('href') + "\",\r\n";
					
					json_results += "\"description\":\"" + $(this).find('td div').text().trim().replace("\r\n", " ") + "\",\r\n";
					
					var visibility = $(this).attr('data');
					var visibility = visibility.split(";");
					
					for (type of visibility) {
					
						if(type != "")
							json_results += "\"" + type + "\": \"\",\r\n";
					}
				
					json_results = json_results.substr(0, json_results.length - 1) + "},\r\n";
				});
				
				json_results = json_results.substr(0, json_results.length - 1);					
				
				
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
				var type = $(this).next('dd').children('.nolink').text();
				if(type == ""){
					$(this).next('dd').children('a').find('script').remove();
					type = $(this).next('dd').children('a').text();
				}
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
		
		json_results = json_results.substr(0, json_results.length - 1) + "},\r\n";
		
		json_results = json_results.substr(0, json_results.length - 1);	
		
		//close params
		json_results += "}";
		
		return json_results;
	}

	grunt.registerTask('cash_stache', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', function(directory) {
	

		var src_html = grunt.file.expand(directory + "/*.xml");
		var xml_contents = grunt.file.read(src_html[0]);

		
		
		//begin json output
		var json_results = "{";
		
		//if current data being transferred to JSON is data (internal text, name parameter,etc.) or not.
		var isData = false;
		
		//If XML tag has a parameter
		var hasParam = false;
		
		//If the current index in the file is outside the bounds of a tag
		var outsideTag = false;
		
		for(var i = 0; i < xml_contents.length; i++){
		
			//moves over header data within <?...?> brackets.
			if(xml_contents.charAt(i) == '<' && xml_contents.charAt(i + 1) == '?') {
			
				while(xml_contents.charAt(i) + xml_contents.charAt(i + 1) != "?>"){
				
					i++;
				
				}
				
				while(xml_contents.charAt(i + 1) != "<") {
				
					i++;
				}
			
			}//If we are hitting a comment, this will pass over it
			else if(xml_contents.charAt(i) == '<' && xml_contents.charAt(i + 1) == '!' &&
				xml_contents.charAt(i + 2) == '-' && xml_contents.charAt(i + 3) == '-') {
				
				
				
				while((xml_contents.charAt(i) + xml_contents.charAt(i + 1) +
					xml_contents.charAt(i + 2)) != '-->') {
					
					i++;
				}
				grunt.log.writeln(xml_contents.charAt(i) + xml_contents.charAt(i+1) + xml_contents.charAt(i+2));
				i += 3;
			}
			//if a type is closed out, i.e.: </bracket>.
			else if(xml_contents.charAt(i) == '<' && xml_contents.charAt(i + 1) == '/') {
			
				//If we're closing out an entire level, rather than content
				if(!isData){
					json_results += "},";
				}
				else { //If we're closing out content, such as text, numbers, etc.
					json_results += "\"";
					if(hasParam) //If the tag we're closing out also had parameters, it would mean the data is nested and so we have to close it this way
						json_results += "},";
					else 
						json_results += ","; //otherwise it's a tag with data but no params and so it can be closed with a simple ","
					isData = false;
				}

				var check = "";
				
				//skip over the text portion of a closing bracket so it doesn't print out
				while(check != ">"){
				
					check = xml_contents.charAt(i);
					i++;
				}
				
				var j = check_forward(xml_contents, i);
				
				if(xml_contents.charAt(j + 1) == "<" && xml_contents.charAt(j + 2) == "/") {
					//if the next bracket after the current closed bracket is also a closed bracket
					//then we need to remove the ','.  This was easier than having a more complicated if/else at the start
					//of the block
					json_results = json_results.substr(0, json_results.length - 1);
						
				}
				else {
					
				}
				//we're now outside the bounds of a tag
				outsideTag = true;
				
			} //if we're opening up a new bracket, write out a " or check for params
			else if(xml_contents.charAt(i) == '<' && !isData) {
			
				json_results += "\"";
				
				var check = xml_contents.charAt(i);
				
				var checkspace = "";
				
				hasParam = false;
				
				//the name attr.  Will be used to open html file.
				var title = "";
				
				var paramCount = 0;
				
				var tagName = "";
								
				while(check != ">") {
					
					
					
					if(check == "="){ //basically have we found a param within the tag
					
						hasParam = true;
						paramCount++;
						var j = 1;
						json_results = json_results.substr(0, json_results.length - 1); //move JSON output back to last letter of param name
						
						while(xml_contents.charAt(i - j) != " ") { //loop back untill we've read the whole param name
						
							checkspace = xml_contents.charAt(i - j).concat(checkspace);  //add letter to front of checkspace
							json_results = json_results.substr(0, json_results.length - 1); //move back another index
							j++;
						}
						
						//gets the name of the tag for HTML purposes
						while(xml_contents.charAt(i - j) != "<") { //loop back untill we've read the whole param name
						
							tagName = xml_contents.charAt(i - j).concat(tagName);  //add letter to front of checkspace
							j++;
						}
						tagName = tagName.trim();

					
						//moves JSON output back to the space before the param name
						json_results = json_results.substr(0, json_results.length - 1);
						
						if(paramCount == 1) //if it's the first param, open the bracket for nexted parameters
							json_results += ("\": {\"" + checkspace + "\": ");
						else
							json_results += (",\"" + checkspace + "\": "); //if it's not we're already within the nest
						
					}
					
					i++; //these few lines basically take care of printing the parameter text
					check = xml_contents.charAt(i);
					if(hasParam && check != '"' && check != '>')
						title += check;
					json_results += check;
				}
				
				json_results = json_results.substr(0, json_results.length - 1); //gets rid of the ">" that gets added in the final loop around

				
				//if there's an attribute, and it's a name.  Assumption is sandcastle output will always have a name attr. if it coordinates
				//with an html file.  If not, it's just a meaningless bracket with regards to the html files.
				if(checkspace == 'name' && tagName == 'member') {
				
					if(title.indexOf('(') != -1)
					title = title.slice(0, title.indexOf('(')); //remove parameters from title to better find HTML file
					console.log("Title: " + title);
					title = title.replace(/[.:]/gi, "_");
					if(grunt.file.exists(directory + '/html/' + title + '.htm')){
						var $ = cheerio.load(html_file.readFileSync(directory + '/html/' + "M_Blueshirt_Core_Base_BaseComponent_SetCheckbox" + '.htm'));
					}
					else{
						grunt.file.write('dest.json', json_results);
						grunt.fail.fatal("File does not exist!");
					}

					json_results += check_and_write_params($, title);
					grunt.file.write('dest.json', json_results);
					grunt.fail.fatal('FAIL');
				}
				
				if(!hasParam) {
					i--; //if there wasn't a parameter there's no special JSON output that is needed, so move index to right before the ">"
				}
				else {

					var j = check_forward(xml_contents, i);

					if(xml_contents.charAt(j + 1) == "<") {
						
						if(xml_contents.charAt(j + 2) == "/"){
						
							//if there's another set of closing brackets than don't print out a comma
						}
						else {
							json_results += ","; //if there is text after the '<' than it needs to print out next, so we put a comma
						}
					}
					else {
					isData = true; //set that there IS data and add to JSON output
					json_results += ",\"_\": \"";
					}					
				}
				
				outsideTag = false;
			}
			else if(xml_contents.charAt(i) == '>' && !isData) { //if exiting a tag, which implies either we're entering content
				
				var j = check_forward(xml_contents, i);
				
				if(xml_contents.charAt(j + 1) == "<") { //if next character is a "<" than there was no data to be printed but there may be inner tags
				json_results += "\": {";
				}
				else { //if we hit anything else we can make the assumption that there is inner text
					isData = true;
					json_results += "\": \"";
				}
			
			}
			else {

			//this last block handles printing out any actual text that doesn't have special meaning in XML.
			if(xml_contents.charAt(i) != '\r' && xml_contents.charAt(i) != '\n' && !outsideTag) {
					if(xml_contents.charAt(i) == '"'){
						json_results += '\'';
					}
					else if(xml_contents.charAt(i) == "\\") {
						json_results += "\\\\";
					}
					else {
						json_results += xml_contents.charAt(i);
					}
					}
			
			}
		
		}
			
		grunt.file.write("dest.json", json_results.substr(0, json_results.length - 1) + "}");
		
		});

};