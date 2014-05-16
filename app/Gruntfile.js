'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var appConfig = {
        app: 'app',
        dist: 'dist',
        tmp: '.tmp'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        appConfig: appConfig,
		env: {
			dev: {
				NODE_ENV: 'development'
			},
			dist: {
				NODE_ENV: 'production'
			}
		},
        watch: {
			html: {
				files: ['<%= appConfig.app %>/**/*.html'],
				tasks: ['env:dev', 'preprocess:dev']
			},
            compass: {
                files: ['<%= appConfig.app %>/styles/**/*.{scss,sass}'],
                tasks: ['compass:server']
            },
            styles: {
                files: ['<%= appConfig.app %>/styles/**/*.css'],
                tasks: ['copy:styles']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '.tmp/styles/**/*.css',
                    '.tmp/**/*.html',
                    '!.tmp/bower_components/**/*.html',
                    '{.tmp,<%= appConfig.app %>}/scripts/**/*.js',
                    '<%= appConfig.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
		preprocess: {
            options: {
                context: {}
            },
			dev: {
				files: [
					{
						expand: true,
						cwd: '<%= appConfig.app %>/',
						src: [
                            '**/*.html',
							'!scripts/**/*.html'
                        ],
						dest: '<%= appConfig.tmp %>/'
					}
				]
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= appConfig.app %>/',
						src: [
                            '**/*.html',
							'!scripts/**/*.html'
                        ],
						dest: '<%= appConfig.tmp %>/'
					}
				]
			}
		},
        'string-replace': {
            onerequirejsfile: {
				files: [
					{
						expand: true,
						cwd: '<%= appConfig.dist %>/',
						src: [
                            '**/*.html',
							'!scripts/**/*.html'
                        ],
						dest: '<%= appConfig.dist %>/'
					}
				],
                options: {
                    replacements: [
                        {
                            pattern: /<script\s+data-main=(?:"|')(.*?)(?:"|')\s+src=(?:"|')(.*?)(?:"|')><\/script>/ig,
                            replacement: '<script src="$1.js"></script>'
                        }
                    ]
                }
            }
        },
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, appConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= appConfig.dist %>/*',
                        '!<%= appConfig.dist %>/.git*'
                    ]
                }]
            },
            requirejsonefile: {
                src: '<%= appConfig.dist %>/bower_components/requirejs'
            },
            emptyfolders: {
                src: '<%= appConfig.dist %>/*',
                filter: function(filepath) {
                    return (grunt.file.isDir(filepath) && require('fs').readdirSync(filepath).length === 0);
                }
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= appConfig.app %>/scripts/**/*.{js,json}',
                '!<%= appConfig.app %>/scripts/vendor/**/*',
                '!<%= appConfig.app %>/scripts/data/*'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= appConfig.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= appConfig.app %>/images',
                javascriptsDir: '<%= appConfig.app %>/scripts',
                fontsDir: '<%= appConfig.app %>/styles/fonts',
                importPath: '<%= appConfig.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= appConfig.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    debugInfo: false
                }
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: '.tmp/scripts',
                    optimize: 'none',
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                    paths: {
                        'requireLib': '../bower_components/requirejs/require'
                    },
                    include: ['requireLib']
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= appConfig.dist %>/scripts/**/*.js',
                        '<%= appConfig.dist %>/styles/**/*.css',
                        '<%= appConfig.dist %>/images/**/*.{png,jpg,jpeg,gif,webp}',
                        '<%= appConfig.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= appConfig.dist %>'
            },
            html: '<%= appConfig.tmp %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= appConfig.dist %>']
            },
            html: ['<%= appConfig.dist %>/**/*.html'],
            css: ['<%= appConfig.dist %>/styles/**/*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.app %>/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= appConfig.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.app %>/images',
                    src: '**/*.svg',
                    dest: '<%= appConfig.dist %>/images'
                }]
            }
        },
        cssmin: {
            // This task is pre-configured if you do not wish to use Usemin
            // blocks for your CSS. By default, the Usemin block from your
            // `index.html` will take care of minification, e.g.
            //
            //     <!-- build:css({.tmp,app}) styles/main.css -->
            //
            // dist: {
            //     files: {
            //         '<%= appConfig.dist %>/styles/main.css': [
            //             '.tmp/styles/**/*.css',
            //             '<%= appConfig.app %>/styles/**/*.css'
            //         ]
            //     }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.tmp %>',
                    src: '*.html',
                    dest: '<%= appConfig.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            tmp: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.app %>',
                    dest: '.tmp',
                    src: ['bower_components/**']
                },{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.app %>',
                    dest: '.tmp',
                    src: ['scripts/templates/**/*']
                },{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.app %>/scripts/',
                    dest: '.tmp/scripts/',
                    src: ['**/*.js', '**/*.json']
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.app %>',
                    dest: '<%= appConfig.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/**/*.{webp,gif}',
                        'styles/fonts/*',
                        'assets/**/*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= appConfig.app %>/styles',
                dest: '.tmp/styles/',
                src: '**/*.css'
            }
        },
        concurrent: {
            server: [
                'preprocess:dev',
                'compass:server',
                'copy:styles'
            ],
            dist: [
                'compass:dist',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        compress: {
            dist: {
                options: {
                    archive: 'dist-zips/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {
                        cwd: 'dist/',
                        src: ['**'],
                        dest: '',
                        expand: true
                    }
                ]
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'env:dev',
            'concurrent:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'env:dist',
        'preprocess:dist',
        'useminPrepare',
        'copy:tmp',
        'concurrent:dist',
        'requirejs',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'rev',
        'usemin',
        'string-replace:onerequirejsfile',
        'clean:requirejsonefile',
        'clean:emptyfolders',
        'compress:dist'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
