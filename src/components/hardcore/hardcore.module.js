'use strict';
/*jshint esnext: true */

import facilityService from './hardcore.facility';
import resourceService from './hardcore.resource';

export default angular.module('ms.hardcore', ['ngResource'])
	.factory('msFacility', facilityService)
	.factory('msResource', resourceService)
	;

