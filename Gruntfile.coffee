# global module:false
module.exports = ->

  # Project configuration.
  @initConfig
    meta:
      version: '0.0.1'
      banner: '/*! upload.js - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://peterjmit/upload.js\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Peter Mitchell; Licensed MIT */'

    lint:
      files: ['grunt.js', 'lib/**/*.js']

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


    concat:
      dist:
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/upload.js>']
        dest: 'dist/upload.js'


    min:
      dist:
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>']
        dest: 'dist/upload.min.js'


    jshint:
      options:
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

      # globals:


    # uglify:


  # Alias 'test' to 'mocha' so you can run `grunt test`
  @registerTask 'test', 'mocha'

  # Default task.
  @registerTask 'default', ['lint', 'mocha', 'concat', 'min']

  @loadNpmTasks 'grunt-mocha'
