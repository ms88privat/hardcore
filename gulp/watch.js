'use strict';

var gulp = require('gulp');

gulp.task('watch', ['consolidate', 'wiredep', 'injector:css', 'injector:js', 'test'] ,function () {
  gulp.watch('src/{app,components}/**/*.css', ['injector:css']);
  gulp.watch('src/{app,components}/**/*.js', ['injector:js']);
  gulp.watch('src/assets/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch('src/{app,components}/**/*.jade', ['consolidate:jade']);
  gulp.watch('src/{app,components}/**/*.spec.js', ['test']);
});
