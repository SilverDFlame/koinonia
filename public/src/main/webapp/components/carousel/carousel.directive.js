/**
 * Created by aallen on 3/22/2016.
 */
angular.module('koinonia.components.carousel')
  .directive('koiCarousel', function() {
    return {
      controller: 'CarouselController',
      templateUrl: 'components/carousel/carousel.template.html',
      scope: true
    }
  });