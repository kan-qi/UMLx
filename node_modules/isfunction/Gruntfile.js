module.exports = function(grunt) {

	//////////////////
	// config vars  //
	//////////////////
	var docsTmplDir = 'docs-tmpl',
		filesDocsTmpl = docsTmplDir + '/**/*.tmpl',
		filesTest = ['test/**/*.test.js'],
		// filesLib = ['index.js', 'lib/**/*.js'],
		filesLib = ['lib/**/*.js'],
		// files: ['!node_modules/**/*.js', '**/*.js', '**/*.html']
		filesTestLib = filesTest.concat(filesLib),
		filesWatch = filesTestLib.concat(['test/index.html', 'Gruntfile.js', filesDocsTmpl]),
		tasksBuild = ['yuidoc', 'readme'],
		tasksDev = ["connect", "watch"],
		tasksTest = ["connect", "saucelabs-mocha"],
		tasksWatch = tasksBuild.concat(['jshint']),
		browsers = [{
			// 	browserName: 'internet explorer',
			// 	platform: 'XP',
			// 	version: '8'
			// }, {
			// 	browserName: 'internet explorer',
			// 	platform: 'XP',
			// 	version: '7'
			// }, {
				browserName: 'internet explorer',
				platform: 'WIN8',
				version: '10'
			}, {
				browserName: 'internet explorer',
				platform: 'VISTA',
				version: '9'
			}, {
				browserName: 'firefox',
				version: '23',
				platform: 'WIN7'
			}, {
				browserName: 'firefox',
				version: '19',
				platform: 'WIN7'
			}, {
				browserName: 'firefox',
				version: '19',
				platform: 'XP'
			}, {
				browserName: 'chrome',
				platform: 'XP'
			}, {
				browserName: 'firefox',
				platform: 'linux',
				version: '23'
			}, {
				browserName: 'chrome',
				platform: 'linux'
			}, {
				browserName: 'IPAD',
				platform: 'OS X 10.6',
				version: '5.0'
			}, {
				browserName: 'SAFARI',
				platform: 'OS X 10.6',
				version: '5'
			}, {
				browserName: 'chrome',
				platform: 'OS X 10.6',
			}, {
				browserName: 'IPAD',
				platform: 'OS X 10.8',
				version: '6'
			}, {
				browserName: 'IPHONE',
				platform: 'OS X 10.6',
				version: '5.0'
			}, {
				browserName: 'IPAD',
				platform: 'OS X 10.6',
				version: '5.0'
			}, {
				browserName: 'opera',
				platform: 'Windows 2008',
				version: '12'
		}],
		processReadmeHeaderSrc          = docsTmplDir + '/README_header.md.tmpl',
		processReadmeHeaderDestination  = docsTmplDir + '/README_header.md',
		processLicenseSrc               = docsTmplDir + '/LICENSE.tmpl',
		processLicenseDestination       = 'LICENSE',
		npmConfig 						= grunt.file.readJSON('package.json'),
		filesPreProcess 				= {};

	npmConfig.year = grunt.template.today('yyyy');
	filesPreProcess[docsTmplDir + '/README_header.md'] = docsTmplDir + '/README_header.md.tmpl';
	filesPreProcess[docsTmplDir + '/LICENSE.tmpl'] = 'LICENSE';

	/////////////////////////////
	// Project configuration.  //
	/////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		preprocess: {
			options: {
				context: {
					year: grunt.template.today('yyyy')
				}
			},
			readme: {
				options: {
					context: npmConfig
				},
				files: filesPreProcess
			}
		},
		concat: {
			options: {
				separator: ''
			},
			//  // '2013'
			dist: {
				src: [docsTmplDir + '/README_header.md', docsTmplDir + '/README_footer.md', 'LICENSE'],
				dest: 'README.md'
			}
		},
		connect: {
			saucelabs: {
				options: {
					base: '.',
					port: 8080
				}
			},
			servermanualtest: {
				options: {
					base: '.',
					keepalive: true,
					port: 9090
				}
			}
		},
		yuidoc: {
			compileA: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.repository.url %>',
				options: {
					paths: 'lib/',
					outdir: 'docs/'
				}
			}
		},
		'saucelabs-mocha': {
			all: {
				options: {
					urls: ['http://localhost:8080/test'], // grunt-connect
					tunnelTimeout: 5,
					detailedError: true,
					concurrency: 3,
					build: process.env.TRAVIS_JOB_ID,
					browsers: browsers,
					testname: "mocha tests"
				}
			}
		},
		jshint: {
			all: {
				files: {
					src: filesLib
				},
				options: {
					jshintrc: '.jshintrc'
				}
			}
		},
		clean: [docsTmplDir + "/**/*.md"],
		watch: {
			options: {
				livereload: true
			},
			files: filesWatch,
			tasks: tasksWatch
			// tasks: tasksBuild
		}
	});

	/*--------------------------------------
	Readme custom task
	---------------------------------------*/
	grunt.registerTask("readme-concat", ["preprocess:readme", "concat", "clean"]);
	// keep in here for the watch task
	grunt.registerTask('readme', 'Concatenate readme docs', function() {
		var done = this.async();
		var exec = require('child_process').exec;
		exec('make readme', function(error, stdout, stderr) {
			done();
		});
	});

	///////////////////////////
	// Loading dependencies  //
	///////////////////////////
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
	}

	// register tasks
	grunt.registerTask("template", ["preprocess:readme"]);
	grunt.registerTask("docs", ["connect", "yuidoc"]);
	grunt.registerTask("test", ["connect:saucelabs", "saucelabs-mocha"]);
	grunt.registerTask("default", ["connect", "watch"]);
	grunt.registerTask("build", tasksBuild);
};