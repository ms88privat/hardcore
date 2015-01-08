'use strict';
/*jshint esnext: true */


var cCache = [];

function generateKeyname (name) {
	return 'prefix_' + name;
}

class Collection {
	constructor(name, {
		cache: cache = true,
		store: store = false,
		primKey: primKey = 'id'
	}) {
		this.name = name;
		this.cache = cache;
		this.store = store;
		this.primKey = primKey;
		this.keyname = generateKeyname(name);
	}

	save(data){
		cCache[this.keyname] = data;
	}

	get() {
		return cCache[this.keyname];
	}

	static clearCache() {
		cCache = [];
		return cCache;
	}

}


export default Collection;