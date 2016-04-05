/**
 * Created by aallen on 4/4/2016.
 */
describe('koiCarousel', function() {
  var $httpBackend,
    element,
    $scope;

  beforeEach(function() {
    module('koinonia.components.carousel');

    inject(function($rootScope, $injector, $compile) {
      $scope = $rootScope.$new();
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.whenGET('components/carousel/carousel.template.html').respond(200, '');

      element = angular.element('<koi-carousel></koi-carousel>');
      element = $compile(element)($scope);
      $scope.$digest();
    });

  });

  it('Should compile directive template', function() {
    expect(element).not.toBeNull();
  });
});
