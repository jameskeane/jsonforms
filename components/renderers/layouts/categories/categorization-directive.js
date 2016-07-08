var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var renderer_service_1 = require('../../renderer-service');
var abstract_layout_1 = require('../abstract-layout');
var CategorizationDirective = (function () {
    function CategorizationDirective() {
        this.restrict = 'E';
        this.templateUrl = 'categorization.html';
        this.controller = CategorizationController;
        this.controllerAs = 'vm';
    }
    return CategorizationDirective;
})();
var CategorizationController = (function (_super) {
    __extends(CategorizationController, _super);
    function CategorizationController(scope) {
        _super.call(this, scope);
    }
    CategorizationController.prototype.changeSelectedCategory = function (category) {
        this.selectedCategory = category;
    };
    CategorizationController.$inject = ['$scope'];
    return CategorizationController;
})(abstract_layout_1.AbstractLayout);
var categorizationTemplate = "<jsonforms-layout>\n    <div class=\"jsf-categorization\">\n        <div class=\"jsf-categorization-master\">\n            <ul>\n                <li ng-repeat=\"category in vm.uiSchema.elements\" \n                    ng-click=\"vm.changeSelectedCategory(category)\">\n                    <span class=\"jsf-category-entry\" \n                          ng-class=\"{'selected': category===vm.selectedCategory}\">\n                          {{category.label}}\n                    </span>\n                </li>\n            </ul>\n        </div>\n        <fieldset class=\"jsf-categorization-detail\">\n            <jsonforms-inner ng-if=\"vm.selectedCategory\" \n                             ng-repeat=\"child in vm.selectedCategory.elements\" \n                             uischema=\"child\">\n             </jsonforms-inner>\n        </fieldset>\n    </div>\n</jsonforms-layout>";
var CategorizationLayoutRendererTester = function (element, dataSchema, dataObject, pathResolver) {
    if (element.type !== 'Categorization') {
        return renderer_service_1.NOT_FITTING;
    }
    return 2;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = angular
    .module('jsonforms.renderers.layouts.categories', ['jsonforms.renderers.layouts'])
    .directive('categorization', function () { return new CategorizationDirective(); })
    .run(['RendererService', function (RendererService) {
        return RendererService.register('categorization', CategorizationLayoutRendererTester);
    }
])
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put('categorization.html', categorizationTemplate);
    }])
    .name;
//# sourceMappingURL=categorization-directive.js.map