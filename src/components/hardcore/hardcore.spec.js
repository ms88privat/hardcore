'use strict';

describe('ms.hardcore', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a Collection with a name', 
    inject(function(collection) {

    var instance = collection.init('NameOfCollection', {});

    console.log('Collection', instance);

    expect(instance.name).toEqual('NameOfCollection');

  }));

  describe('Collection instance', function(){

    var instance;

    beforeEach(inject(function(collection) {
      instance = collection.init('NameOfCollection', {});
    }));

    it('should have default options', function(){

      // making sure instance is allright
      expect(instance.name).toEqual('NameOfCollection');

      // test all default states
      expect(instance.primKey).toEqual('id');
      expect(instance.cache).toBe(true);
      expect(instance.store).toBe(false);
      
    });

  });
});
