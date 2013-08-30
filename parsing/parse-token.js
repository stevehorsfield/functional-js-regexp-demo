// Dependencies

// Scope imports

// Module definition

var ParseTokenKinds = {
    startSubPatternToken: "startSubPattern",
    subPattern: "subPattern",
    alternation: "alternation",
    option: "option",
    anyNumber: "anyNumber",
    atLeastOne: "atLeastOne",
    characterRange: "characterRange",
    anyCharacter: "anyCharacter",
    startMarker: "startMarker",
    endMarker: "endMarker",
    literal: "literal"
    };

var RangeModes = {
    matching: "matching",
    inverted: "inverted"
};


function ParseToken(tokenKind) {
    this.tokenKind = tokenKind;
}
ParseToken.prototype.isKind = function(tokenKind) { return this.tokenKind === tokenKind; };

ParseToken.startSubPatternToken = function() { return new ParseToken(ParseTokenKinds.startSubPatternToken); };
ParseToken.anyCharacter = function() { return new ParseToken(ParseTokenKinds.anyCharacter); };
ParseToken.startMarker = function() { return new ParseToken(ParseTokenKinds.startMarker); };
ParseToken.endMarker = function() { return new ParseToken(ParseTokenKinds.endMarker); };

ParseToken.subPattern = function(tokens) { 
    var result = new ParseToken(ParseTokenKinds.subPattern); 
    result.tokens = tokens;
    return result;
};

ParseToken.alternation = function(alternationList) { 
    var result = new ParseToken(ParseTokenKinds.alternation); 
    result.alternationList = alternationList;
    return result;
};
ParseToken.option = function(token) { 
    var result = new ParseToken(ParseTokenKinds.option); 
    result.token = token;
    return result;
};
ParseToken.anyNumber = function(token) { 
    var result = new ParseToken(ParseTokenKinds.anyNumber); 
    result.token = token;
    return result;
};
ParseToken.atLeastOne = function(token) { 
    var result = new ParseToken(ParseTokenKinds.atLeastOne); 
    result.token = token;
    return result;
};
ParseToken.characterRange = function(rangeMode, rangeList) { 
    var result = new ParseToken(ParseTokenKinds.characterRange); 
    result.rangeMode = rangeMode;
    result.rangeList = rangeList;
    return result;
};
ParseToken.literal = function(character) { 
    var result = new ParseToken(ParseTokenKinds.literal); 
    result.character = character;
    return result;
};

// Exports

exports.ParseTokenKinds = ParseTokenKinds;
exports.ParseToken = ParseToken;
exports.RangeModes = RangeModes;
