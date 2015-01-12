'use strict';

describe('ms.hardcore msFacility factory', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a msFacility with a name', 
    inject(function(msFacility) {

    var instance = msFacility.create('NameOfmsFacility');

    console.log('msFacility', instance);

    expect(instance.name).toEqual('NameOfmsFacility');

  }));

  xit('should clear all of its cache', inject(function(msFacility){

    var instance = msFacility.create('NameOfmsFacility');
    var instance2 = msFacility.create('NameOfmsFacility2');

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

    msFacility.class.clearCache();

    expect(instance.get()).toBeUndefined();
    expect(instance2.get()).toBeUndefined();
    
  }));

  describe('msFacility instance', function(){

    it('should have default options', inject(function(msFacility){

      var instance = msFacility.create('NameOfmsFacility');

      // test all default states
      expect(instance.primKey).toEqual('id');
      expect(instance.cache).toBe(true);
      expect(instance.store).toBe(false);
      
    }));

    it('should override defaults if specified', inject(function(msFacility){

      var instance = msFacility.create('NameOfmsFacility', {
        cache: {special: 'case'},
        store: true,
        primKey: 'idea_id'
      });

      // test all default states
      expect(instance.primKey).toEqual('idea_id');
      expect(instance.cache).toEqual({special: 'case'});
      expect(instance.store).toBe(true);
      
    }));

    xit('should save data to cache', inject(function(msFacility){

      var instance = msFacility.create('NameOfmsFacility');

      var data = {
        data: 'example'
      };

      instance.save(data);

      expect(instance.get()).toEqual(data);

      
    }));

  });
});
