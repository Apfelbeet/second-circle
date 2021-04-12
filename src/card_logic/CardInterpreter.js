import { actionFromRaw } from "./actions/Action";

const ACTION_NEXT = {
    "type": "nextPlayer",
}

/**
 * translates the raw object of a card to a clean version, that meet some assumptions.
 * - frequency is always defined and between 0 and 1 (in case of an invalid input the value is 0)
 * - appearance.upper/.lower is alsways definded and betwenn 0 and 1
 *  (in case if an invalid input lower = 0 and upper = 1)
 * - there is atleast one option (to continue the game )and if there are more options, a skip-option will be added.
 *
 * All options and actions are resolved. That means they will collect all informations they need to be runned.
 * If an option/action couldn't be resolved, it will be filtered out.
 *
 * cardRaw:
 * {
 *  "text": string,
 *  "frequency": number,
 *  "appearamce": {"lower":0, "upper": 1},
 *  "options": [option],
 *  "actions": [action],
 *  "variables": [variable],
 * }
 *
 * @param {*} cardRaw json input from deck
 * @param {*} globalState current globalState
 * @param {*} source player to whim this card is assigned
 * @returns {*} resolved card. undefinded if an error occures
 */
export function resolveCard(cardRaw, globalState, source) {
    //check text
    if (cardRaw.text === undefined || typeof cardRaw.text !== "string") {
        console.error("couldn't resolve: " + cardRaw);
        return undefined;
    }

    console.log("Start resolving: " + cardRaw.text);

    //check frequency:
    //- is defined
    //- 0 <= x <= 1
    let fre;
    if (
        cardRaw.frequency === undefined ||
        typeof cardRaw.frequency !== "number"
    ) {
        console.warn("invalid frequency in " + cardRaw);
        fre = 0;
    } else fre = Math.min(Math.max(cardRaw.frequency, 0), 1);

    //check appearance
    //- is defined with right types
    //- 0 <= upper/lower <= 1
    let app;
    if (
        cardRaw.appearance === undefined ||
        cardRaw.appearance.lower === undefined ||
        cardRaw.appearance.upper === undefined ||
        typeof cardRaw.appearance.lower !== "number" ||
        typeof cardRaw.appearance.upper !== "number"
    ) {
        console.warn("invalid appearance in" + cardRaw);
        app = { lower: 0, upper: 1 };
    } else {
        app = {
            lower: Math.min(Math.max(cardRaw.appearance, 0), 1),
            upper: Math.min(Math.max(cardRaw.appearance, 0), 1),
        };
    }

    //check options
    //- is defined with right types
    //- add "next" if empty
    //- else add "skip"
    let opt;

    if (cardRaw.options === undefined || cardRaw.options === 0) {
        opt = [newOption("next", [ACTION_NEXT])];
    } else {
        opt = [...cardRaw.options, newOption("skip", [ACTION_NEXT])];
    }

    //resolve variables

    let variables;

    if (cardRaw.variables === undefined) {
        variables = [];
    } else {
        variables = resolveVariables(globalState, cardRaw.variables, source);
    }

    let actions;

    if (cardRaw.actions === undefined) {
        actions = [];
    } else {
        actions = [...cardRaw.actions];
    }

    return {
        text: resolveText(cardRaw.text, variables),
        options: resolveOptions(globalState, opt, source, variables),
        actions: resolveActions(globalState, actions, source, variables),
        frequency: fre,
        appearance: app,
        source: source,
    };
}

/**
 * Create new option that can be used in a card.
 * The option isn't resolved.
 *
 * @param {*} text text of the option
 * @param {*} actions actions the options will have (default empty)
 * @returns option object
 */
function newOption(text, actions = []) {
    return {
        text: text,
        actions: actions,
    };
}

function getVariable(name, variables) {
    const variable = variables.find((v) => v.name === name);
    if (variable === undefined) {
        console.error("can't find a variable \"" + name);
    }
    return variable;
}

function resolveText(text, variables) {
    const findPlaceholder = /<(\w)+>/g;

    const newText = text.replace(findPlaceholder, (match) => {
        const varName = match.substring(1, match.length - 1);
        const variable = getVariable(varName, variables);
        let t = varName;
        if (variable !== undefined) {
            t = variable.string;
        }

        return t;
    });

    return newText;
}

/**
 * Resolve a list of options.
 *
 * @param {*} globalState
 * @param {*} options
 * @param {*} source
 * @returns
 */
function resolveOptions(globalState, options, source, variables) {
    return options === undefined
        ? []
        : options
              .map((o) => resolveOption(globalState, o, source, variables))
              .filter((o) => o !== undefined);
}

/**
 * Resolve option:
 *  - resolve all actions
 *
 * option:
 * {
 *  "text": string,
 *  "actions": [action]
 * }
 *
 * @param {*} globalState
 * @param {*} option
 * @param {*} source
 * @returns
 */
function resolveOption(globalState, option, source, variables) {
    if (option.text === undefined) return undefined;

    let act = option.actions;
    if (act === undefined || act.length === 0) {
        act = [ACTION_NEXT];
    }

    return {
        text: resolveText(option.text, variables),
        actions: resolveActions(globalState, act, source, variables),
    };
}

export function runOption(globalState, setGlobalState ,cardActions, option) {
    let x = runActions(globalState, setGlobalState, cardActions);
    x = runActions(x, setGlobalState, option.actions);
    return x;
}

/**
 *
 * @param {*} globalState
 * @param {*} actions
 * @param {*} source
 * @returns
 */
function resolveActions(globalState, actions, source, variables) {
    return actions === undefined
        ? []
        : actions
              .map((a) => actionFromRaw(a, source, variables))
              .filter((a) => a !== undefined)
              .map((a) => {
                  a.resolve(globalState);
                  return a;
              });
}

export function runActions(globalState, setGlobalState, actions) {
    return actions.reduce(
        (state, nextCard) => nextCard.run(state, setGlobalState),
        globalState
    );
}

export function resolveSelectors(globalState, selectors, source, variables) {
    if (selectors === undefined) {
        return [];
    } else if (selectors.type === "variable") {
        const variable = getVariable(selectors.name, variables)
        return variable === undefined ? [] : variable.value;
    }

    const list = [];
    selectors
        .map((s) => resolveSelector(globalState, s, source, variables))
        .filter((s) => s !== undefined)
        .flat()
        .forEach((x) => {
            if (!list.includes(x)) list.push(x);
        });
    return list;
}

/**
 * selector
 * {
 *  "type": {"all"|"self"}
 *  "excluded": [selector]
 * }
 *
 * @param {*} globalState
 * @param {*} selector
 * @param {*} source
 * @returns
 */
export function resolveSelector(globalState, selector, source, varibales = []) {
    const invalidArguments = () => {
        console.error("invalid arguments in selector.");
    }
    
    if (selector === undefined || selector.type === undefined) {
        console.error("invalid selector: " + selector);
        return undefined;
    }

    const excluded =
        selector.excluded === undefined
            ? []
            : resolveSelectors(
                  globalState,
                  selector.excluded,
                  source,
                  varibales
              );

    let unfiltered = [];

    switch (selector.type) {
        /**
         * {
         *  "type": "all",
         *  "excluded": [selector]
         * }
         */
        case "all":
            unfiltered = globalState.players.map((p) => p.id);
            break;

        /**
         * "type": "self",
         * "excluded": [selector]
         */
        case "self":
            unfiltered = [source.id];
            break;

        /**
         *  "type": "firstElementFromSelectors",
         *  "excluded": [selector],
         *  "selectors": [selector]
         */
        case "firstElementFromSelectors":
            const s =
                selector.selectors === undefined
                    ? []
                    : resolveSelectors(
                          globalState,
                          selector.selectors,
                          source,
                          varibales
                      );
            if (s.length > 1) {
                unfiltered = [s[0]];
            } else {
                unfiltered = s;
            }
            break;

        /**
         *  "type": "firstElementFromSelectors",
         *  "excluded": [selector],
         *  "selectors": [selector]
         */
        case "randomOrderOfSelectors":
            const resSelectors =
                selector.selectors === undefined
                    ? []
                    : resolveSelectors(
                          globalState,
                          selector.selectors,
                          source,
                          varibales
                      );

            for (let i = resSelectors.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * resSelectors.length);
                [resSelectors[i], resSelectors[j]] = [
                    resSelectors[j],
                    resSelectors[i],
                ];
            }

            unfiltered = resSelectors;
            break;

        /**
         * "type": "randomPlayer"
         * "excluded": [selector]
         * ["self": boolean] = true
         */
        case "randomPlayer":
            let self = selector.self;
            if (self === undefined || typeof self != "boolean") {
                self = true;
            }

            const internSelector = [
                {
                    type: "firstElementFromSelectors",
                    selectors: [
                        {
                            type: "randomOrderOfSelectors",
                            selectors: [
                                {
                                    type: "all",
                                },
                            ],
                            excluded: !self
                                ? [
                                      {
                                          type: "self",
                                      },
                                  ]
                                : [],
                        },
                    ],
                },
            ];
            unfiltered = resolveSelectors(
                globalState,
                internSelector,
                source,
                varibales
            );
            break;
        
        /**
         * "type": "indexOffset",
         * "excluded": [selector],
         * "offset": number,
         * "selectors": [selector], 
         */
        case "indexOffset":
            if ((typeof selector.offset) !== "number" || (typeof selector.selectors) !== "object") {
                invalidArguments();
                unfiltered = [];
            } else {
                const offset = resolveVariableInput(selector.offset, varibales, 0);
                const sels = resolveSelectors(globalState, selector.selectors, source, varibales);
                
                unfiltered = sels.map(s => {
                    const playerIndex = globalState.getIndexFromId(s);
                    if (playerIndex === undefined) {
                        return undefined;
                    } else {
                        return globalState.players[(playerIndex + offset) % globalState.players.length].id;
                    }
                }).filter(s => s !== undefined);
            }
            break;
        
        /**
         * "type": "sameSqaure",
         * "excluded": [selector],
         * "selectors": [selector], 
         */
        case "sameSquare":
            
            const sameSquareSelectors = resolveSelectors(globalState, selector.selectors, source, varibales);

            unfiltered = globalState.players
                .filter((player) => sameSquareSelectors.find((s) => globalState.getPlayerById(s).position === player.position) !== undefined)
                .map(p => p.id);

            break;



        default:
            console.warn("selector with unknown type");
            break;
    }

    return unfiltered.filter((id) => !excluded.includes(id));
}

function resolveVariables(globalState, variables, source) {
    return variables
        .map((v) => resolveVariable(globalState, v, source))
        .filter((v) => v !== undefined);
}

/**
 * variable:
 * {
 *  "name": string
 *  "type": {"randomInteger"|"selectors"}
 * }
 *
 * @param {*} globalState
 * @param {*} variable
 * @param {*} source
 */
function resolveVariable(globalState, variable, source) {
    const invalidArgument = () => {
        console.error("variable with invalid arguments: " + variable);
    };

    if (
        variable === undefined ||
        variable.type === undefined ||
        variable.name === undefined
    ) {
        console.error("couldn't decode variable: " + variable);
        return undefined;
    }

    switch (variable.type) {
        /**
         * {
         * "name": string
         * "type": "randomInteger"
         * "range": {"top": number, "bottom": number}
         * }
         */
        case "randomInteger":
            let range = variable.range;
            if (
                range === undefined ||
                range.top === undefined ||
                range.bottom === undefined ||
                typeof range.top !== "number" ||
                typeof range.bottom !== "number"
            ) {
                invalidArgument();
            } else {
                const val =
                    Math.floor(Math.random() * (range.top - range.bottom + 1)) +
                    range.bottom;
                return {
                    name: variable.name,
                    value: val,
                    string: val.toString(),
                };
            }
            break;

        /**
         * {
         * "name": string,
         * "type": "selectors",
         * "selectors": [selector]
         * }
         */
        case "selectors":
            if (variable.selectors === undefined) {
                invalidArgument();
            } else {
                const val = resolveSelectors(
                    globalState,
                    variable.selectors,
                    source
                );

                let asString;

                if (val.length > 0) {
                    asString =
                        val === undefined
                            ? "undefined"
                            : val.reduce((a, b) => a + ", " + globalState.getPlayerById(b).name, "").substring(2);
                } else {
                    asString = "(empty)";
                }

                return {
                    name: variable.name,
                    value: val,
                    string: asString,
                };
            }
            break;
        default:
            console.error("unkown variable type");
            break;
    }
}

export function resolveVariableInput(input, variables, defaultValue) {
    if (typeof input === "object" && input.type === "variable") {
        const variable = getVariable(input.name, variables);

        let variableValue;
        if (variable === undefined) {
            variableValue = defaultValue
        } else {
            variableValue = variable.value;
        }

        return variableValue === undefined ? defaultValue : variableValue;
    } else if (input === undefined) {
        return defaultValue;
    } else {
        return input;
    }
}
