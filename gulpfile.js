var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var fileInclude = require('gulp-file-include');
var packageInfo = require('./package.json');
var slugify = require('slugify2');
var replace = require('gulp-replace');

var paths = {
  scripts: 'scripts/**/*.js',
  styles: 'styles/**/*.scss'
};

gulp.task('scripts', ['styles'], function() {
  return gulp.src(paths.scripts)
    .pipe(replace(/^(\/\/ @\w+\s+){{(\w+)}}$/mg, function(substr, pre, key){
      return pre + (packageInfo.userscript[key] || packageInfo[key] || "");
    }))
    .pipe(replace(/USER_AGENT/g, function(){
      return "'" + packageInfo.name + ' (' + packageInfo.version + ')' + "'";
    }))
    .pipe(fileInclude({basepath: '@root'}))
    .pipe(concat(slugify(packageInfo.name) + '.user.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', function () {
  return sass('styles/', {style: 'compressed'})
    .pipe(concat('style.css', {newLine: ''}))
    .pipe(gulp.dest('tmp'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);
