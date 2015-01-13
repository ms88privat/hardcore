'use strict';
/*jshint esnext: true */

var resourceService = function(Facility, $q, $localForage, $resource, $http) {

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

			var parseHandler =function(resp) {
				return self.parseResponse(resp);
			};
			var saveHandler =function(resp) {
				return super.save({data: resp});
			};
			var error =function(err) {
				return $q.reject(err);
			};

			var requestIdf = angular.toJson(url) + angular.toJson(params);
			var diff = timeDiff('now', self.requestTime[requestIdf]);

			if (!diff || diff > THROTTLE_TIME) {
				// new request
				self.requestTime[requestIdf] = new Date().getTime();
				self.request[requestIdf] = super.get().then(function(resp) {
					if (resp) {return resp;}
					return resObj(url, params, isArray).get().$promise
						.then(parseHandler)
						.then(saveHandler)
						.catch(error)
						;
				});
	
			} 

			return self.request[requestIdf]; 

		}

		parseResponse(resp) {
			if (typeof this.parse === 'string') {
				resp = resp[this.parse];
			} else if (angular.isFunction(this.parse) === true) {
				resp = this.parse(resp);
			} 
			return resp;
		}
	}

	return {
		create:  function(name, args) {
			return new Resource(name, args);
		},
		class: Resource
	};
};

resourceService.$inject = ['msFacility', '$q', '$localForage', '$resource', '$http'];

export default resourceService;