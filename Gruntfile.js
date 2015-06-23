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
		
		var json_results = "{";
		
		var isData = false;
		
		for(var i = 0; i < xml_contents.length; i++){
		
			//if a type is closed out, i.e.: </bracket>.
			if(xml_contents.charAt(i) == '<' && xml_contents.charAt(i + 1) == '/') {
			
				//If we're closing out an entire level, rather than content
				if(!isData)
					json_results += "},";
				else { //If we're closing out content, such as text, numbers, etc.
					json_results += "\"";
					isData = false;
				}
				
				var check = "";
				
				//skip over the text portion of a closing bracket so it doesn't print out
				while(check != ">"){
				
					check = xml_contents.charAt(i);
					i++;
				}
			
			} //if we're opening up a new bracket, write out a " or check for params
			else if(xml_contents.charAt(i) == '<') {
			
				json_results += "\"";
				
				var check = xml_contents.charAt(i);
				var hasParam = false;
				
				while(check != ">") {
					
					if(check == "="){
						hasParam = true;
						var checkspace = "";
						var j = 1;
						json_results = json_results.substr(0, json_results.length - 1);
						
						while(xml_contents.charAt(i - j) != " ") {
						
							checkspace = xml_contents.charAt(i - j).concat(checkspace);
							json_results = json_results.substr(0, json_results.length - 1);
							j++;
						}
					
						json_results = json_results.substr(0, json_results.length - 1);
						json_results += ("\": {\r\n            \"" + checkspace + "\": ");
						
					}
					
					i++;
					check = xml_contents.charAt(i);
					json_results += check;
				}
				
				json_results = json_results.substr(0, json_results.length - 1);
				if(!hasParam) {
					i--;
				}
				else {

					var copy_contents = xml_contents;
					var j = i;
					while(copy_contents.charAt(j + 1) == '\r' || copy_contents.charAt(j + 1) == '\n' ||
					copy_contents.charAt(j+1) == ' ') {


					j++;
					}

					if(copy_contents.charAt(j + 1) == "<") {
					json_results += ",";
					}
					else {
					isData = true;
					json_results += ",\r\n            \"_\": \"";
					}					
				}
			}
			else if(xml_contents.charAt(i) == '>') {
				
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
			
				json_results += xml_contents.charAt(i);
			
			}
		
		}
			
		grunt.file.write(dest, json_results);
		
		});

};