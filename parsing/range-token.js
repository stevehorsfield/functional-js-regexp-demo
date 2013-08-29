// Dependencies

// Scope imports

// Module definition

var CharacterRangeKinds = {
    character: "character",
    range: "range"
};

var RangeModes = {
    matching: "matching",
    inverted: "inverted"
};

function RangeToken(rangeKind) {
    this.rangeKind = rangeKind;
}
RangeToken.prototype.isKind = function(rangeKind) { return this.rangeKind == rangeKind; };

RangeToken.character = function(character) {
    var result = new RangeToken(CharacterRangeKinds.character);
    result.character = character;
    return result;
};

RangeToken.range = function(characterFrom, characterTo) {
    var result = new RangeToken(CharacterRangeKinds.range);
    result.characterFrom = characterFrom;
    result.characterTo = characterTo;
    return result;
};


// Exports

exports.CharacterRangeKinds = CharacterRangeKinds;
exports.RangeModes = RangeModes;
exports.RangeToken = RangeToken;