/**
 * This grunt tasks converts multiple files to JSON via jsdoc2md.
 */
module.exports = function (grunt) {
    'use strict';

    var cheerio = require('cheerio'),
        defaults = {
            sandcastleOutput: 'sandcastle-output/',
            sandcastleHtml: '<%= stache_castle.sandcastleOutput %>html/',
            src: '<%= stache_castle.sandcastleOutput %>WebTOC.xml',
            dest: '<%= stache_castle.sandcastleOutput %>WebTOC.json',
            iconPath: '/assets/img/icons/',
            collapsibleRegions: [
                'namespaces',
                'classes',
                'methods',
                'enumerations',
                'fields',
                'properties'
            ],
            convert: {
                options: {
                    explicitArray: false,
                    type: '.xml' // Necessary since grunt-convert's extension case-sensitive
                },
                xml2json: {
                    src: ['<%= stache_castle.src %>'],
                    dest: '<%= stache_castle.dest %>'
                }
            },
            copy: {
                'stache_castle': {
                    files: [
                        {
                            expand: true,
                            src: ['<%= stache_castle.sandcastleOutput %>icons/*'],
                            dest: '<%= stache_castle.icons %>'
                        }
                    ]
                }
            }
        };

    /**
     * Grabs the applicable config options from stache-castle and passes them to convert task.
     * Queue's up the convert and stache-castle-post callback tasks.
     */
    grunt.task.registerTask(
        'stache_castle',
        'Convert SandCastle to Blackbaud Stache',
        function () {

            // Seems like there's a better way to handle this
            var overrides = grunt.config.get('stache_castle');
            grunt.config.set('stache_castle', this.options(defaults));
            grunt.config.set('convert', grunt.config.get('stache_castle.convert'));
            grunt.config.merge({
                'stache_castle': overrides
            });

            grunt.task.run([
                'convert',
                'stache-castle-post'
            ]);
        }
    );

    /**
     * The meat of our task.
     */
    grunt.task.registerTask('stache-castle-post', function () {

        // Read our JSON file and parse what Sandcastle calls "members"
        var json = grunt.file.readJSON(grunt.config.get('convert.xml2json.dest'));
        json.HelpTOC.HelpTOCNode.forEach(function (v) {
            parseJsonNode(v);
        });

        // Write our JSON to file in the pretty print format
        grunt.file.write(grunt.config.get('stache_castle.dest'), JSON.stringify(json, null, 2));

        // See if we need to copy the icons
        if (grunt.config.get('stache_castle.icons')) {
            grunt.config.set('copy', grunt.config.get('stache_castle.copy'));
            grunt.task.run('copy:stache_castle');
        }
    });

    /**
    * Recursively find URLs or HelpTOCNodes
    **/
    function parseJsonNode(v) {

        var strongTitles = grunt.config.get('stache_castle.strongTitles'),
            filenameWithLocation,
            $;

        // Verify Url property
        if (v.Url) {

            // See if a file exists for this entry
            filenameWithLocation = grunt.config.get('stache_castle.sandcastleOutput') + v.Url;
            if (grunt.file.exists(filenameWithLocation)) {

                grunt.log.writeln('Converting ' + filenameWithLocation);

                // Load the files contents into cheerio
                $ = cheerio.load(grunt.file.read(filenameWithLocation));

                // Grab the title
                v.title = $('title').text();

                // Summary already exists but we can use this opportunity to clean it
                v.summary = cleanText($('.summary').eq(0).text());

                // TODO: Inheritance

                // References - Cheating as this is also the current items parents
                v.hierarchy = [];
                $('.seeAlsoStyle a').each(function (idx, el) {
                    var $el = $(el);
                    v.hierarchy.push({
                        'Title': $el.text(),
                        'Url': $el.attr('href')
                    });
                });

                // Namespace, Assembly
                $('strong').each(function (idx, el) {
                    var $el = $(el),
                        $next;

                    switch ($el.text()) {
                        case 'Namespace:':
                            $next = $el.next();
                            v.namespace = {
                                'Title': $next.text(),
                                'Url': $next.attr('href')
                            };
                        break;
                        case 'Assembly:':
                            v.assembly = $el[0].next.data;
                        break;
                    }
                });

                // Grab the syntax
                v.syntax = [];
                $('.codeSnippetContainerTab').each(function (k) {
                    v.syntax.push({
                        type: $(this).children('a').text(),
                        code: $('.codeSnippetContainerCode').eq(k).children('pre').html()
                    });
                });

                // Field type if it exists
                $('h4.subHeading').each(function (idx, el) {
                    var $el = $(el),
                        $next,
                        $dts,
                        $dds;

                    switch ($el.text()) {
                        case 'Field Value':
                            $next = $el.next('a');
                            v.type = {
                                name: $next.text(),
                                href: $next.attr('href')
                            };
                        break;
                        case 'Return Value':
                            $next = $el.next('a');
                            v.return = {
                                name: $next.text(),
                                href: $next.attr('href')
                            };
                        break;
                        case 'Parameters':
                            $next = $el.next('dl');
                            $dts = $next.children('dt');
                            $dds = $next.children('dd');
                            v.params = [];
                            $dds.each(function (idx, p) {
                                var $p = $(p),
                                    $html = $p.html(),
                                    $a = $p.find('a'),
                                    $name = $a.text();

                                v.params.push({
                                    name: $dts.eq(idx).text(),
                                    description: $($html.substr($html.indexOf('<br>'))).text(),
                                    type: {
                                        name: $name.substr($name.indexOf(';') + 1),
                                        href: $a.attr('href')
                                    }
                                });
                            });
                        break;
                    }
                });

                // Namespaces, Classes, Methods, Enumerations, Properties
                $('.collapsibleAreaRegion').each(function () {
                    var section = $(this),
                    key = cleanText(section.find('.collapsibleRegionTitle').text().toLowerCase()),
                    id = section.next('.collapsibleSection').attr('id');

                    if (grunt.config.get('stache_castle.collapsibleRegions').indexOf(key) > -1) {
                        v[key] = objectFromTable($, '#' + id + ' table.members tr');
                    }
                });

            // Log the files we weren't able to locate
            } else {
                grunt.log.warn('Not Found: ' + filenameWithLocation);
                grunt.log.warn('(' + v.name + ')');
                grunt.log.writeln('');
            }
        }

        switch (grunt.util.kindOf(v.HelpTOCNode)) {
            case 'array':
                v.HelpTOCNode.forEach(function (x) {
                    parseJsonNode(x);
                });
            break;
            case 'object':
                parseJsonNode(v.HelpTOCNode);
            break;
        }

    }

    /**
    * Converts Sandcastle name to it's equivalent filename
    * @method nameToKey
    * @param {String} name Name to convert
    * @returns {String} Converted filename
    **/
    function nameToKey(name) {
        var r = name.replace(/[:.]/g, '_'),
            parenthesis = r.indexOf('(');
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
        return str.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ').trim();
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
            iconPath = grunt.config.get('stache_castle.iconPath'),
            a = [];

        // Assumes the first tr is a header
        // Namespace table doesn't have images td
        trs.not(trs.first()).each(function () {
            var tr = $(this),
            tds = tr.children('td'),
            images = tds.eq(0).find('img'),
            anchor = tds.eq(tds.length === 2 ? 0 : 1).find('a'),
            data = tr.attr('data') || '',
            props = [],
            icons = [];

            data.split(';').forEach(function (v) {
                if (v && v !== '') {
                    props.push(v);
                }
            });

            images.each(function () {
                var src = $(this).attr('src');
                if (iconPath !== '') {
                    src = src.replace('../icons/', iconPath);
                }
                icons.push(src);
            });

            a.push({
                icons: icons,
                name: anchor.text(),
                link: anchor.attr('href'),
                properties: props,
                description: cleanText(tds.eq(tds.length === 2 ? 1 : 2).text())
            });
        });

        return a;
    }

    // Load the grunt-convert task
    grunt.task.loadNpmTasks('grunt-convert');

};
