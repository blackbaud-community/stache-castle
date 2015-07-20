/*jslint node: true, nomen: true, plusplus: true */
'use strict';

module.exports = function(grunt) {

  var cheerio = require('cheerio');

  // Load the grunt-convert task
  grunt.task.loadNpmTasks('grunt-convert');

  // Config the convert task
  grunt.config.init({
    stacheCastle: {
      sandcastleOutput: 'sandcastle-output-blue/',
      sandcastleHtml: '<%= stacheCastle.sandcastleOutput %>html/',
      jsonConverted: 'converted.json',
      jsonMerged: 'converted_merged.json',
      collapsibleRegions: [
        'namespaces',
        'classes',
        'methods',
        'properties'
      ]
    },
    convert: {
      options: {
        explicitArray: false,
        type: '.xml' // Necessary since grunt-convert's extension case-sensitive
      },
      xml2json: {
        src: ['<%= stacheCastle.sandcastleOutput %>Blueshirt.Core.XML'],
        dest: '<%= stacheCastle.jsonConverted %>'
      }
    }
  });

  // Register our default task
  grunt.task.registerTask('default', [
    'convert',
    'parse'
  ]);

  // Register our parse task
  grunt.task.registerTask('parse', 'Combines HTML into JSON', function () {

    // Read our JSON file and parse what Sandcastle calls "members"
    var json = grunt.file.readJSON(grunt.config.get('convert.xml2json.dest'));
    json.doc.members.member.forEach(function (v, i, a) {

      // See if a file exists for this entry
      var key = nameToKey(v.name);
      var filename = key + '.htm';
      var filenameWithLocation = grunt.config.get('stacheCastle.sandcastleHtml') + filename;
      if (grunt.file.exists(filenameWithLocation)) {

        // Load the files contents into cheerio
        var $ = cheerio.load(grunt.file.read(filenameWithLocation));

        // Store the filename so internal links will continue to work when rendered
        v.key = key;
        v.filename = filename;

        // TODO: Inheritance
        // TODO: References

        // Grab the title
        v.title = $('title').text();

        // Summary already exists but we can use this opportunity to clean it
        v.summary = cleanText($('.summary').eq(0).text());

        // Grab the syntax
        v.syntax = [];
        $('.codeSnippetContainerTab').each(function (k) {
          v.syntax.push({
            type: $(this).children('a').text(),
            code: $('.codeSnippetContainerCode').eq(k).children('pre').html()
          });
        });

        // Namespaces, Classes, Methods, Properties
        $('.collapsibleAreaRegion').each(function () {
          var section = $(this),
            key = cleanText(section.find('.collapsibleRegionTitle').text().toLowerCase()),
            id = section.next('.collapsibleSection').attr('id');

          if (grunt.config.get('stacheCastle.collapsibleRegions').indexOf(key) > -1) {
            v[key] = objectFromTable($, '#' + id + ' table.members tr');
          }
        });

      // Log the files we weren't able to locate
      } else {
        grunt.log.warn('Not Found: ' + filenameWithLocation);
        grunt.log.warn('(' + v.name + ')');
        grunt.log.writeln('');
      }
    });

    // Write our JSON to file in the pretty print format
    grunt.file.write(grunt.config.get('stacheCastle.jsonMerged'), JSON.stringify(json, null, '\t'));
  });

  /**
  * Converts Sandcastle name to it's equivalent filename
  * @method nameToKey
  * @param {String} name Name to convert
  * @returns {String} Converted filename
  **/
  function nameToKey (name) {
    var r = name.replace(/[:.]/g, '_');
    var parenthesis = r.indexOf('(');
    if (parenthesis > -1) {
      r = r.substring(0, parenthesis);
    }
    return r;
  }

  /**
  * Cleans a string of text replacing extra spacing and linebreaks.
  *
  * @method cleanText
  * @param {String} str Text to clean.
  * @returns {String} Cleaned text
  **/
  function cleanText(str) {
    str = str || '';
    return str.replace(/(\r\n|\n|\r)/gm,'').replace(/\s+/g, ' ').trim();
  }

  /**
  * Parses the Sandcastle styled table into an object.
  *
  * @method objectFromTable
  * @param {Object} $ Cheerio reference
  * @param {String} selector Selector to find the applicable rows
  * @returns {Object} Generated object
  **/
  function objectFromTable($, selector) {

    var trs = $(selector),
      a = [];

    // Assumes the first tr is a header
    trs.not(trs.first()).each(function () {
      var tr = $(this),
        tds = tr.children('td'),
        images = tds.eq(0).find('img'),
        anchor = tds.eq(1).find('a'),
        data = tr.attr('data') || '',
        props = [],
        icons = [];

      data.split(';').forEach(function (v) {
        if (v && v !== '') {
          props.push(v);
        }
      })

      images.each(function () {
        icons.push($(this).attr('src'));
      });

      a.push({
        icons: icons,
        name: anchor.text(),
        link: anchor.attr('href'),
        properties: props,
        description: cleanText(tds.eq(2).text())
      });
    });

    return a;
  }

};
