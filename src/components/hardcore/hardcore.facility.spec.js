'use strict';

describe('ms.hardcore msFacility factory', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a msFacility with a name and keyname', 
    inject(function(msFacility) {

    var instance = msFacility.create('NameOfmsFacility');

    console.log('msFacility', instance);

    expect(instance.name).toEqual('NameOfmsFacility');
    expect(instance.keyname).toEqual('appprefix_fac_NameOfmsFacility');

  }));

  it('should clear all of its cache', inject(function(msFacility){

    var instance = msFacility.create('NameOfmsFacility');
    var instance2 = msFacility.create('NameOfmsFacility2');

    var data = {
      data: 'example'
    };
    var data2 = {
      data: 'example'
    };
    // test all default states
    instance.save({data: data});
    instance2.save({data: data2});

    expect(msFacility.cache()[instance.keyname]).toEqual(data);
    expect(msFacility.cache()[instance2.keyname]).toEqual(data2);

    msFacility.class().clearCache();

    expect(msFacility.cache()[instance.keyname]).toBeUndefined();
    expect(msFacility.cache()[instance2.keyname]).toBeUndefined();
    
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

    it('should save data in cache & receive data from cache as promise', inject(function(msFacility, $rootScope){

      var instance = msFacility.create('NameOfmsFacility');

      var data = {
        data: 'example'
      };

      spyOn(instance, 'save').and.callThrough();
      spyOn(instance, 'get').and.callThrough();
      spyOn(instance, 'getFromStore').and.callThrough();

      var successHandler = jasmine.createSpy('success');
      var errorHandler = jasmine.createSpy('error');

      instance.save({data: data});

      instance.get()
        .then(successHandler)
        .catch(errorHandler)
        ;

      $rootScope.$apply();

      expect(instance.save).toHaveBeenCalledWith({data: data});
      expect(instance.get).toHaveBeenCalledWith();

      expect(successHandler).toHaveBeenCalledWith(data);
      expect(errorHandler).not.toHaveBeenCalled();

      expect(instance.getFromStore).not.toHaveBeenCalled();

      
    }));

    it('should fallback to storage if no cache data is avaiable', inject(function(msFacility, $rootScope){

      var instance = msFacility.create('NameOfmsFacility', {
        store: true
      });

      spyOn(instance, 'get').and.callThrough();
      spyOn(instance, 'getFromStore').and.callThrough();

      var successHandler = jasmine.createSpy('success');
      var errorHandler = jasmine.createSpy('error');

      instance.get()
        .then(successHandler)
        .catch(errorHandler)
        ;

      $rootScope.$apply();

      expect(instance.get).toHaveBeenCalledWith();
      expect(instance.getFromStore).toHaveBeenCalledWith(instance.keyname);

      expect(successHandler).toHaveBeenCalled();
      expect(errorHandler).not.toHaveBeenCalled();

      
    }));

    it('should get data by id', inject(function(msFacility, $rootScope){

      var instance = msFacility.create('NameOfmsFacility', {
      });

      var ary = [];
      var data1 = {id: 3, test: 'yolo'};
      var data2 = {id: 25, test: 'was geht'};
      ary.push(data1);
      ary.push(data2);

      instance.save({data: ary});

      var successHandler = jasmine.createSpy('success');
      var errorHandler = jasmine.createSpy('error');

      instance.get({id: 25})
        .then(successHandler)
        .catch(errorHandler)
        ;

      $rootScope.$apply();

      expect(successHandler).toHaveBeenCalledWith(data2);
      expect(errorHandler).not.toHaveBeenCalled();

      
    }));

    it('should add data to array', inject(function(msFacility, $rootScope){

      var instance = msFacility.create('NameOfmsFacility', {
      });

      var ary = [];
      var data1 = {id: 3, test: 'yolo'};
      var data2 = {id: 25, test: 'was geht'};
      ary.push(data1);

      instance.save({data: ary});

      instance.add({data: data2});

      var successHandler = jasmine.createSpy('success');
      var errorHandler = jasmine.createSpy('error');

      instance.get()
        .then(successHandler)
        .catch(errorHandler)
        ;

      $rootScope.$apply();

      ary.push(data2);

      expect(successHandler).toHaveBeenCalledWith(ary);
      expect(errorHandler).not.toHaveBeenCalled();

      
    }));

  });
});
