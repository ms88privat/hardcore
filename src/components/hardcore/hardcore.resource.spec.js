'use strict';

describe('ms.hardcore msResource factory', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a msResource with a name', 
    inject(function(msResource) {

    var instance = msResource.create('NameOfmsResource');

    console.log('msResource', instance);

    expect(instance.name).toEqual('NameOfmsResource');

  }));


  describe('Instance', function(){

	  it('should make a GET request with params', 
	    inject(function(msResource, $rootScope, $httpBackend) {

	    var instance = msResource.create('NameOfmsResource', {
	    	url: 'api/test/:id'
	    });
	    var params = {params: {id: 3}};

	    $httpBackend.expectGET('api/test/3').respond(200, {data: 'yolo'});
	    
	    spyOn(instance, 'get').and.callThrough(); // a way to make sure a async function gets called!
	    
	    expect(instance.url).toEqual('api/test/:id');

	    instance.get(params).then(function(resp) {
	    	expect(resp.data).toEqual('yolo');
	    }, function(err) {
	    	expect(err).toBeUndefined();
	    });

			$httpBackend.flush();

			expect(instance.get).toHaveBeenCalledWith(params);

	  }));

	});

});