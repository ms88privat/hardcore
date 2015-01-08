'use strict';

describe('ms.hardcore', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a Collection with a name', 
    inject(function(collection) {

    var instance = collection.init('NameOfCollection');

    console.log('Collection', instance);

    expect(instance.name).toEqual('NameOfCollection');

  }));


});
