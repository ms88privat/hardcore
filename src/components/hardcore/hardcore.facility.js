'use strict';
/*jshint esnext: true */

var facilityService = function($q, $localForage) {
	var cCache = [];
	
	function generateKeyname (name) {
		return 'prefix_' + name;
	}

	class Facility {
		constructor(name, {
			cache = true,
			store = false,
			primKey = 'id'
		} = {}) {
			this.name = name;
			this.cache = cache;
			this.store = store;
			this.primKey = primKey;
			this.keyname = generateKeyname(name);
		}

		save(data){
			cCache[this.keyname] = data;
			return $q.when(cCache[this.keyname]);
		}

		get() {
			return $q.when(cCache[this.keyname]);
		}

		static clearCache() {
			cCache = [];
			return cCache;
		}

	}

	return {
		create:  function(name, args) {
			return new Facility(name, args);
		},
		class: Facility
	};
};

facilityService.$inject = ['$q', '$localForage'];

export default facilityService;


