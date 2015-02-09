'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('default', ['styles', 'scripts', 'vendor', 'old', 'compact'], function () {
    gulp.start('watch');
});

gulp.task('watch', ['styles', 'scripts'] ,function () {
  gulp.watch('styles/**/*.scss', ['styles']);
  gulp.watch('scripts/**/*.js', ['scripts']);
  gulp.watch('vendor/**/*.js', ['vendor']);
  gulp.watch('styles/**/*.css', ['old'])
});

gulp.task('styles',  function () {
  return gulp.src('styles/**/*.scss')
    .pipe($.sass({style: 'compressed'}))
    .pipe($.autoprefixer('last 1 version'))
    .pipe($.addSrc('styles/**/*.css'))
    .pipe($.concat('style.css'))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('scripts', function () {
  gulp.src(['scripts/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.concat('script.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('compact', ['vendor'], function() {
	return gulp.src('scripts/**/*.js')
		.pipe($.concat('main.min.js'))
		.pipe($.uglify())
		.pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('vendor', function() {
  return gulp.src('vendor/**/*.js')
    .pipe($.concat('vendor.min.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('old', function(){
  return gulp.src('styles/**/*.css')
    .pipe($.concat('old-style.css'))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});