'use strict';
define(['angular', 'lodash', 'd3', 'jquery', 'js-base64'], function (
  angular,
  _,
  d3,
  $,
  jsbase64
) {
  angular.module('export-directive', []).directive('export', [
    '$compile',
    function ($compile) {
      return {
        restrict: 'A',
        scope: {
          fileName: '=',
          dontFloatSibling: '='
        },
        link: function (scope, element) {
          scope.exportElement = exportElement;

          var base64 = jsbase64.Base64;
          var $element = $(element);
          var btnElement = $compile(
            '<button ng-click="exportElement()" class="button export-button info small">Export</button>'
          )(scope);
          $element.after(btnElement);
          if (!scope.dontFloatSibling) {
            $element.css('float', 'left');
          }

          function exportElement() {
            if ($element.is('img')) {
              exportImage($element[0]);
            } else if ($element.find('svg').length > 0) {
              exportSvg($element.find('svg'));
            } else if ($element.is('svg')) {
              exportSvg($element);
            }
          }

          function exportSvg($svgElement) {
            var image = createImage($svgElement);
            image.on('load', _.partial(exportImage, image[0]));
          }

          function createImage($svgElement) {
            d3.selectAll('.domain')
              .attr('stroke', 'black')
              .attr('fill', 'none');
            d3.selectAll('.c3-chart-line').attr('fill', 'none');
            d3.selectAll('.c3-legend-background')
              .attr('fill', 'white')
              .attr('fill-opacity', '0.75')
              .attr('stroke', 'black')
              .attr('stroke-opacity', '0.30');
            d3.selectAll('text')
              .attr('font-family', 'sans-serif')
              .style('font-size', '12px');
            d3.selectAll('svg').style('background-color', 'white');
            d3.selectAll('.nv-point-paths').style('visibility', 'hidden');

            var html = $svgElement
              .attr('height', $svgElement.height())
              .attr('width', $svgElement.width())
              .attr('version', 1.1)
              .attr('xmlns', 'http://www.w3.org/2000/svg')
              .attr('crossOrigin', 'anonymous')[0].outerHTML;

            var imgsrc = 'data:image/svg+xml;base64,' + base64.encode(html);
            var img = $('<img />', {
              src: imgsrc
            });

            return img;
          }

          function exportImage(sourceImage) {
            sourceImage.setAttribute('crossOrigin', 'anonymous');
            var $canvasElement = $('<canvas/>').prop({
              width: sourceImage.width,
              height: sourceImage.height
            });
            var context = $canvasElement[0].getContext('2d');
            context.drawImage(sourceImage, 0, 0);

            var a = document.createElement('a');
            a.download = scope.fileName + '.png';
            a.href = $canvasElement[0].toDataURL('image/png');

            // work around firefox security feature that stops triggering click event from script
            var clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: false
            });
            a.dispatchEvent(clickEvent);
          }
        }
      };
    }
  ]);
});
