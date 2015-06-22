/* jshint node: true */
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            options: {
                baseUrl: 'src',
                name: 'os-search',
                exclude: ['angular'],
                mainConfigFile: 'src/requirejs-main.js',
                stubModules : ['text'],
                insertRequire: ['os-search']
            },
            'dist-minified': {
                options: {
                    out: 'dist/<%= pkg.name %>.min.js',
                }
            },
            'dist-unminified': {
                options: {
                    out: 'dist/<%= pkg.name %>.js',
                    optimize: 'none'
                }
            }
        },
        watch: {
            all: {
                files: ['src/**/*'],
                tasks: ['dist']
            }
        }
    });

    grunt.registerTask('default', function() {
        grunt.log.writeln('check Gruntfile.js for tasks to run');
    });

    grunt.registerTask('dist', ['requirejs:dist-unminified', 'requirejs:dist-minified']);

    grunt.registerTask('test', function() {
        grunt.log.writeln('Tests coming soon!');
    });

    return grunt;
};