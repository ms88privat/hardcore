'use strict';

var resourceService = function(Facility, $log, $rootScope, $q, $resource, $http) {

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

		static clear({res = true, fac = true} = {}) {
			super.clear({res: res, fac: fac});
		}

		get({
			params = {}, 
			url = this.url, 
			isArray = this.isArray, 
			keyname = this.keyname,
			reload = false
			} = {}) {
			var self = this;

			var saveHandler =function(resp) {
				super.save({data: resp, keyname: keyname});
				return resp;
			};

			var requestIdf = angular.toJson(url) + angular.toJson(params);
			var diff = timeDiff('now', self.requestTime[requestIdf]);

			if (!diff || diff > THROTTLE_TIME) {
				// new request
				self.requestTime[requestIdf] = new Date().getTime();
				self.request[requestIdf] = super.get({keyname: keyname}).then(function(resp) {
					if (resp && !reload) {return resp;}
					$log.log('get() ', self.name);
					return resObj(url, params, isArray).get().$promise
						.then(function(resp){return self.parseResponse(resp);})
						.then(saveHandler)
						.catch(function(err){return self.errorResponse(err);})
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
				super.add({data: resp, keyname: keyname});
				return resp;
			};

			// CREATE
			return resObj(url, params).save(data).$promise
				.then(function(resp){return self.parseResponse(resp);})
				.then(addHandler)
				.catch(function(err){return self.errorResponse(err);});
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
				return resp;
			};

			if (isList) { 
				return resObj(url, params, isArray).update(data).$promise
					.then(function(resp){return self.parseResponse(resp);})
					.then(updateHandler)
					.catch(function(err){return self.errorResponse(err);});
			}

			// UPDATE
			return resObj(url, {id: data.id}).update(data).$promise
				.then(function(resp){return self.parseResponse(resp);})
				.then(updateHandler)
				.catch(function(err){return self.errorResponse(err);});
		}

		delete({url = this.url, params, keyname = this.keyname} = {}) {

			var self = this;

			var removeHandler = function(resp) {
				return super.remove({keyname: keyname, id: params.id});
			};

			return resObj(url, params).remove().$promise
				.then(removeHandler)
				.catch(function(err){return self.errorResponse(err);});
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

resourceService.$inject = ['msFacility', '$log', '$rootScope', '$q', '$resource', '$http'];

export default resourceService;