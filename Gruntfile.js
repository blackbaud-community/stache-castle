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
			dest: 'dest.json',
		
		},


	});
	
	/*******************************************************************************************
	*
	* Convenience Functions
	*
	********************************************************************************************/
	function log_lists(tableIndex, $, member, choice) {
	
		if(choice != "members"){
			$("#ID" + tableIndex + "RBSection table").find('tr[data]').each(function() {
			
				var key = $(this).find('td a').text();
				member.params[choice][key] =  {"link": $(this).find('td a').attr('href'), "description": $(this).find('td div').text()};

				var visibility = $(this).attr('data');
				var visibility = visibility.split(";");
				
				for (type of visibility) {
				
					if(type != "")
						member.params[choice][key][type] = "";
				}
				
			});
		}
		else {
		
			$("#ID" + tableIndex + "RBSection table").find('tr').first().remove();
			$("#ID" + tableIndex + "RBSection table").find('tr').each(function() {
			
				$(this).find('td').first().remove();
				member.params[choice][$(this).find('td').first().text()] = {"value": $(this).find('td').first().next().text(), "description": $(this).find('td').last().text()};
				
			
			
			});
		
		}
	
	}
	
	function process_html(member, index, json, $) {	
			
		var isClass = false;
		var isNameSpace = false;
		member.params = {};
		
		if(member.name.indexOf("T_") == 0)
			isClass = true;
		else if(member.name.indexOf("N_") == 0)
			isNameSpace = true;
		
		//change later, just for testing
		if(isClass){
		
			member.params.inheritance = {};
			$('#ID0RBSection').find('a').each(function() {
			
				$(this).find('script').remove();
				member.params.inheritance[$(this).attr('href')] =  $(this).text();
				
				if($(this).next('br').next('span').length != 0) {
				
					$(this).next('br').next('span').first().find('script').remove();
					member.params.inheritance['#'] = $(this).next('br').next('span').first().text();
				
				}
			});

		}
		
		member.params.namespace = {};
		
		member.params.namespace[$("strong:contains('Namespace:')").next("a").attr('href')] = $("strong:contains('Namespace:')").next("a").text();
							
		member.params.assembly = $('.topicContent').text().split("Assembly:")[1].split("Syntax")[0];
		
		member.params.syntax = {};
		
		//gets all content in the Syntax block.
		$('.codeSnippetContainerCode').each(function() {

			var pos = $(this).attr('id').charAt($(this).attr('id').length - 1);
			
			
			member.params.syntax[$("div[id*='_tab" + pos + "']").text()] = $(this).find('pre').text().trim();
			

		});
		

				
		//sentence below syntax box
		if(isClass && $('#enumerationSection').length == 0)
			member.params.lower_syntax_text = $('#ID2RBSection').next('p').text();
		
		if(isClass && $('#enumerationSection').length == 0){
			//adds constructor data for all constructors
			member.params.constructors = {};
			log_lists(3, $, member, "constructors");
					
			member.params.methods = {};
			log_lists(4, $, member, "methods");
								
			var property = false;
			for(var k = 0; k < 2; k++) {
			
				if($("div span[onclick*='ID" + (5 + k) + "RB']").text() == "Properties" && !property){
					member.params.properties = {};
					property = true;
					log_lists(5 + k, $, member, "properties");
				}
				else{
					member.params.fields = {};
					log_lists(5 + k, $, member, "fields");
				}
				
				if(property)
					k++;		
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
		
		if($("h4:contains('Property Value')").length) {
		
			member.params.type = $('#ID1RBSection').text().split("Type:")[1];
		
		}
		
		json.doc.members.member[index] = member;
		return json;
	
	}
	
	grunt.registerTask('cash_stache', "inserts HTML data into the JSON object", function() {
	
		grunt.task.requires('convert');
	
		var dir = grunt.config.get('cash_stache.dir');
	
		var t = grunt.file.readJSON(dir + "/" + grunt.config.get('cash_stache.dest'));
		var $;
		
		
		t.doc.members.member.forEach(function(val, ind, arr) {
		
			if(val.name.indexOf('(') != -1)
				val.name = val.name.slice(0, val.name.indexOf('(')); //remove parameters from title to better find HTML file
			console.log("Title: " + val.name);
			val.name = val.name.replace(/[.:]/gi, "_");
				
			if(grunt.file.exists(dir + '/html/' + val.name + '.htm')){
				$ = cheerio.load(html_file.readFileSync(dir + '/html/' + val.name + '.htm'));
			}
			else {
			
				grunt.file.write(grunt.config.get('cash_stache.dir') + "/" + grunt.config.get('cash_stache.dest'), JSON.stringify(t));
				grunt.log.error("File Does Not Exist! --> " + val.name);
			
			}
			
			t = process_html(val, ind, t, $);

		});

	});
	
	grunt.loadNpmTasks('grunt-convert');

	grunt.registerTask('default', 'Converting HTML/XML Sandcastle product into JSON files to be used in \'Stache', ['convert', 'cash_stache']);

};