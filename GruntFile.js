module.exports = function(grunt) {
	grunt.initConfig({
		docbase: {
			def: {
				options: {
					generatePath: "dist/",
					baseUrl: "/"
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 9001,
					base: './'
				}
			}
		},
		'gh-pages': {
			def: {
				base: 'dist',
				message: 'publish gh-pages (auto)',
				silent: false,
				src: ['**']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-docbase');
	grunt.loadNpmTasks('grunt-gh-pages');
	// Default task.
	grunt.registerTask('default', ['connect', 'docbase']);
	grunt.registerTask('publish', ['connect', 'docbase', 'gh-pages']);

};