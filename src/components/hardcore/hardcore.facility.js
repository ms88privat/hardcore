'use strict';
/*jshint esnext: true */

var facilityService = function($q) {

	function clearSomeLocalStorage(startsWith) {
		var myLength = startsWith.length;
		Object.keys(localStorage).forEach(function(key){ 
			if (key.substring(0,myLength) == startsWith) {
				localStorage.removeItem(key); 
			} 
		}); 
	}

	var _appprefix = 'myapp';

	var memCache = {};
	memCache.false = {}; // facility
	memCache.true = {};	// resource

	var instanceCount = 0;

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
			this.id = ++instanceCount;


			memCache[this.resource][this.id] = {};
			// instance id can not be used as domain, because it can change in order when you reload the browser
			this.domain = _appprefix + this.resource.toString() + this.name.toString();
			this.keyname = name;
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

		// clear all (or only res/fac)
		static clear({res = true, fac = true} = {}) {

			if (res) {resetMem(true); } // true = resource
			if (fac) {resetMem(false); } // false = facility

			return memCache;

			function resetMem(type) {
				// cache
				memCache[type] = {};
				for (var i = 1; i <= instanceCount; i++) {
					memCache[type][i] = {};
				}
				// store
				clearSomeLocalStorage(_appprefix + type.toString());
			}
		}

		// clear hole instance
		clear(keyname = false) {

			if (keyname) {
				memCache[this.resource][this.id][keyname] = {};
				clearStorage(this.domain, keyname);
			} else {
				memCache[this.resource][this.id] = {};
				clearStorage(this.domain, this.keyname);
			}

			return memCache;
			
			function clearStorage(domain, keyname) {
				if (keyname) {
					localStorage.removeItem(domain + keyname);
				} else {
					clearSomeLocalStorage(this.domain);
				}
				
			}

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
			var present = Facility.prototype.get.call(self, {keyname: keyname, promise: false});
			present = present.concat(data);
			// present = _.uniq(present, self.primKey); // todo: test if necesarry
			return Facility.prototype.save.call(self, {data: present, keyname: keyname});
		}

		update({data, keyname = this.keyname, isList = false}) {
			var self = this;
			var present = Facility.prototype.get.call(self, {keyname: keyname, promise: false});
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
					if (data[self.primKey] && model[self.primKey] === data[self.primKey]) {return true;}
				});
				data = angular.extend({}, removedItems[0], data); // alte properties übernehmen "echtes update"
				present.push(data);
			}
			return Facility.prototype.save.call(self, {data: present, keyname: keyname});

		}

		remove({keyname = this.keyname, id}) {
			var self = this;

			if(id) {
				var present = Facility.prototype.get.call(self, {keyname: keyname, promise: false});

				var removeById = function(collection, id) { // remove object in collection within keyname
					_.remove(collection, function(model) {
						if (model[self.primKey] === parseInt(id)) {return true;} // hotfix
					});
					return collection;
				};

				return Facility.prototype.save.call(self, {
					data: removeById(present, id),
					keyname: keyname,
				});


			} else {
				return Facility.prototype.clear.call(self, {keyname: keyname});
			}

		}



		getFromStore(keyname) {
			return angular.fromJson(localStorage.getItem(this.domain + keyname));
		}

		saveToStorage(keyname, data) {
			return localStorage.setItem(this.domain + keyname, angular.toJson(data));
		}

		getFromCache(keyname) {
			return memCache[this.resource][this.id][keyname];
		}

		saveToCache(keyname, data) {

			memCache[this.resource][this.id][keyname] = data;
			return data;
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

facilityService.$inject = ['$q'];

export default facilityService;


