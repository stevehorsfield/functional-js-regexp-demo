function ParserCtrl($scope, $http, $sce) {

    $scope.model = {
        pattern: "",
        parsedPattern: "Not yet parsed",
        visualPattern: "",
        active: false,
        testValue: "Test value"
    };
    
    $scope.update = function() {
        if ($scope.model.active) return;
        $scope.model.active = true;
        $scope.parsedPattern = "Testing with '" + $scope.model.pattern + "'";
        $http.get('../regexp/parse/' + encodeURIComponent($scope.model.pattern))
            .success(function(data, status, headers, config) {
                $scope.model.parsedPattern = data;
                $scope.model.visualPattern = $scope.visualise(data);
                $scope.model.active = false;
            }).error(function(data, status, headers, config) {
                $scope.model.parsedPattern = "Error!";
                $scope.model.visualPattern = "";
                $scope.model.active = false;
            });
    };
    
    $scope.visualise = function(data) {
        
        function range(token) {
            var result = "<div style='margin-left: 30px'>";
            
            result += "mode: " + token.rangeMode;
            var rangeList = token.rangeList;
            
            for (var i = 0; i < rangeList.length; ++i) {
                var item = rangeList[i];
                switch (item.rangeKind) {
                    case "character":
                        result += "<p>'" + item.character + "'</p>";
                        break;
                    case "range":
                        result += "<p>'" + item.characterFrom + "' to '" + item.characterTo + "'</p>";
                        break;
                }
            }
            
            result += "</div>";
            
            return result;
            
        }
        
        function next(current) {
            if (! angular.isArray(data)) return "";
            
            var result = "<div style='margin-left: 30px; border-left: 1px solid silver; padding-left:10px;'>";
            for (var i = 0; i < current.length; ++i) {
                var item = current[i];
                if (! angular.isObject(item)) continue;
                switch (item.tokenKind) {
                    case "literal":
                        result += "<p>" + item.tokenKind + " '" + item.character + "'</p>";
                        break;
                    case "subPattern":
                        result += "<p>group</p>";
                        result += next(item.tokens);
                        break;
                    case "alternation":
                        result += "<p>alternation</p>";
                        for (var j = 0; j < item.alternationList.length; ++j)
                        {
                             result += "<div style='margin-left: 30px'>";
                             result += "<p>alternation branch " + (j + 1) + "</p>";
                             result += next(item.alternationList[j]);
                             result += "</div>";
                        }
                        break;
                    case "option":
                        result += "<p>option</p>";
                        result += next([item.token]);
                        break;
                    case "anyNumber":
                        result += "<p>any number</p>";
                        result += next([item.token]);
                        break;
                    case "atLeastOne":
                        result += "<p>at least one</p>";
                        result += next([item.token]);
                        break;
                    case "characterRange":
                        result += "<p>character range specification</p>";
                        result += range(item);
                        break;
                    case "anyCharacter":
                        result += "<p>any character</p>";
                        break;
                    case "startMarker":
                        result += "<p>START</p>";
                        break;
                    case "endMarker":
                        result += "<p>END</p>";
                        break;

                    default: 
                        result += "<p>" + item.tokenKind + "</p>";
                        break;
                }
            }
            result += "</div>";
            return result;
        }
        
        return $sce.trustAsHtml(next(data));
    };

}

angular.module('parser', ['ng', 'ngSanitize']);
