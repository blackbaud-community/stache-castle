var html_file = require('fs');
var cheerio = require('cheerio');
var r_url;

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
			src: ['../stache-castle-example-implementation/stache-castle-example-implementation/sandcastle-output-uat/WebTOC.xml'],
			dest: '../stache-castle-example-implementation/stache-castle-example-implementation/sandcastle-output-uat/dest.json'
			}
		},
		cash_stache: {
		
			dir: '../stache-castle-example-implementation/stache-castle-example-implementation/sandcastle-output-uat', //directory that HTML folder and XML files are in
			html_dir: 'html/',
			dest: 'dest.json',
			has_url: true,
			url_attr: 'Url',
		
		},


	});
	
	/*******************************************************************************************
	*
	* Convenience Functions
	*
	********************************************************************************************/
	function add_scripts($, t) {

	if(!t.hasOwnProperty('scripts')){
			var scripts = [];
			$('head script').each(function() {
			
				scripts.push({"src": $(this).attr('src')});
			
			});
			t.scripts = scripts;
		}
	}
	/**
	* This function iterates through a table marked by "ID(tableIndex)RBSection" and stores it in
	* a JSON with choice as the key and member as the specific object that the key will be added to
	*/
	function log_lists(tableIndex, $, member, choice) {
	
		var large_t = false; //
		var find = 'tr'; //some tables do not have data, so i wanted to start with the basic type. Add data if it exists.
		if($("#ID" + tableIndex + "RBSection table").find('tr[data]').length)
			find += '[data]';
		else
			$("#ID" + tableIndex + "RBSection table").find(find).first().remove();

			
		if($("#ID" + tableIndex + "RBSection table").find("tr:not([data])").last().find('td').length > 2){
			large_t = true; //there are tables (that don't have data) that have extra spaces in the first column.  this removes them. The exception is the tables in T_* files.
		}
			
		$("#ID" + tableIndex + "RBSection table").find(find).each(function() {
		
			if(large_t){
				$(this).find('td').first().remove();
				member.params[choice][$(this).find('td').first().text()] = {"value": $(this).find('td').first().next().text(), "description": $(this).find('td').last().text()};
			}
			else {
			
				var key = $(this).find('td a').first();
				if($(key).children().length){
				
					key = $(key).html(); //if there are children, then there are script and span code.  We need the HTML rather than text in this case.
				
				}
				else {
				
					key = $(key).text();
				
				}
				member.params[choice][key] =  {"link": $(this).find('td a').first().attr('href'), "description": $(this).find('td').last().text()};

				var visibility = $(this).attr('data');
				
				if(visibility){ //this block gets the data specifics (i.e.: public, static, private, etc.)
					var visibility = visibility.split(";");
					
					for (type of visibility) {
					
						if(type != "")
							member.params[choice][key][type] = "";
					}
				}
			}
			
		});
	
	}
	
	/**
	* This function recurses through a JSON until it reaches a key/value pair.  Than it will
	* call process_html on the parent object and add respective data within the HTML.  This function
	* is only called if the file is marked as having a URL parameter.  Some potential code is 
	* commented out because there is a potential instance where an XML can be recursive and not have
	* a URL parameter.  This has yet to be seen, but it's a possible case.
	*/
	function read_files(t, $) {
	
		
		if(t instanceof Object && Object.keys(t).length >= 1) { //if t is an object and also has a key (implying it's not a lowest level key/value pair or an array
		
			for(key in t){ //recursively call read_files on each key
				var lowest = read_files(t[key]); //if true than we've reached a lowest level key/value pair
				if(grunt.config.get('cash_stache.has_url') && lowest) { //if there is a url param and we're at the lowest level we can open the file at the url location and call
																		//process html on the parent object
				
					var url = grunt.config.get('cash_stache.url_attr'); //the name of the attribute which holds the url
					if(grunt.file.exists(grunt.config.get('cash_stache.dir') + '/' + t[url])){
						$ = cheerio.load(html_file.readFileSync(grunt.config.get('cash_stache.dir') + '/' + t[url]));
						process_html(t, t[url], $);
						r_url = $;

					}
					else {
					
						if(!(typeof t[url] === 'undefined'))
							grunt.log.error("File Does Not Exist! --> " + t[url]);
						else
							grunt.log.error("File Does Not Exist! --> " + key);
					
					}	
					

				}
				/*else if(!grunt.config.get('cash_stache.has_url') && lowest){
					
					if(t.name.indexOf('(') != -1)
						t.name = t.name.slice(0, t.name.indexOf('(')); //remove parameters from title to better find HTML file
					t.name = t.name.replace(/[.:]/gi, "_");
					console.log("Title: " + t.name);

					
					var file = grunt.config.get('cash_stache.dir')  + '/' + grunt.config.get('cash_stache.html_dir') + t.name + '.htm';
					
					if(grunt.file.exists(file)){
						$ = cheerio.load(html_file.readFileSync(file));
						process_html(t, t.name, $);
					}
					else {
					
						grunt.log.error("File Does Not Exist! --> " + file);
					
					}
				}*/
				
			}
			
			return false;
		}
		else if(t instanceof Object && t.isArray()) {
		
			for(obj in t) {
			
				read_files(obj); //call read_files on every object in array
				
			}
			
				return false;

		
		}
		else {
			//console.log(t);
			return true;
		}
	
	}
	
	/**
	* The core functionality of the task is in this function.  It'll add all relevant HTML data to the object
	* "member" which updates the JSON.  the name parameter is used to determine how to treat special cases based on
	* HTML file.
	*/
	function process_html(member, name, $) {	
			
		var isClass = false;
		var isSpecial = false;
		var other = false;
		
		if(name.indexOf("html/") == 0) //ensure we're only analyzing filename
			name = name.split("html/")[1];
		member.params = {};
		
		if(name.indexOf("T_") == 0){ //treat parsing as a class file
			isClass = true;
		}else if(name.indexOf("_") == 1 && name.indexOf("N_") != 0) //treat parsing as F_, M_, P_, R_, G_, E_.
			other = true;
		else if(name.indexOf("_") > 1 || name.indexOf("N_") == 0) //treat parsing as Methods_, Fields_, Overload_, Events_, Properties_, or N_.
			isSpecial = true;
		else
			isSpecial = true;


		//only classes list a heirarchy
		if(isClass){
		
			var extended = false;
			member.params.inheritance = {};
			$('#ID0RBSection').find('a').each(function() {
			
				if(($(this).attr('href')).indexOf('fullInheritance') != -1) {
				
					extended = true;
					return;
				
				} //check if inheritance continues at bottom of page
			
				member.params.inheritance[$(this).attr('href')] =  $(this).html();
				
				if($(this).next('br').next('span').length != 0) { //a case where we're on the page listed, so it's marked as '#'
				
					member.params.inheritance['#'] = $(this).next('br').next('span').first().text();
				
				}
			});
			
			if(extended) {
				var count = $("div[id*='RBSection']").length; //heirarchy is at the bottom
				$("#ID" + count + "RBSection").find('a').each(function() {
				
					member.params.inheritance[$(this).attr('href')] =  $(this).text();
					
					if($(this).next('br').next('span').length != 0) {
					
						member.params.inheritance['#'] = $(this).next('br').next('span').first().text();
					
					}
				
				});
			}
			
			//only classes have a sentence below the syntax block
			member.params.lower_syntax_text = $('#ID2RBSection').next('p').text();

		}

		//If it's none of the special case pages it will list the Namespace and the assembly/assemblies.
		if(!isSpecial && !other) {
			member.params.namespace = {};
			member.params.namespace[$("strong:contains('Namespace:')").next("a").attr('href')] = $("strong:contains('Namespace:')").next("a").text();
								
			if($("strong:contains('Assembly')").length)
				member.params.assembly = $('.topicContent').text().split("Assembly:")[1].split("Syntax")[0];
			else
				member.params.assembly = $('.topicContent').text().split("Assemblies:")[1].split("Syntax")[0];

		}
		//narrows down to other method, field, property files which start with a single character. 
		//These contain syntax data, while other file types that aren't class pages do not (i.e.: Methods_, Fields_, etc.)
		if($(".collapsibleAreaRegion:contains('Syntax')").length){
			member.params.syntax = {};
			
			//gets all content in the Syntax block.
			$('.codeSnippetContainerCode').each(function() {

				var pos = $(this).attr('id').charAt($(this).attr('id').length - 1);
				
				
				member.params.syntax[$("div[id*='_tab" + pos + "']").text()] = $(this).find('pre').text().trim();
				

			});
			
		}//If it's any of those pages that list all of one section under a class.  Files start with Methods_, Fields_, Overload_, N_, G_, R_, or Properties_. These only have collapsible regions.
		else if(isSpecial || other){
		
					if($('.introStyle').next('p').length)
				member.params.summary = $('.introStyle').next('p').text();

		
			$(".collapsibleAreaRegion").each(function() {
			
			
				member.params[$(this).text().trim()] = {};
				log_lists($(this).next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, $(this).text().trim());
			
			
			});
		}
		
		if(isClass && $('#enumerationSection').length == 0){ //if it's a class file, but not an enum which is still classified as a class.  
			//adds constructor data for all constructors
			if($(".collapsibleAreaRegion:contains('Constructors')").length){
					member.params.constructors = {};
					log_lists($(".collapsibleAreaRegion:contains('Constructors')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "constructors");
			}
			//adds method data
			if($(".collapsibleAreaRegion:contains('Methods')").length){
					member.params.methods = {};
					log_lists($(".collapsibleAreaRegion:contains('Methods')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "methods");
			}
			//adds field data
			if($(".collapsibleAreaRegion:contains('Fields')").length){
					member.params.fields = {};
					log_lists($(".collapsibleAreaRegion:contains('Fields')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "fields");
			}
			//adds property data
			if($(".collapsibleAreaRegion:contains('Properties')").length){
					member.params.properties = {};
					log_lists($(".collapsibleAreaRegion:contains('Properties')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "properties");
			}			

			
		}
		else if(isClass && $('#enumerationSection').length){ //if there exists an enumeration section
		
			if($(".collapsibleAreaRegion:contains('Members')").length){
					member.params.members = {};
					log_lists($(".collapsibleAreaRegion:contains('Members')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "members");
			}	
		
		}
		
		
		if($("h4:contains('Parameters')").length){ //if there's parameters listed (usually a method page)
		
			member.params.arguments = {};
		
			$("h4:contains('Parameters')").next('dl').find('dt').each(function() { //parameters are a sequence of <dt><dd> tags
			
					var type = "";
					if($(this).next('dd').children('a').length) { //if there are links, that url needs to be recorded as well as any script and span data within it.
					
						type += $(this).next('dd').html().split("Type:")[1].split("<br>")[0];
					
					}
					else { //otherwise it's probably a special type such as Table or TableRow
					
						type += $(this).next('dd').children('span').text();
					
					}
								
				var descr_text = $(this).next('dd').html();
				descr_text = descr_text.split("<br>")[1]; //gets just the description text
			
				member.params.arguments[$(this).children('.parameter').text()] = {"type": type, "description": descr_text};

			});
			
		}
		
		if($("h4:contains('Return Value')").length) { //if there's a return value (usually a method page)
				
			member.params.return_val = {};
			//gets the very last bit of content in a method page, which is return value info
			var stuff = $('#ID1RBSection').html().split("Type:");
			stuff = stuff[stuff.length - 1];
			
			stuff = stuff.split("<br>")[0]; //get just the data type html
			stuff = "<html>" + stuff + "</html>";
			
			member.params.return_val["type"] = $(stuff).html(); //get all html regarding data type, including all span and script stuff
			
			var split = $('#ID1RBSection').html().split("<br>");
			
			split = split[split.length - 1]; //get the description text after the last <br>
			
			split = "<html><body>" + split + "</body></html>";
			
			
			member.params.return_val["description"] = $(split).text();


		}
		
		
		if($("h4:contains('Field Value')").length) { //get field value html (in case there are special script tags)
		
						
			var field_val = $("div[id*='RBSection']:contains('Field Value')").html().split("Type:")[1];
			
			member.params.type = field_val;
		}
		
		//if this is a property page, or an Event page which labels by Value only
		if($("h4:contains('Property Value')").length || $('h4').filter(function() {return $(this).text() == 'Value';}).length) {
		
			member.params.type = $('#ID1RBSection').text().split("Type:")[1];
		
		}
		
		if($("h4:contains('Reference')").length){ //record all references
		
			member.params.references = {};
			
			$("h4:contains('Reference')").parent().children('div').each(function() {
			
				member.params.references[$(this).children('a').attr('href')] = $(this).children('a').text();
			
			});
		
		}
		

	
	}
	
	grunt.registerTask('cash_stache', "inserts HTML data into the JSON object", function() {
	
		grunt.task.requires('convert'); //need to ensure xml2json gets ran before anything else

		var dir = grunt.config.get('cash_stache.dir'); //directory where XML's will be
		var htmldir = grunt.config.get('cash_stache.html_dir'); //directory where html will be
	
		var t = grunt.file.readJSON(dir + "/" + grunt.config.get('cash_stache.dest')); //read previously generated JSON file
		
		var $;
		if(grunt.config.get('cash_stache.has_url')){ //if there is a URL run recursively.  This is a bad way to do it because i'm working under the assumption that if there's a
													//than the file is probably recursive.  Most SandCastle output tested against seems to support this assumption, but i am actively
													//thinking of a way to support recursivity whether or not there is a URL.  
			read_files(t, $);
			add_scripts(r_url, t);
		}
		else {//otherwise, it's not recursive and we'll need to run through the actual html folder and match against HTML content.  This is to ensure every file is covered, wheread
			//if the urls are given I am assuming they've given us everything they need or want.
			var names = {};
		
			t.doc.members.member.forEach(function(val, ind, arr) { //this block forms an array of names formatted to contain no special characters or spaces.  
			
				var params = "";
				if(val.name.indexOf("(") != -1)
					params = val.name.substr(val.name.indexOf("("), val.name.length);
				params = params.replace(/[{}]/g, ",");
				params = params.split(",");
				for(item of params){
					var index = params.indexOf(item);
					item = item.split(".");
					item = item[item.length	- 1];
					params[index] = item;
				}
				var name = val.name.split("(")[0]; //take out parantheses and leave just the parameter names
				for(item of params){
					name += item;
				}
				names[name.replace(/[)(.:,}{ ]/g, "")] = ind; //remove parameters from title to better find HTML file
			}); 
		
			grunt.file.recurse(dir + "/" + htmldir, function(abspath, rootdir, subdir, filename) { //run through the entire html folder
			
				var newFile = filename;
				newFile = newFile.split(".htm")[0]; //remove file type extension

				if(newFile.substr(newFile.length - 2, newFile.length - 1).match(/(_[0-9])/g) != null){
					newFile = newFile.substr(0, newFile.length - 2); //if file ends in a number than it's probably a copy of another with different parameters

				}
				
				if(grunt.file.exists(abspath))
					$ = cheerio.load(html_file.readFileSync(abspath));
				else
					grunt.fail.fatal("FILE DOES NOT EXIST");
				
				if($("h4:contains('Parameters')").length){			//this block appends the parameters to the end of the name
					$("h4:contains('Parameters')").next('dl').find('dd').each(function() {
				
						if($(this).children('a').length) {

							var param = "";
							
							$(this).children(":not('p'):not('script')").each(function() { //iterate through any children of current children that aren't <p> or <script> tags
							
								$(this).html($(this).html().split("</script>")[1]); //reset the inner html to html that comes after the end of a script
								param += $(this).text(); //just add the test

							});
							newFile += param;

						}
						else {
						
							newFile += $(this).children('span').text(); //otherwise, it'll be a custome type such as Table and so we can just add the name
						}
						
					});
				}
				
			   newFile = newFile.replace(/[_.:, ]/gi, ""); //replace any remaining punctuation

				if(names.hasOwnProperty(newFile)) { //if formed name exists in the names array, than we can call process_html on that member
				
					process_html(t.doc.members.member[names[newFile]], filename.split(".htm")[0], $);
				}
				else { //otherwise we need to to create a new member and add it to the existing array in the t JSON object
						var one = {};
						one.name = filename.split(".htm")[0];
						process_html(one, filename.split(".htm")[0], $);					
						t.doc.members.member.push(one);
				}
					
			
			});
		
			add_scripts($, t);
		}
		
		
		grunt.file.write(grunt.config.get('cash_stache.dir') + "/" + grunt.config.get('cash_stache.dest'), JSON.stringify(t, null, '\t'));
		var output = grunt.config.get('cash_stache.dir') + "/" + grunt.config.get('cash_stache.dest');
		var output = output.split(" ");
		grunt.log.ok("Sandcastle output converted! Output is in " + grunt.log.wordlist(output, {separator: ' ', color: 'cyan',}) + '.');

	});
	
	grunt.loadNpmTasks('grunt-convert');

	grunt.registerTask('default', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', ['convert', 'cash_stache']);

};