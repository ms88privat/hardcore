'use strict';
/*jshint esnext: true */

import Collection from './hardcore.base';

export default angular.module('ms.hardcore', [])
	.factory('collection', function() {
		return {
			init: Collection
		};
	});

