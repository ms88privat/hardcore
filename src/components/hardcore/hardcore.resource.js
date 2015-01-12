'use strict';
/*jshint esnext: true */

var resourceService = function(Facility, $q, $localForage, $resource, $http) {
	var rCache = [];

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

	class Resource extends Facility.class {
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
				primKey: primKey
			});
			this.url = url;
			this.isArray = isArray;
			this.parse = parse;
		}

		get({params = {}} = {}) {
			var url = url || this.url;
			var isArray = isArray || this.isArray;
			var self = this;

			var parseHandler =function(resp) {return self.parseResponse(resp);};
			var saveHandler =function(resp) {return super.save(resp);};
			var error =function(err) {return $q.reject(err);};

			return super.get().then(function(resp) {
				if (resp) {return resp;}
				return resObj(url, params, isArray).get().$promise
					.then(parseHandler)
					.then(saveHandler)
					.catch(error)
					;
			})

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