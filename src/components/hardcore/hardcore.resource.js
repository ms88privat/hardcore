'use strict';

var resourceService = function(Facility, $rootScope, $q, $localForage, $resource, $http) {

	var THROTTLE_TIME = 5000;


	function timeDiff(timeOne, timeTwo) {
		if (timeOne === 'now') {timeOne = new Date().getTime();}
		if (timeOne < timeTwo) {
			timeOne.setDate(timeOne.getDate() + 1);
		}
		var diff = timeOne - timeTwo;
		return diff;
	}


	var transform = function(data, header) {
		return data;
	};

	var resObj = function(url, params, isArray) {
		return $resource(url, {id: '@id'}, {
			get: {method:'GET', params: params, isArray: isArray, transformResponse: [transform].concat($http.defaults.transformResponse)}, 
			save: {method:'POST', params: params, isArray: isArray, transformResponse: [transform].concat($http.defaults.transformResponse)},
			remove: {method: 'DELETE', params: params, transformResponse: [transform].concat($http.defaults.transformResponse)},
			update: { method: 'PUT', params: params, isArray: isArray , transformResponse: [transform].concat($http.defaults.transformResponse)}
		});
	};

	class Resource extends Facility.class() {
		constructor(name, {
			cache = true,
			store = false,
			primKey = 'id',
			url,
			isArray = false,
			parse = false,
			errorHandler = function(name, error) {
				$log.warn('errorHandler', name, error);
				$rootScope.$broadcast('ms.hardcore.resource:error', name, error);
			}
		} = {}) {
			super(name, {
				cache: cache,
				store: store,
				primKey: primKey,
				resource: true // constructed through resource
			});
			this.url = url;
			this.isArray = isArray;
			this.parse = parse;
			this.request = {}; // this assoiative array is holding all of the last requests promises
			this.requestTime = {};
		}

		get({params = {}, url = this.url, isArray = this.isArray} = {}) {
			var self = this;

			var saveHandler =function(resp) {
				return super.save({data: resp});
			};

			var requestIdf = angular.toJson(url) + angular.toJson(params);
			var diff = timeDiff('now', self.requestTime[requestIdf]);

			if (!diff || diff > THROTTLE_TIME) {
				// new request
				$log.log('get() ', self.name);
				self.requestTime[requestIdf] = new Date().getTime();
				self.request[requestIdf] = super.get().then(function(resp) {
					if (resp) {return resp;}
					return resObj(url, params, isArray).get().$promise
						.then(self.parseResponse.call(self))
						.then(saveHandler)
						.catch(self.errorResponse.call(self))
						;
				});
	
			} 

			return self.request[requestIdf]; 
		}

		create({
			params = {}, 
			data, 
			url = this.url, 
			isArray = this.isArray, 
			keyname = this.keyname
			} = {}) {
		
			// if (data.hasOwnProperty('id')) { // UPDATE IF ID
			// 	return super.update({data: data, keyname: keyname});
			// }

			var self = this;

			var addHandler =function(resp) {
				// window._.defaults(resp, data); // daten vom server haben vorang, lokale hilfsparameter aber beibehalten
				return super.add({data: resp, keyname: keyname});
			};

			// CREATE
			return resObj(url, params).save(data).$promise
				.then(self.parseResponse.call(self))
				.then(addHandler)
				.catch(self.errorResponse.call(self));
		}

		update({
			params = {}, 
			data, 
			url = this.url, 
			isArray = this.isArray, 
			isList = false,
			keyname = this.keyname
			} = {}) {

			var self = this;

			var updateHandler =function(resp) {
				resp = _.defaults(resp, data); // Daten mergen (es könnten nur Teile geupdated worden sein)
				super.update({data: resp, keyname: keyname, isList: isList}); 
			};

			if (isList) { 
				return resObj(url, params, isArray).update(data).$promise
					.then(self.parseResponse.call(self))
					.then(updateHandler)
					.catch(self.errorResponse.call(self));
			}

			// UPDATE
			return resObj(url, {id: data.id}).update(data).$promise
				.then(self.parseResponse.call(self))
				.then(updateHandler)
				.catch(self.errorResponse.call(self));
		}


		parseResponse(resp) {
			if (typeof this.parse === 'string') {
				resp = resp[this.parse];
			} else if (angular.isFunction(this.parse) === true) {
				resp = this.parse(resp);
			} 
			return resp;
		}

		errorResponse(err) {
			if (this.errorHandler) {this.errorHandler(this.name, err);}
			return $q.reject(err);
		}
	}

	return {
		create:  function(name, args) {
			return new Resource(name, args);
		},
		class: Resource
	};
};

resourceService.$inject = ['msFacility', '$rootScope', '$q', '$localForage', '$resource', '$http'];

export default resourceService;