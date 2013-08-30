// Dependencies

var HexModule = require("../util/hex.js");
var RangeTokenModule = require("./range-token.js");
var ParseTokenModle = require("./parse-token.js");

// Scope imports

var hex4 = HexModule.hex4;
var hex8 = HexModule.hex8;
var hex16 = HexModule.hex16;
var RangeToken = RangeTokenModule.RangeToken;
var CharacterRangeKinds = RangeTokenModule.CharacterRangeKinds;
var ParseTokenKinds = ParseTokenModle.ParseTokenKinds;
var RangeModes = ParseTokenModle.RangeModes;
var ParseToken = ParseTokenModle.ParseToken;

// Module definition

function parseEscapeSequence(input) {
    var char0 = input.charAt(0);
    var result = { input: input.slice(1), token: undefined };
    var mode = 0; // default case for literal, 1 = ascii char, 2 = unicode char
    switch (char0)
    {
        case '\\': break;
        case '[': break;
        case ']': break;
        case '^': break;
        case '$': break;
        case '*': break;
        case '+': break;
        case '?': break;
        case '|': break;
        case '(': break;
        case ')': break;
        case '.': break;
        case 't': char0 = '\t'; break;
        case 'n': char0 = '\n'; break;
        case 'r': char0 = '\r'; break;
        case 'x': mode = 1; break;
        case 'u': mode = 2; break;
        case 'X': mode = 1; break;
        case 'U': mode = 2; break;
            
        default:
            return undefined;
    }
    var char1, char2, char3, char4;
    switch (mode)
    {
        case 0: break;
        case 1: 
            char1 = input.charAt(1), char2 = input.charAt(2);
            char0 = String.fromCharCode(hex8(char1, char2));
            result.input = input.slice(3);
            break;
        case 2:
            char1 = input.charAt(1), char2 = input.charAt(2), char3 = input.charAt(3), char4 = input.charAt(4);
            char0 = String.fromCharCode(hex16(char1, char2, char3, char4));
            result.input = input.slice(5);
            break;
        default:
            return undefined;
    }
    result.token = ParseToken.literal(char0);
    
    return result;
}

function parseRangeEscapeSequence(input) {
    var char0 = input.charAt(0);
    var result = { input: input.slice(1), character: undefined };
    var mode = 0; // default case for literal, 1 = ascii char, 2 = unicode char
    switch (char0)
    {
        case '\\': break;
        case ']': break;
        case '^': break;
        case '-': break;
        case 't': char0 = '\t'; break;
        case 'n': char0 = '\n'; break;
        case 'r': char0 = '\r'; break;
        case 'x': mode = 1; break;
        case 'u': mode = 2; break;
        case 'X': mode = 1; break;
        case 'U': mode = 2; break;
            
        default:
            return undefined;
    }
    var char1, char2, char3, char4;
    switch (mode)
    {
        case 0: break;
        case 1: 
            char1 = input.charAt(1), char2 = input.charAt(2);
            char0 = String.fromCharCode(hex8(char1, char2));
            result.input = input.slice(3);
            break;
        case 2:
            char1 = input.charAt(1), char2 = input.charAt(2), char3 = input.charAt(3), char4 = input.charAt(4);
            char0 = String.fromCharCode(hex16(char1, char2, char3, char4));
            result.input = input.slice(5);
            break;
        default:
            return undefined;
    }
    result.character = char0;
    
    return result;
}

function parseRangeBody1(finisher, terms, current, input) {
    function unclosed() { throw "unclosed character range expression"; }
    
    if (input === "") unclosed();
    
    var char0, char1, char2, temp, temp2;
    
    char0 = input.charAt(0);
    
    switch (char0)
    {
    case ']':    
        terms.push(RangeToken.character(current));
        return finisher(terms, input.slice(1));
    case '-':
        char1 = input.charAt(1);
        
        switch (char1)
        {
            case ']':
                terms.push(RangeToken.character(current));
                terms.push(RangeToken.character(char0));
                return finisher(terms, input.slice(2));
                
            case '\\':
                temp = parseRangeEscapeSequence(input.slice(2));
                
                if (temp.input === "") unclosed();
                
                terms.push(RangeToken.range(current, temp.character));
                
                char0 = temp.input.charAt(0);
                
                switch (char0)
                {
                    case ']': 
                        return finisher(terms, temp.input);
                    case '\\':
                        temp2 = parseRangeEscapeSequence(temp.input);
                        return parseRangeBody1(finisher, terms, temp2.character, temp2.input);
                    default:
                        return parseRangeBody1(finisher, terms, char0, temp.input.slice(1));
                }
                break; // never hit
            
            default:
                char2 = input.charAt(2);
                terms.push(RangeToken.range(current, char1));
                switch (char2)
                {
                    case ']':
                        return finisher(terms, input.slice(3));
                    case '\\':
                        temp = parseRangeEscapeSequence(input.slice(3));
                        return parseRangeBody1(finisher, terms, temp.character, temp.input);
                    default:
                        return parseRangeBody1(finisher, terms, char2, input.slice(3));
                }
        }
        break; // never hit
    case '\\':
        temp = parseRangeEscapeSequence(input.slice(1));
        terms.push(RangeToken.character(current));
        return parseRangeBody1(finisher, terms, temp.character, temp.input);
    default:
        terms.push(RangeToken.character(current));
        return parseRangeBody1(finisher, terms, char0, input.slice(1));
    }
}

function parseRangeBody(finisher, input) {
    if (input === "") throw "unclosed character range expression";
    
    var char0, char1, temp;
    char0 = input.charAt(0);
    switch (char0)
    {
        case ']':
            char1 = input.charAt(1);
            if (char1 === ']') return finisher([ RangeToken.character(']')], input.slice(2));
            else return parseRangeBody1(finisher, [], ']', input.slice(1));
            break; // never hit
        case '-':
            return parseRangeBody1(finisher, [], '-', input.slice(1));
        case '\\':
            temp = parseRangeEscapeSequence(input.slice(1));
            return parseRangeBody1(finisher, [], temp.character, temp.input);
        default:
            return parseRangeBody1(finisher, [], char0, input.slice(1));
    }
}

function buildInvertedCharacterRange(terms, input) {
    return { token: ParseToken.characterRange(RangeModes.inverted, terms), input: input };
}
function buildMatchingCharacterRange(terms, input) {
    return { token: ParseToken.characterRange(RangeModes.matching, terms), input: input };
}

function parseRange(input) {
    var char0 = input.charAt(0);
    if (char0 === '^') return parseRangeBody(buildInvertedCharacterRange, input.slice(1));
    return parseRangeBody(buildMatchingCharacterRange, input);
}

function testMultiplicityToken(context) {
    function error() { throw "invalid position for multiplicity character (?, +, *)"; }
    function testValidity(token) {
        if (token.isKind(ParseTokenKinds.subPattern)) return;
        if (token.isKind(ParseTokenKinds.literal)) return;
        if (token.isKind(ParseTokenKinds.characterRange)) return;
        if (token.isKind(ParseTokenKinds.anyCharacter)) return;
        error();
    }
    if (context.length === 0) error();
    
    var token = context[context.length - 1];
    testValidity(token);
}

function parseFragment(pattern, context) {
    function subsumeAlternation() {
        var currentAltGroup = context[context.length - 2][0];
        var currentAlternationList = currentAltGroup.alternationList;
        currentAlternationList.push(context.pop());
        return context;
    }
            
    if (pattern === "") {
        if (context.length < 2) return context;
        var prior = context[context.length - 2];
        if (prior.length > 0) {
            if (prior[prior.length - 1].isKind(ParseTokenKinds.alternation))
            {
                return subsumeAlternation();
            }
        }
        return context;
    }
    
    if (context.length === 0) throw "invalid input";
    
    var c = context[context.length - 1];
    var p = pattern.charAt(0);
    var ps = pattern.slice(1);
    
    function processRange() {
        var temp = parseRange(ps);
        c.push(temp.token);
        return parseFragment(temp.input, context);
    }
    function processOpenGroup() {
        c.push(ParseToken.startSubPatternToken());
        context.push([]);
        return parseFragment(ps, context);
    }
    function processCloseGroup() {
        if (context.length < 2) throw "not in a sub expression";
        var prior = context[context.length - 2];
        if (prior[prior.length - 1].isKind(ParseTokenKinds.startSubPatternToken)) {
            var previous = ParseToken.subPattern(context.pop());
            prior.pop();
            prior.push(previous);
            return parseFragment(ps, context);
        }
        if (context.length < 3) throw "unexpected error";
        if (prior.length !== 1) throw "unexpected error";
        if (! prior[0].isKind(ParseTokenKinds.alternation)) throw "unexpected error";
        var prior2 = context[context.length - 3];
        if (prior2.length < 1) throw "unexpected error";
        if (! prior2[prior2.length - 1].isKind(ParseTokenKinds.startSubPatternToken)) throw "unexpected error";
        var alternation = prior[0];
        var alternationList = alternation.alternationList;
        alternationList.push(context.pop()); // move the current tokens to the alternation
        context.pop(); // remove the alternation, prior2 at top
        prior2.pop(); // remove the start group token
        prior2.push(ParseToken.subPattern([alternation]));
        
        return parseFragment(ps, context);
    }
    function processEscapeSequence() {
        var temp = parseEscapeSequence(ps);
        c.push(temp.token);
        return parseFragment(temp.input, context);
    }
    function processAlternation() {
        var alternation;
        if (context.length == 1) {
            alternation = ParseToken.alternation([context.pop()]);
            context.push([alternation]);
            context.push([]);
            return parseFragment(ps, context);
        }
        var prior = context[context.length - 2];
        if (prior.length === 1)
        {
            if (prior[0].isKind(ParseTokenKinds.alternation)) {
                alternation = prior[0];
                alternation.alternationList.push(context.pop());
                context.push([]);
                return parseFragment(ps, context);
            }
        }
        context.push([ParseToken.alternation([context.pop()])]);
        context.push([]);
        return parseFragment(ps, context);
    }
    
    switch (p)
    {
        case '[':
            return processRange();
        case '(':
            return processOpenGroup();
        case ')':
            return processCloseGroup();
        case '\\':
            return processEscapeSequence();
        case '|':
            return processAlternation();
        case '?':
            testMultiplicityToken(c);
            c.push(ParseToken.option(c.pop()));
            return parseFragment(ps, context);
        case '*':
            testMultiplicityToken(c);
            c.push(ParseToken.anyNumber(c.pop()));
            return parseFragment(ps, context);
        case '+':
            testMultiplicityToken(c);
            c.push(ParseToken.atLeastOne(c.pop()));
            return parseFragment(ps, context);
        case '.':
            c.push(ParseToken.anyCharacter());
            return parseFragment(ps, context);
        case '^':
            c.push(ParseToken.startMarker());
            return parseFragment(ps, context);
        case '$':
            c.push(ParseToken.endMarker());
            return parseFragment(ps, context);
        default:
            c.push(ParseToken.literal(p));
            return parseFragment(ps, context);
    }
    
}

function parse(pattern) {
    var temp = parseFragment(pattern, [ [] ]);
    return temp.pop();
}

function parselog(pattern) {
    console.log(JSON.stringify(parse(pattern),null,2));
}

// Exports

exports.parse = parse;
