'use strict';
/* globals angular */
define(['lodash', 'd3', 'jQuery'], function(_, d3, $) {
  angular.module('export-directive', [])
    .directive('export', ['$compile',
      function($compile) {
        return {
          restrict: 'A',
          scope: {
            fileName: '=',
            dontFloatSibling: '='
          },
          link: function(scope, element) {
            var $element = $(element);
            var btnElement = $compile('<button ng-click="exportElement()" class="button export-button info small">Export</button>')(scope);
            $element.after(btnElement);
            if (!scope.dontFloatSibling) {
              $element.css('float', 'left');
            }

            if ($element.is('img')) {
              scope.exportElement = _.partial(exportImage, $element[0]);
            } else if ($element.find('svg').length > 0) {
              scope.exportElement = _.partial(exportSvg, $element.find('svg'));
            }

            function exportImage(sourceImage) {
              sourceImage.setAttribute('crossOrigin', 'anonymous');
              var $canvasElement = $('<canvas/>')
                .prop({
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
                'view': window,
                'bubbles': true,
                'cancelable': false
              });
              a.dispatchEvent(clickEvent);
            }

            function exportSvg($svgElement) {
              // remove interactable elements from nvd3 scatter graph
              $svgElement.find('.nv-point-paths').remove();
              $svgElement.find('.nv-point-clips').remove();

              //can't set svg instructions as image src directly
              var image = createImage($svgElement);
              image[0].setAttribute('crossOrigin', 'anonymous');
              image.on('load', _.partial(exportImage, image[0]));
            }

            function createImage($svgElement) {
              $svgElement.find('.nv-background')
                .attr('fill', 'white');
              $svgElement.find('.nv-axis path')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                ;
              $svgElement.find('path.nv-line')
                .attr('fill', 'none');
              d3.selectAll('.nv-point')
                .style('stroke-opacity', 0)
                .style('fill-opacity', 0);
               d3.selectAll('text')
                .attr('font-family', 'sans-serif')
                .style('font-size', '12px');

              var html = $svgElement
                .attr('height', $svgElement.height())
                .attr('width', $svgElement.width())
                .attr('version', 1.1)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('crossOrigin', 'anonymous')
                .parent()[0]
                .innerHTML;

              var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
              var img = $('<img />', {
                src: imgsrc
              });

              return img;
            }
          }
        };
      }
    ]);
});