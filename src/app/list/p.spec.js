'use strict';

describe('Component: list', function () {

  // load the directive's module and view
  beforeEach(module('rchApp'));
  beforeEach(module('app/list/list.html'));
  beforeEach(module('ngMock'));

  var component, $componentController, scope;

  beforeEach(inject(function($rootScope, _$componentController_) {
    scope = $rootScope.$new();
    $componentController = _$componentController_;
  }));




  it('should make hidden element visible', inject(function ($compile) {
    let component = $componentController('list', {
      // locals
    }, {

      // bindings 
      bindExample: {
        afterFormSubmit: jasmine.createSpy('formSubmit')
      }
    });

    //    we can check also that the spy was run, if eg, a button was pressed
    //    expect(element.text()).toBe('this is the tssCreateProjectPage component');
  }));
});
