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
				user: {
						name: 'Travis',
						email: 'mateusfreira@gmail.com'
				},
				repo: 'https://' + process.env.GH_TOKEN + '@github.com/mateusfreira/Docs.git',
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