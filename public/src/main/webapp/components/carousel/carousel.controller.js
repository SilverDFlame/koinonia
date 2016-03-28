/**
 * Created by aallen on 3/22/2016.
 */
angular.module('koinonia.components.carousel')
  .controller('CarouselController', /*@ngInject*/ function($scope) {
    var currIndex = 0,
      slides = $scope.slides = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    $scope.koiCarouselInterval = 30000;
    $scope.koiCarouselNoPause = true;

    function populateBackground() {

      _.fill($scope.slides, {
        image: 'http://lorempixel.com/1890/600',
        text: ['I\'ve'][1 % 4],
        id: currIndex++
      }, 0, 11);
      console.log($scope.slides);
    }

    $scope.addSlide = function() {
      var newWidth = 1890 + slides.length + 1;
      slides.push({
        image: 'http://lorempixel.com/' + newWidth + '/600',
        text: ['I\'ve', 'got', 'a', 'lovely', 'bunch', 'of', 'coconuts'][slides.length % 7],
        id: currIndex++
      });
    };

    populateBackground();
  });
