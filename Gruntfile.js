/* jshint node: true */
var timer = require("grunt-timer");
module.exports = function (grunt) {

    timer.init(grunt);

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            dist: {
                files: {
                    'dist/os-search.css': 'src/styles/**/*.less'
                }
            }
        },

        ngtemplates: {
            dist: {
                cwd: 'src',
                src: 'templates/**/*.html',
                dest: 'dist/<%= pkg.name %>-templates.js',
                options: {
                    module: 'os-search',
                    bootstrap: function (module, script) {
                        return 'define(["angular"], function(angular) {\n' +
                            'angular.module("' + module + '").run(["$templateCache", function($templateCache) {\n' +
                            script +
                            '}]);\n' +
                            '});';
                    }
                }
            }
        },

        requirejs: {
            options: {
                baseUrl: 'src',
                name: 'os-search',
                exclude: ['angular'],
                mainConfigFile: 'src/requirejs-main.js',
                insertRequire: ['os-search']
            },
            'dist-min': {
                options: {
                    out: 'dist/<%= pkg.name %>.min.js'
                }
            },
            dist: {
                options: {
                    out: 'dist/<%= pkg.name %>.js',
                    optimize: 'none'
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
                tasks: ['requirejs:dist', 'requirejs:dist-min']
            },
            less: {
                files: ['src/styles/**/*.less'],
                tasks: ['less:dist']
            },
            templates: {
                files: ['src/templates/**/*.html'],
                tasks: ['ngtemplates:dist']
            }
        }
    });

    grunt.registerTask('default', function () {
        grunt.log.writeln('check Gruntfile.js for tasks to run');
    });

    grunt.registerTask('dist', ['requirejs:dist', 'requirejs:dist-min', 'ngtemplates:dist', 'less:dist']);

    grunt.registerTask('dev', ['dist', 'concurrent:dev']);

    grunt.registerTask('test', function () {
        grunt.log.writeln('Tests coming soon!');
    });

    return grunt;
};