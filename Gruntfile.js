var timer = require("grunt-timer"); // used to report exact timings of individual tasks
module.exports = function (grunt) {

    timer.init(grunt);

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: ['bower_components/angular-rx/dist/rx.angular.js', 'bower_components/angular-order-object-by/src/ng-order-object-by.js', 'src/osel-search-module.js', 'src/directives/osel-search-directive.js'],
                dest: 'dist/osel-search.js',
                nonull: true
            }
        },

        less: {
            dist: {
                files: {
                    'dist/osel-search.css': 'src/styles/**/*.less'
                }
            }
        },

        ngtemplates: {
            dist: {
                cwd: 'src',
                src: 'templates/**/*.html',
                dest: 'dist/<%= pkg.name %>-templates.js',
                options: {
                    module: 'osel-search'
                }
            }
        },

        concurrent: {
            dev: {
                tasks: ['watch:js', 'watch:less', 'watch:templates'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        watch: {
            js: {
                files: ['src/**/*.js'],
                tasks: ['jshint:all', 'concat:dist', 'uglify:dist']
            },
            less: {
                files: ['src/styles/**/*.less'],
                tasks: ['less:dist']
            },
            templates: {
                files: ['src/templates/**/*.html'],
                tasks: ['ngtemplates:dist']
            }
        },

        jshint: {
            all: ['src/**/*.js']
        },

        uglify: {
            dist: {
                files: {
                    'dist/osel-search.min.js': ['dist/osel-search.js']
                }
            }
        }
    });

    grunt.registerTask('default', function () {
        grunt.log.writeln('grunt dist to package code for a release');
        grunt.log.writeln('grunt dev to watch src then rebuild js/css/templates automatically');
    });



    grunt.registerTask('dist', ['jshint:all', 'concat:dist', 'uglify:dist', 'ngtemplates:dist', 'less:dist']);

    grunt.registerTask('dev', ['dist', 'concurrent:dev']);

    grunt.registerTask('test', function () {
        grunt.log.writeln('no tests written yet!');
    });

    return grunt;
};