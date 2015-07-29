
module.exports = function(grunt) {

	grunt.config.init({
		stache_castle: {
			options: {
        		sandcastleOutput: 'test/'
			}
		}
	});

	grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-convert');
    grunt.registerTask('default', 'stache_castle');

};
