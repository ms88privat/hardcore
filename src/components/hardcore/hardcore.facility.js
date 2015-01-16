'use strict';
/*jshint esnext: true */

var facilityService = function($q, $localForage) {
	var memCache = {};
	
	class Facility {
		constructor(name, {
			cache = true,
			store = false,
			primKey = 'id',
			resource = false
		} = {}) {
			this.name = name;
			this.cache = cache;
			this.store = store;
			this.primKey = primKey;
			this.resource = resource;
			this.keyname = this.keynameGenerator(name);
		}

		save({data, keyname = this.keyname, promise = true}){
			var self = this;
			var saved = self.saveToCache(keyname, data);
			if (self.store) {
				self.saveToStorage(keyname, data);
			}
			if (promise) {
				return $q.when(saved);	
			}
			return saved;
		}

		get({id, keyname = this.keyname, promise = true} = {}) {
			var self = this;
			id = parseInt(id);
			var data = angular.copy(self.getFromCache(keyname)); // copy need?
			
			// if no data in cache, look in storage if it is an option 
			if (!data && self.store)  {
				data = self.getFromStore(keyname);
			} 

			if (id) {
				data = self.getById(data, id);
			} 

			if (promise) {
				return $q.when(data);
			}

			return data;
			
		}

		static clearCache() {
			memCache = {};
			return memCache;
		}

		getById(data, id) {
			if (data instanceof Array) {
				var matrix = {};
				matrix[this.primKey] = id;
				return _.find(data, matrix);
			}
			return data; // if no array, do nothing
		}

		add({data, keyname = this.keyname}) {
			var self = this;
			var present = self.get({keyname: keyname, promise: false});
			present = present.concat(data);
			// present = _.uniq(present, self.primKey); // todo: test if necesarry
			return self.save({data: present, keyname: keyname});
		}

		update({data, keyname = this.keyname, isList = false}) {
			var self = this;
			var present = self.get({keyname: keyname, promise: false});
			// Sonderfall: keine Liste aber auch kein Model mit id
			if(!isList && !(data.hasOwnProperty(self.primKey))) {
				present = angular.extend({}, present, data);
			}
			if(isList) {
				_.remove(present, function(model) {
					_.forEach(data, function(data) {
						if (data[self.primKey] && model[self.primKey] === data[self.primKey]) {
							return true;
						} 
					});
				});
				present = present.concat(data);
			} else {

				var removedItems = window._.remove(present, function(model) {
					if (data[self.primKey] && model[self.primKey] === data[self.primKey]) {return true;} // sonst undefinied vs undefiend
				});
				data = angular.extend({}, removedItems[0], data); // alte properties übernehmen "echtes update"
				present.push(data);
			}
			return self.save({data: present, keyname: keyname});

		}

		getFromStore(keyname = this.keyname) {
			return angular.fromJson(localStorage.getItem(keyname));
		}

		saveToStorage(keyname = this.keyname, data) {
			return localStorage.setItem(keyname, angular.toJson(data));
		}

		getFromCache(keyname = this.keyname) {
			return memCache[keyname];
		}

		saveToCache(keyname = this.keyname, data) {
			memCache[keyname] = data;
			return memCache[keyname]; 
		}

		keynameGenerator(name) {
			if (this.resource) {
				return 'appprefix_' + 'res_' + name;
			} else {
				return 'appprefix_' + 'fac_' + name;
			}
			
		}

	}

	return {
		create:  function(name, args) {
			return new Facility(name, args);
		},
		class: function() {
			return Facility;
		} ,
		cache: function() {
			return memCache;
		}
	};
};

facilityService.$inject = ['$q', '$localForage'];

export default facilityService;


