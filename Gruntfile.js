var html_file = require('fs');
var cheerio = require('cheerio');
var r_url;

module.exports = function(grunt) {

	grunt.config.merge({
		stache_castle: {
			src: ['test/WebTOC.xml'],
			dest: 'test/WebTOC.json',
        	dir: 'test/html/'
		}
	});

	grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-convert');
    grunt.registerTask('default', 'stache_castle');

};
