/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! upload.js - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://peterjmit/upload.js\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Peter Mitchell; Licensed MIT */'
    },
    options: {
      testFiles: [
        'lib/**/*.js'
      ]
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js']
    },
    test: {
      files: ['test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint',
      test: {
        files: [ 'js/**/*.js', 'test/spec/**/*.js' ],
        tasks: 'mocha'
      }
    },
    mocha: {
      // index: ['test/test.html'],
      all: [ 'test/**/*.html' ],
      run: true
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:lib/upload.js>'],
        dest: 'dist/upload.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/upload.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {}
  });


  // Alias 'test' to 'mocha' so you can run `grunt test`
  grunt.registerTask('test', 'mocha');

  // Default task.
  grunt.registerTask('default', 'lint mocha concat min');

  grunt.loadNpmTasks('grunt-mocha');
};
