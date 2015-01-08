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

    it('should have default options', inject(function(collection){

      var instance = collection.init('NameOfCollection', {});

      // test all default states
      expect(instance.primKey).toEqual('id');
      expect(instance.cache).toBe(true);
      expect(instance.store).toBe(false);
      
    }));

    it('should override defaults if specified', inject(function(collection){

      var instance = collection.init('NameOfCollection', {
        cache: {special: 'case'},
        store: true,
        primKey: 'idea_id'
      });

      // test all default states
      expect(instance.primKey).toEqual('idea_id');
      expect(instance.cache).toEqual({special: 'case'});
      expect(instance.store).toBe(true);
      
    }));

  });
});
