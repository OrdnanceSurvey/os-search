/* jshint node: true */
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            'dist-minified': {
                options: {
                    name: 'src/os-search',
                    out: 'dist/<%= pkg.name %>.min.js',
                    exclude: ['angular'],
                    paths: {
                        angular: 'bower_components/angular/angular'
                    }
                }
            },
            'dist-unminified': {
                options: {
                    baseUrl: 'src',
                    name: 'os-search',
                    out: 'dist/<%= pkg.name %>.js',
                    exclude: ['angular'],
                    paths: {
                        angular: '../bower_components/angular/angular'
                    },
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