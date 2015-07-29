
module.exports = function(grunt) {

	grunt.config.init({
		stache_castle: {
			options: {
				src: 'WebTOC.xml',
				dest: 'WebTOC.json',
	        	dir: 'test/',
				html_dir: 'test/html/'
			}
		}
	});

	grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-convert');
    grunt.registerTask('default', 'stache_castle');

};
