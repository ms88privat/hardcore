'use strict';

describe('ms.hardcore collection factory', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a Collection with a name', 
    inject(function(collection) {

    var instance = collection.init('NameOfCollection', {});

    console.log('Collection', instance);

    expect(instance.name).toEqual('NameOfCollection');

  }));

  it('should clear all of its cache', inject(function(collection){

    var instance = collection.init('NameOfCollection', {});
    var instance2 = collection.init('NameOfCollection2', {});

    var data = {
      data: 'example'
    };
    var data2 = {
      data: 'example'
    };
    // test all default states
    instance.save(data);
    expect(instance.get()).toEqual(data);

    instance2.save(data2);
    expect(instance2.get()).toEqual(data2);

    collection.class.clearCache();

    expect(instance.get()).toBeUndefined();
    expect(instance2.get()).toBeUndefined();
    
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

    it('should save data to cache', inject(function(collection){

      var instance = collection.init('NameOfCollection', {});

      var data = {
        data: 'example'
      };

      instance.save(data);

      expect(instance.get()).toEqual(data);

      
    }));

  });
});
