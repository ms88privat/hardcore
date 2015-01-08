'use strict';
/*jshint esnext: true */

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
	}

}


export default Collection;