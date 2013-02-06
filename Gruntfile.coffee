# global module:false
module.exports = ->

  # Project configuration.
  @initConfig
    pkg: @file.readJSON 'package.json'

    mocha:
      all:
        src: ['test/**/*.html']
        options:
          run: true

    uglify:
      options:
        banner:'/*!\n' +
          ' * <%= pkg.name %>.js v<%= pkg.version %>\n' +
          ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
          ' * <%= pkg.name %>.js may be distributed under the <%= pkg.license %> licence\n' +
          ' */\n'
      dist:
        files:
            'lib/<%= pkg.name %>.min.js': ['lib/<%= pkg.name %>.js']

    jshint:
      all: ['lib/<%= pkg.name %>.js', 'test/spec/**/*.js']
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
  @registerTask 'min', 'uglify'

  # Default task.
  @registerTask 'default', ['jshint', 'test', 'min']

  @loadNpmTasks 'grunt-mocha'
  @loadNpmTasks 'grunt-contrib-jshint'
  @loadNpmTasks 'grunt-contrib-uglify'
