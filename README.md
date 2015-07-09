# stache-castle
Grunt task for converting Sandcastle Documentation to Stache (JSON + markdown)

### Instructions

- the task is a default so all you have to do is run grunt.
- Go into the grunt task (Gruntfile.js) and edit some config options for convert
  - Set the src and dest properties to be the source XML file and the destination JSON
  - NOTE: these files should exist before running, the task will not create the files for you
- Go into the grunt task (Gruntfile.js) and edit some config options for cash_stache
  - Set the directory where your XML filesand html folder will be.
  - Set the name of the folder your html files will be in, default is 'html'
  - Set the destination JSON file.
  - Set whether or not the Url's are included in the XML
  - Set the name of the attribute that contains the Url
  - NOTE: these files should exist before running, the task will not create the files for you.
