'use strict';

describe('ms.hardcore msResource factory', function(){

  beforeEach(module('ms.hardcore'));


  it('should instantiate a msResource with a name', 
    inject(function(msResource) {

    var instance = msResource.create('NameOfmsResource');

    console.log('msResource', instance);

    expect(instance.name).toEqual('NameOfmsResource');
    expect(instance.keyname).toEqual('appprefix_res_NameOfmsResource');

  }));


  describe('Instance', function(){

	  it('should make a GET request with params', 
	    inject(function(msResource, $rootScope, $httpBackend) {

	    var instance = msResource.create('NameOfmsResource', {
	    	url: 'api/test/:id'
	    });
	    var params = {params: {id: 3}};

	    $httpBackend.expectGET('api/test/3').respond(200, {data: 'yolo'});

	    expect(instance.url).toEqual('api/test/:id');

	    var handler = {
	    	success: function(resp) {
	    		expect(resp.data).toEqual('yolo');
	    	},
	    	error: function(err) {

	    	}
	    };

	    spyOn(handler, 'success').and.callThrough();
	    spyOn(handler, 'error').and.callThrough();


	    instance.get(params)
	    	.then(handler.success)
	    	.catch(handler.error)
	    	;

			$httpBackend.flush();

			expect(handler.success).toHaveBeenCalled();
      expect(handler.error).not.toHaveBeenCalled();


	  }));

	  it('should make only one GET request in a short time period (throttle) for a specific request', 
	    inject(function(msResource, $rootScope, $httpBackend) {

	    var instance = msResource.create('NameOfmsResource', {
	    	url: 'api/test/:id'
	    });
	    var params = {params: {id: 3}};

	    $httpBackend.expectGET('api/test/3').respond(200, {data: 'yolo'});
	    	    
	    var handler = {
	    	success: function(resp) {
	    		expect(resp.data).toEqual('yolo');
	    	},
	    	error: function(err) {

	    	}
	    };

	    spyOn(handler, 'success').and.callThrough();
	    spyOn(handler, 'error').and.callThrough();
	    spyOn(instance, 'parseResponse').and.callThrough();


	    instance.get(params)
	    	.then(handler.success)
	    	.catch(handler.error)
	    	;

			$httpBackend.flush();

			expect(instance.parseResponse).toHaveBeenCalled();
			expect(handler.success).toHaveBeenCalled();
      expect(handler.error).not.toHaveBeenCalled();

      // next request

      var handler2 = {
	    	success: function(resp) {
	    		expect(resp.data).toEqual('yolo');
	    	},
	    	error: function(err) {

	    	}
	    };

	    spyOn(handler2, 'success').and.callThrough();
	    spyOn(handler2, 'error').and.callThrough();
	    instance.parseResponse.calls.reset();

			instance.get(params)
	    	.then(handler2.success)
	    	.catch(handler2.error)
	    	;

	    $rootScope.$apply();

	    expect(instance.parseResponse).not.toHaveBeenCalled();
	    expect(handler2.success).toHaveBeenCalled();
      expect(handler2.error).not.toHaveBeenCalled();
      

	  }));

	});

});