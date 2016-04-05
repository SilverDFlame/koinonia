/**
 * Created by aallen on 3/30/2016.
 */
describe('CarouselController', function() {
  'use strict';
  var controller,
    $scope;

  beforeEach(function() {
    module('koinonia.components.carousel');
    inject(function(_$rootScope_, $controller) {
      $scope = _$rootScope_.$new();
      controller = $controller('CarouselController', {
        '$scope': $scope
      });
    });
  });
  describe('on initialization', function() {
    it('should instantiate the controller', function() {
      expect(controller).not.toBeNull();
    });
  });

  describe('when adding a new slide', function() {
    it('should increase $scope.slides by one', function() {
      $scope.addSlide();
      expect($scope.slides).toEqual([{
        image: 'http://lorempixel.com/1891/600',
        text: 'I\'ve',
        id: 0
      }]);
      expect($scope.slides.length).toBe(1);
    });
  });
});