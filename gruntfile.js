/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function(grunt) {

  grunt.config.init({
    convert: {
      options: {
        explicitArray: false,
        type: '.xml' // Necessary since grunt-convert is extension case-sensitive
      },
      xml2json: {
        src: ['sandcastle-output/Blueshirt.Core.XML'],
        dest: 'converted.json'
      }
    }
  });

  grunt.task.loadNpmTasks('grunt-convert');

};
