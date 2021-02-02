import fs from 'fs';
import the_path from 'path';

let sinaSharpExample = '';


process.argv.forEach(function (val, index, array) {
    if(index === 2){
        sinaSharpExample = val;
    }
});

const TokenTypes = {
    logical : 'logical',
    arithmetic : 'arithmetic',
    separator : 'separator',
    variableTypeInt : 'variableTypeInt',
    variableTypeFloat : 'variableTypeFloat',
    variableTypeChar : 'variableTypeChar',
    possibleVariableName : 'possibleVariableName',
    VariableNameRef : 'VariableNameRef',
    iFunction : 'iFunction',
    oFunction : 'oFunction',
    conditionFunctions : 'conditionFunctions',
    int : 'int',
    float : 'float',
    char : 'char',
    string : 'string',
    variableDelimiters : 'variableDelimiters',
    ioFunctionDelimiters : 'ioFunctionDelimiters',
    bracketOpens : 'bracketOpens',
    bracketCloses : 'bracketCloses',
    parOpens : 'parOpens',
    parCloses : 'parCloses',
    curlyBracesOpens : 'curlyBracesOpens',
    curlyBracesCloses : 'curlyBracesCloses',
    incDec : 'incDec',
    end : 'end',
};
const Exceptions = {
    tokenException : 'tokenException',
};

const Transformation = {
    [TokenTypes.separator] : ',',
    [TokenTypes.logical] : {
        '&BM': '>=',
        '&K': '<',
        '&KM': '<=',
        '&MM': '==',
        '&B': '>',
    },
    [TokenTypes.arithmetic] : {
        'Jam': '+',
        'Kam': '-',
        'Zarb': '*',
        'Tagsim': '/',
        'Bagimonde': '%',
    },
    [TokenTypes.incDec] : {
        'YekiBala' : '++',
        'YekiPain' : '--'
    },
    [TokenTypes.variableTypeInt] : 'int',
    [TokenTypes.variableTypeFloat] : 'float',
    [TokenTypes.variableTypeChar] : 'char',
    [TokenTypes.bracketOpens] : '{',
    [TokenTypes.bracketCloses] : '}',
    [TokenTypes.curlyBracesOpens] : '(',
    [TokenTypes.curlyBracesCloses] : ')',
    [TokenTypes.parOpens] : '(',
    [TokenTypes.parCloses] : ')',
    [TokenTypes.variableDelimiters] : '=',
    [TokenTypes.ioFunctionDelimiters] : ';',
    [TokenTypes.iFunction] : 'scanf',
    [TokenTypes.oFunction] : 'printf',
    [TokenTypes.conditionFunctions] : {
        'agar' : 'if',
        'ta' : 'while'
    },
    [TokenTypes.possibleVariableName] : function ($i) {return $i},
    [TokenTypes.VariableNameRef] : function ($i) {return $i},
    [TokenTypes.char] : function ($i) {return $i},
    [TokenTypes.string] : function ($i) {return $i},
    [TokenTypes.int] : function ($i) {return $i},
    [TokenTypes.float] : function ($i) {return $i},
    [TokenTypes.end] : ''
};

const parse = (lexered) => {
    const readMeContents = fs.readFileSync(the_path.resolve('Readme.md'),'utf8');
    let m,rulePart;
    if ((m = /####Parsing \(Syntactical Analysis\) Rules :\s*~~~~\n(.*?)~~~~/s.exec(readMeContents)) !== null) {
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            if(groupIndex === 1) rulePart = match;
        });
    }

    let beforeRules = {};
    let regex = /Before\s*(.*?)\s*:\s?(.*)/mg;
    let lastTokenType;
    while ((m = regex.exec(rulePart)) !== null) {
        if (m.index === regex.lastIndex) {regex.lastIndex++;}
        m.forEach((match, groupIndex) => {
            if(groupIndex === 1){
                lastTokenType = match;
            }else if(groupIndex === 2){
                beforeRules = {...beforeRules,[lastTokenType] : match.replace(/(\s*)/mg,'').split(',').filter((item)=> !!item).reduce((ac,a)=>({...ac,[a]:true}),{})};
            }
        });
    }

    let afterRules = {};
    regex = /After\s*(.*?)\s*:\s?(.*)/mg;
    while ((m = regex.exec(rulePart)) !== null) {
        if (m.index === regex.lastIndex) {regex.lastIndex++;}
        m.forEach((match, groupIndex) => {
            if(groupIndex === 1){
                lastTokenType = match;
            }else if(groupIndex === 2){
                afterRules = {...afterRules,[lastTokenType] : match.replace(/(\s*)/mg,'').split(',').filter((item)=> !!item).reduce((ac,a)=>({...ac,[a]:true}),{})};
            }
        });
    }

    const rules = {
        before : beforeRules,
        after : afterRules
    };

    // lexered.forEach((currentToken,index)=>{
    //     // console.log(result.type,rules.after[result.type]);
    //     if(index + 1 !== lexered.length){
    //         const nextToken = lexered[index + 1];
    //         const rulesAfterCurrentToken = rules.after[currentToken.type];
    //         const rulesBeforeNextToken = rules.before[nextToken.type];
    //         if(!rulesAfterCurrentToken[nextToken.type] && !rulesBeforeNextToken[currentToken.type]){
    //             console.log('--------');
    //             console.log(`Error between ${currentToken.value} ${nextToken.value}`);
    //         }
    //     }
    // });

    return lexered;
};

function checkRegexExists(regex,str){
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        if(m.length > 0)return true;
    }
    return false;
}

function lexer (code) {
    return [
        ...(code.split(/\n/gm).map((line, lineNumber) => {
            return {
                lineNumber: lineNumber + 1,
                info : line.split(/(?:(?:\s+(?=(?:"(?:\\"|[^'])+"|[^"])+$))|(?:\n)|(\{|\}|\[|\]|\^|=|,|\)|\())/gm) //Separate tokens by whitespaces and ([,],{,})
                    .filter(function (t) { return t !== undefined && t.length > 0 })
                    .map(function (t) {
                        switch (t){
                            case ",":
                                return {type : TokenTypes.separator,value : t};
                            case '&BM':
                            case '&K':
                            case '&KM':
                            case '&MM':
                            case '&B':
                                return {type : TokenTypes.logical,value : t};
                            case "Jam":
                            case "Kam":
                            case "Zarb":
                            case "Tagsim":
                            case "Bagimonde":
                                return {type : TokenTypes.arithmetic,value : t};
                            case "YekiBala":
                            case "YekiPain":
                                return {type : TokenTypes.incDec,value : t};
                            case "Sahih":
                                return {type : TokenTypes.variableTypeInt,value : t};
                            case "Ashari":
                                return {type : TokenTypes.variableTypeFloat,value : t};
                            case "Harf":
                                return {type : TokenTypes.variableTypeChar,value : t};
                            case "[":
                                return {type : TokenTypes.bracketOpens,value : t};
                            case "]":
                                return {type : TokenTypes.bracketCloses,value : t};
                            case "{":
                                return {type : TokenTypes.curlyBracesOpens,value : t};
                            case "}":
                                return {type : TokenTypes.curlyBracesCloses,value : t};
                            case "(":
                                return {type : TokenTypes.parOpens,value : t};
                            case ")":
                                return {type : TokenTypes.parCloses,value : t};
                            case "=":
                                return {type : TokenTypes.variableDelimiters,value : t};
                            case "^":
                                return {type : TokenTypes.ioFunctionDelimiters,value : t};
                            case "Begir":
                                return {type : TokenTypes.iFunction,value : t};
                            case "Benevis":
                                return {type : TokenTypes.oFunction,value : t};
                        }
                        switch(true){
                            case !isNaN(t) === true:
                                if(t.indexOf('.') === -1) return {type : TokenTypes.int,value : t};
                                return {type : TokenTypes.float,value : t};
                            case checkRegexExists(/^agar$/gm,t):
                            case checkRegexExists(/^ta$/gm,t):
                                return {type : TokenTypes.conditionFunctions,value : t};
                            case checkRegexExists(/^[a-zA-Z](?:[a-z0-9A-Z])*$/,t):
                                return {type : TokenTypes.possibleVariableName,value : t};
                            case checkRegexExists(/^&[a-zA-Z](?:[a-z0-9A-Z])*$/,t):
                                return {type : TokenTypes.VariableNameRef,value : t};
                            case checkRegexExists(/^\'.\'$/,t):
                                return {type : TokenTypes.char,value : t};
                            case checkRegexExists(/^\".*\"$/,t):
                                return {type : TokenTypes.string,value : t};
                        }
                        return {
                            type : Exceptions.tokenException,
                            value : t
                        };
                    })
            }
        })),
        {info : [{type : TokenTypes.end,value : ''}]}
    ]
}

const dfaGrammars = (value) => {
    return [
        {
            initialState: ['q0'],
            acceptState: ['q2'],
            transitions: {
                'q0': {[TokenTypes.variableTypeChar] : 'q1'},
                'q1': {[TokenTypes.possibleVariableName] : 'q2'},
                'q2': {[TokenTypes.variableDelimiters] : 'q3'},
                'q3': {[TokenTypes.char] : 'q4'},
                'q4': {[TokenTypes.ioFunctionDelimiters] : 'q5'},
            }
        },
    ]
};

const pdaGrammars = (value) => {
    return [
        {
            initialState: ['q0'],
            acceptState: ['q8'],
            transitions: {
                'q0': {'end' : 'q8|z|z','variableTypeInt' : ['q1|z|z','q1|0|0'],'variableTypeFloat':['q1|z|z','q1|0|0'],'variableTypeChar':['q1|z|z','q1|0|0'],'bracketCloses':['q0|0|λ'],'oFunction':['q9|z|z','q9|0|0'],'iFunction':['q9|z|0z','q9|0|00'],'conditionFunctions':['q3|z|z','q3|0|0'],'possibleVariableName':['q2|z|z','q2|0|0]']},
                'q1': {'possibleVariableName' : ['q2|z|z|VariableDefined','q2|0|0|VariableDefined'],'int' : ['q11|z|z','q11|0|0'],'float' : ['q11|z|z','q11|0|0'],'char' : ['q11|z|z','q11|0|0']},
                'q2': {'separator' : ['q1|z|z','q1|0|0'],'ioFunctionDelimiters': ['q0|z|z','q0|0|0'],'variableDelimiters': ['q3|z|z','q3|0|0']},
                'q3': {'curlyBracesOpens':['q5|z|0z','q5|0|00'],'bracketOpens':['q5|z|0z','q5|0|00'],'ioFunctionDelimiters':['q5|z|z','q5|0|0'],'int':['q4|z|z','q4|0|0'],'char':['q4|z|z','q4|0|0'],'float':['q4|z|z','q4|0|0'],'possibleVariableName':['q4|z|z','q4|0|0']},
                'q4': {'incDec' : ['q4|z|z','q4|0|0'],'possibleVariableName':['q0|z|z','q0|0|0'],'float':['q0|z|z','q0|0|0'],'char':['q0|z|z','q0|0|0'],'int':['q0|z|z','q0|0|0'],'arithmetic':['q3|z|z','q3|0|0'],'ioFunctionDelimiters':['q0|z|z','q0|0|0'],'separator' : ['q1|z|z','q12|0|0'],'parCloses' : 'q11|0|λ'},
                'q5': {'incDec' : 'q5|0|0','parCloses' : 'q11|0|λ','curlyBracesCloses':['q5|0|λ'],'int':['q6|0|0'],'char':['q6|0|0'],'float':['q6|0|0'],'possibleVariableName':['q6|0|0'],'arithmetic':['q3|z|z','q7|0|0'],'ioFunctionDelimiters':['q0|z|z','q0|0|0'],'bracketOpens':['q0|z|0z','q0|0|00'],'separator' : ['q1|z|z','q12|0|0']},
                'q6': {'arithmetic' : ['q7|0|0'],'logical' : ['q7|0|0'],'curlyBracesCloses':'q5|0|λ'},
                'q7': {'curlyBracesOpens' : ['q5|0|00'],'possibleVariableName':['q5|0|0'],'int':['q5|0|0'],'char':['q5|0|0'],'float':'q5|0|0'},
                'q9': {'parOpens' : ['q10|z|0z','q10|0|00','q10|0|00']},
                'q10': {'string' : ['q11|z|z','q11|0|0']},
                'q11': {'parCloses' : 'q5|0|λ','separator' : ['q12|z|z','q12|0|0'],'arithmetic' : ['q12|z|z','q12|0|0'],'ioFunctionDelimiters':['q0|z|z','q0|0|0']},
                'q12': {'possibleVariableName' : ['q11|z|z','q11|0|0'],'curlyBracesOpens': ['q5|0|00','q5|z|0z'],'string': ['q11|z|z','q11|0|0'],'int' : ['q11|z|z','q11|0|0'],'char' : ['q11|z|z','q11|0|0'],'float' : ['q11|z|z','q11|0|0'],'VariableNameRef' : ['q11|0|λ']}
            }
        },
    ]
};

var variablesJustDefined = [];
var variables = [];
const pdaGetTransition = (definition,stackNow,checkThisNow,checkThisNowValue) => {
    for(const goWith in definition){
        if(checkThisNow !== goWith){continue;}
        if(Array.isArray(definition[goWith])){
            for(const d in definition[goWith]){
                var result = pdaGetTransition({[goWith] : definition[goWith][d]},stackNow,checkThisNow,checkThisNowValue);
                if(result !== null){
                    return result;
                }
            }
        }else{
            let parts = definition[goWith].split('|');
            if(parts.length === 4){
                if(variables.includes(checkThisNowValue)){
                    return 'Variable ' + checkThisNowValue + ' was previously defined!';
                }
                variablesJustDefined = [checkThisNowValue,...variablesJustDefined];
                parts = parts.filter((value, index) => index !== 3);
            }else{
                if(variablesJustDefined.length > 0){
                    if(checkThisNow === TokenTypes.ioFunctionDelimiters) {
                        variables = [...variables,...variablesJustDefined];
                        variablesJustDefined = [];
                    }
                }
                if(checkThisNow === 'possibleVariableName'){
                    if(!variables.includes(checkThisNowValue)){
                        return  checkThisNowValue + ' is not defined!';
                    }
                }else if(checkThisNow === 'VariableNameRef'){
                    if(!variables.includes(checkThisNowValue.replace(/(&?)/, ''))){
                        return 'Variable ' + checkThisNowValue + ' was not defined to be referenced!';
                    }
                }
            }
            if(parts.length !== 3){
                return null;
            }else{
                var stackTop = stackNow[stackNow.length - 1];
                if(stackTop === parts[1]){
                    var action = parts[2].split('');
                    if(action.length > 1 && action[1] === stackTop){//Add
                        return {
                            goto : parts[0],
                            stackNow : [...stackNow,action[0]]
                        }
                    }else if(action[0] === stackTop){//Nothing
                        return {
                            goto : parts[0],
                            stackNow : stackNow
                        }
                    }else if(action[0] === 'λ'){//Remove stackTop
                        return {
                            goto : parts[0],
                            stackNow : stackNow.filter(((value, index) => index !== stackNow.length - 1))
                        }
                    }else if(action[0] !== stackTop){//Replace
                        return {
                            goto : parts[0],
                            stackNow : [...stackNow.filter(((value, index) => index !== stackNow.length - 1)),action[0]]
                        }
                    }
                }
            }
        }
    }
    return null;
};

const pdaCheck = (checkThis,item,stackNow = ['z'],nodeNow = 'q0',lineNumber = 0) => {
    if(checkThis.length === 0) return {
        status : item.acceptState.indexOf(nodeNow) !== -1,
        checkThisNow : checkThisNow,
        lineNumber : lineNumber
    };
    let msg = undefined;
    let transition = null;
    var checkThisNow = checkThis[0];
    var newLineNumber = lineNumber;
    if(Number.isInteger(checkThisNow)){
        checkThisNow = checkThis[1];
        newLineNumber = checkThis[0];
    }
    transition = pdaGetTransition(item.transitions[nodeNow], stackNow,checkThisNow.type,checkThisNow.value);
    if(transition && transition.stackNow && transition.goto){
        stackNow = transition.stackNow;
        transition = transition.goto;
    }else{
        msg = transition;
        transition = undefined;
    }

    // console.log(`stack : ${stackNow}  |  ${nodeNow} ---> ${transition ? transition : 'nowhere'} on ${checkThisNow.value} of type ${checkThisNow.type} at line : ${newLineNumber}`);
    if(transition){
        return pdaCheck(checkThis.filter((item, index) => {
            if(newLineNumber !== lineNumber){
                return index !== 1 && index !== 0;
            }
            return index !== 0;
        }),item,stackNow,transition,newLineNumber)
    }
    return {
        status : item.acceptState.indexOf(nodeNow) !== -1,
        checkThisNow : checkThisNow,
        lineNumber : lineNumber,
        msg : msg
    };
};

const pdaParse = (checkThis) => {
    const grammars = pdaGrammars();
    for(const item of grammars){
        const found = item.initialState.indexOf('q0') !== -1;
        var check = pdaCheck(checkThis, item);
        if(found && check){
            return check;
        }
    }
    return false;
};

// console.log(pdaParse(['a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'a']));

const dfaCheck = (checkThis,item,nodeNow = 'q0') => {
    if(checkThis.length === 0) return item.acceptState.indexOf(nodeNow) !== -1;
    const transition = item.transitions[nodeNow][checkThis[0]];
    console.log(`${nodeNow } ---> ${transition} via ${checkThis[0]}`);
    if(transition){
        return dfaCheck(checkThis.filter((item, index) => index !== 0),item,transition)
    }
    return item.acceptState.indexOf(nodeNow) !== -1;
};

const dfaParse = (checkThis) => {
    const grammars = dfaGrammars();
    for(const item of grammars){
        const found = item.initialState.indexOf('q0') !== -1;
        if(found && dfaCheck(checkThis, item)){
            return true;
        }
    }
    return false;
};

const calculate = () => {
    let flatLex = [];
    const lexered = lexer(sinaSharpExample);
    lexered.forEach(item=>{
        if(item.lineNumber){flatLex = [...flatLex,item.lineNumber]}
        flatLex = [...flatLex,...item.info.map(item=>{
            return item
        })];
    });
    // console.log(flatLex);
    let lineNumber = 0;
    for(const t of flatLex){
        if(Number.isInteger(t)){
            lineNumber = t;
        }else if(t.type === Exceptions.tokenException){
            return {
                type : 1,
                message : `Token Exception ${t.value} : line ${lineNumber}`
            };
        }
    }
    // console.log(flatLex.filter(value => {
    //     return !Number.isInteger(value) ? value:false;
    // }).map(value => value.type).join(''));
    //parse
    if(flatLex.length > 0){
        var pdaParseResult = pdaParse(flatLex);
        if(!pdaParseResult.status){
            return {
                type : 2,
                message : pdaParseResult.msg ? pdaParseResult.msg : `Parse Exception ${pdaParseResult.checkThisNow.value} : line ${pdaParseResult.lineNumber}`,
                line : pdaParseResult.lineNumber
            };
        }
    }
    //transform
    const transformed = flatLex.map(item => {
        if (Number.isInteger(item)) return {line : item};
        var transformer = Transformation[item.type];
        if(typeof transformer === 'function'){
            return transformer(item.value);
        }else if(typeof transformer === 'object'){
            return transformer[item.value];
        }
        return transformer;
    });

    //generate
    let generated = '';
    transformed.forEach((item,index)=>{
        if(index !== 0){
            if(typeof item === 'object'){
                generated += "\n";
            }else{
                generated += item + (['scanf','if','while'].indexOf(item) === -1 ? ' ' : '');
            }
        }
    });
    return generated;
};

console.log(calculate());