module.exports = function(grunt) {

	grunt.initConfig({
	  gyzoomz: {
		"./final.json": "./index.html" 
	  }
	});


	grunt.registerTask('gyzoomz', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', function(src1, src2, dest) {
		
		//if files do not exist, warn the user and exit
		if(!grunt.file.exists("./" + src1) || !grunt.file.exists("./" + src2) || !grunt.file.exists("./" + dest)){
		
			grunt.fail.warn("\nOne or more files do not exist!");
		
		}
		
		//check to make sure the extensions are of the type that this parser can support
		var extension_src1 = src1.slice(src1.indexOf('.') + 1, src1.length);
		var extension_src2 = src2.slice(src2.indexOf('.') + 1, src2.length);
		var extension_dest = dest.slice(dest.indexOf('.') + 1, dest.length);
		
				
		if((extension_src1 !== "xml" && extension_src1 !== "html") &&
			(extension_src2 !== "html" && extension_src2 !== "xml")){
		
			grunt.fail.warn("\n This tool only works for .xml and .html source files.");
		
		}
		
		var xml_contents = grunt.file.read(src2);
		
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
			}//if a type is closed out, i.e.: </bracket>.
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
				
				var copy_contents = xml_contents;
				var j = i;
				while(copy_contents.charAt(j + 1) == '\r' || copy_contents.charAt(j + 1) == '\n' ||
				copy_contents.charAt(j+1) == ' ') {
					
					//This loop moves through all formatting in a copy of the XML.
					j++;
				}
				
				if(copy_contents.charAt(j + 1) == "<" && copy_contents.charAt(j + 2) == "/") {
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
				hasParam = false;
				var paramCount = 0;
				
				while(check != ">") {
					
					
					if(check == "="){ //basically have we found a param within the tag
					
						hasParam = true;
						paramCount++;
						var checkspace = ""; //will be the param name
						var j = 1;
						json_results = json_results.substr(0, json_results.length - 1); //move JSON output back to last letter of param name
						
						while(xml_contents.charAt(i - j) != " ") { //loop back untill we've read the whole param name
						
							checkspace = xml_contents.charAt(i - j).concat(checkspace);  //add letter to front of checkspace
							json_results = json_results.substr(0, json_results.length - 1); //move back another index
							j++;
						}
					
						//moves JSON output back to the space before the param name
						json_results = json_results.substr(0, json_results.length - 1);
						
						if(paramCount == 1) //if it's the first param, open the bracket for nexted parameters
							json_results += ("\": {\"" + checkspace + "\": ");
						else
							json_results += (",\"" + checkspace + "\": "); //if it's not we're already within the nest
						
					}
					
					i++; //these few lines basically take care of printing the parameter text
					check = xml_contents.charAt(i);
					json_results += check;
				}
				
				json_results = json_results.substr(0, json_results.length - 1); //gets rid of the ">" that gets added in the final loop around
				if(!hasParam) {
					i--; //if there wasn't a parameter there's no special JSON output that is needed, so move index to right before the ">"
				}
				else {

					var copy_contents = xml_contents;
					var j = i;
					while(copy_contents.charAt(j + 1) == '\r' || copy_contents.charAt(j + 1) == '\n' ||
					copy_contents.charAt(j+1) == ' ') {

						//if there is a parameter, search ahead in the XML to see what the next set of brackets are
						j++;
					}

					if(copy_contents.charAt(j + 1) == "<") {
						
						if(copy_contents.charAt(j + 2) == "/"){
						
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
			else if(xml_contents.charAt(i) == '>' && !isData) {
				
				var copy_contents = xml_contents;
				var j = i;
				while(copy_contents.charAt(j + 1) == '\r' || copy_contents.charAt(j + 1) == '\n' ||
				copy_contents.charAt(j+1) == ' ') {
				
					
					j++;
				}
				
				if(copy_contents.charAt(j + 1) == "<") {
				json_results += "\": {";
				}
				else {
					isData = true;
					json_results += "\": \"";
				}
			
			}
			else {

			var reg = /\W/;
			var reg2 = / /;
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
			
		grunt.file.write(dest, json_results.substr(0, json_results.length - 1) + "}");
		
		});

};