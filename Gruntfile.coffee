# global module:false
module.exports = ->

  # Project configuration.
  @initConfig
    meta:
      version: '0.0.1'
      banner: '/*! backbone.fileuploader - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* https://github.com/peterjmit/backbone.fileuploader\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Peter Mitchell <peterjmit@gmail.com>; Licensed MIT */'

    watch:
      files: '<config:lint.files>'
      tasks: 'lint'
      test:
        files: ['index.html', 'lib/**/*.js', 'test/spec/**/*.js', 'test/**/*.html']
        tasks: 'mocha'

    mocha:
      all:
        src: ['test/**/*.html']
        options:
          run: true

    min:
      dist:
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/upload.js>']
        dest: 'lib/upload.min.js'

    jshint:
      all: ['lib/**/*.js', 'test/spec/**/*.js']
      options:
        globals:
          describe: true
          global: true
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
        eqnull: true
        browser: true



    # uglify:


  # Alias 'test' to 'mocha' so you can run `grunt test`
  @registerTask 'test', 'mocha'

  # Default task.
  @registerTask 'default', ['jshint', 'test', 'min']

  @loadNpmTasks 'grunt-mocha'
  @loadNpmTasks 'grunt-contrib-jshint'
