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
		cash_stache: {
		
			dir: '.',
			html_dir: 'html/',
			dest: 'dest.json',
			has_url: false,
			url_attr: 'Url',
		
		},


	});
	
	/*******************************************************************************************
	*
	* Convenience Functions
	*
	********************************************************************************************/
	function log_lists(tableIndex, $, member, choice) {
	
		var large_t = false;
		var find = 'tr';
		if($("#ID" + tableIndex + "RBSection table").find('tr[data]').length)
			find += '[data]';
			
		if($("#ID" + tableIndex + "RBSection table").find('tr').last().find('td').length > 2){
			$("#ID" + tableIndex + "RBSection table").find('tr').first().remove();
			large_t = true;
		}
			
		$("#ID" + tableIndex + "RBSection table").find(find).each(function() {
		
			if(large_t){
				$(this).find('td').first().remove();
				member.params[choice][$(this).find('td').first().text()] = {"value": $(this).find('td').first().next().text(), "description": $(this).find('td').last().text()};
			}
			else {
				var key = $(this).find('td a').first().text();
				member.params[choice][key] =  {"link": $(this).find('td a').first().attr('href'), "description": $(this).find('td').last().text()};

				var visibility = $(this).attr('data');
				
				if(visibility){
					var visibility = visibility.split(";");
					
					for (type of visibility) {
					
						if(type != "")
							member.params[choice][key][type] = "";
					}
				}
			}
			
		});
	
	}
	
	function read_files(t) {
	
		var $;
		
		if(t instanceof Object && Object.keys(t).length >= 1) {
		
			for(key in t){
				var lowest = read_files(t[key]);
				if(grunt.config.get('cash_stache.has_url') && lowest) {
				
					var url = grunt.config.get('cash_stache.url_attr');
					console.log(t[url]);
					if(grunt.file.exists(grunt.config.get('cash_stache.dir') + '/' + t[url])){
						$ = cheerio.load(html_file.readFileSync(grunt.config.get('cash_stache.dir') + '/' + t[url]));
						process_html(t, t[url], $);

					}
					else {
					
						grunt.log.error("File Does Not Exist! --> " + t[url]);
					
					}	
					

				}
				else if(!grunt.config.get('cash_stache.has_url') && lowest){
					
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
				}
				
			}
			
			return false;
		}
		else if(t instanceof Object && t.isArray()) {
		
			for(obj in t) {
			
				read_files(obj);
				
			}
			
				return false;

		
		}
		else {
			//console.log(t);
			return true;
		}
	
	}
	
	function process_html(member, name, $) {	
			
		var isClass = false;
		var isSpecial = false;
		var other = false;
		
		if(name.indexOf("html/") == 0)
			name = name.split("html/")[1];
		member.params = {};
		
		if(name.indexOf("T_") == 0)
			isClass = true;
		else if(name.indexOf("_") == 1 && name.indexOf("N_") != 0)
			other = true;
		else if(name.indexOf("_") > 1 || name.indexOf("N_") == 0)
			isSpecial = true;


		//only classes list a heirarchy
		if(isClass){
		
			var extended = false;
			member.params.inheritance = {};
			$('#ID0RBSection').find('a').each(function() {
			
				if(($(this).attr('href')).indexOf('fullInheritance') != -1) {
				
					extended = true;
					return;
				
				}
			
				$(this).find('script').remove();
				member.params.inheritance[$(this).attr('href')] =  $(this).text();
				
				if($(this).next('br').next('span').length != 0) {
				
					$(this).next('br').next('span').first().find('script').remove();
					member.params.inheritance['#'] = $(this).next('br').next('span').first().text();
				
				}
			});
			
			if(extended) {
				var count = $("div[id*='RBSection']").length;
				$("#ID" + count + "RBSection").find('a').each(function() {
				
					$(this).find('script').remove();
					member.params.inheritance[$(this).attr('href')] =  $(this).text();
					
					if($(this).next('br').next('span').length != 0) {
					
						$(this).next('br').next('span').first().find('script').remove();
						member.params.inheritance['#'] = $(this).next('br').next('span').first().text();
					
					}
				
				});
			}

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
		if(!isClass && other && $(".collapsibleAreaRegion:contains('Syntax')").length){
			member.params.syntax = {};
			
			//gets all content in the Syntax block.
			$('.codeSnippetContainerCode').each(function() {

				var pos = $(this).attr('id').charAt($(this).attr('id').length - 1);
				
				
				member.params.syntax[$("div[id*='_tab" + pos + "']").text()] = $(this).find('pre').text().trim();
				

			});
			
		}//If it's any of those pages that list all of one section under a class.  Files start with Methods_, Fields_, Overload_, N_, G_, R_, or Properties_. These only have collapsible regions.
		else if(isSpecial || other){
		
			$(".collapsibleAreaRegion").each(function() {
			
			
				member.params[$(this).text().trim()] = {};
				log_lists($(this).next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, $(this).text().trim());
			
			
			});
		
		
		}

				
		//sentence below syntax box
		if(isClass && $('#enumerationSection').length == 0)
			member.params.lower_syntax_text = $('#ID2RBSection').next('p').text();
		
		if(isClass && $('#enumerationSection').length == 0){
			//adds constructor data for all constructors
			member.params.constructors = {};
			log_lists(3, $, member, "constructors");
					
			member.params.methods = {};
			log_lists(4, $, member, "methods");
				
			if($(".collapsibleAreaRegion:contains('Fields')").length){
					member.params.fields = {};
					log_lists($(".collapsibleAreaRegion:contains('Fields')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "fields");
			}
			
			if($(".collapsibleAreaRegion:contains('Properties')").length){
					member.params.properties = {};
					log_lists($(".collapsibleAreaRegion:contains('Properties')").next("div[id*='RBSection']").attr('id').split("RB")[0].split("ID")[1], $, member, "properties");
			}			

			
		}
		else if(isClass && $('#enumerationSection').length){
		
			member.params.members = {};
			log_lists(2, $, member, "members");
		
		}
		
		
		if($("h4:contains('Parameters')").length){
		
			member.params.arguments = {};
		
			$("h4:contains('Parameters')").next('dl').find('dt').each(function() {
			
					var type = "";
					if($(this).next('dd').children().length) {
					
						$(this).next('dd').find('script').remove();
						type += $(this).next('dd').children().text();
					
					}
					else {
					
						type += $(this).next('dd').children('span').text();
					
					}
								
				$(this).next('dd').find('a').remove(); //narrows down the content to just the description text
				var descr_text = $(this).next('dd').html();
				descr_text = descr_text.split("<br>")[1];
			
				member.params.arguments[$(this).children('.parameter').text()] = {"type": type, "description": descr_text};

			});
			
		}
		
		if($("h4:contains('Return Value')").length) {
				
			member.params.return_val = {};
			$('#ID1RBSection').find('script').remove();
			var stuff = $('#ID1RBSection').html().split("Type:");

			stuff = stuff[stuff.length - 1];
			
			stuff = stuff.split("<br>")[0];
			stuff = "<html><body>" + stuff + "</body></html>";
			
			member.params.return_val["type"] = $(stuff).text();
			
			var split = $('#ID1RBSection').html().split("<br>");
			
			split = split[split.length - 1];
			
			split = "<html><body>" + split + "</body></html>";
			
			
			member.params.return_val["description"] = $(split).text();


		}
		
		
		if($("h4:contains('Field Value')").length) {
		
						
			var field_val = "";
			
			$("h4:contains('Field Value')").nextUntil('div', ":not('script')").each(function() {

					field_val += $(this).text();
			
				
			});
			
			member.params.type = field_val;
		}
		
		
		if($("h4:contains('Property Value')").length || $('h4').filter(function() {return $(this).text() == 'Value';})) {
		
			$('#ID1RBSection').find('script').remove();
			member.params.type = $('#ID1RBSection').text().split("Type:")[1];
		
		}
		
		if($("h4:contains('Reference')").length){
		
			member.params.references = {};
			
			$("h4:contains('Reference')").parent().children('div').each(function() {
			
				member.params.references[$(this).children('a').attr('href')] = $(this).children('a').text();
			
			});
		
		}
	
	}
	
	grunt.registerTask('cash_stache', "inserts HTML data into the JSON object", function() {
	
		grunt.task.requires('convert');
	
		var dir = grunt.config.get('cash_stache.dir');
		var htmldir = grunt.config.get('cash_stache.html_dir');
	
		var t = grunt.file.readJSON(dir + "/" + grunt.config.get('cash_stache.dest'));

		var $;
		
		read_files(t);
		grunt.file.write(grunt.config.get('cash_stache.dir') + "/" + grunt.config.get('cash_stache.dest'), JSON.stringify(t));

	});
	
	grunt.loadNpmTasks('grunt-convert');

	grunt.registerTask('default', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', ['convert', 'cash_stache']);

};