/**
 * CardInterpreter provides bunch of function to decode/resolve cards to enable embedding them into the game.
 * A card is usually stored in a deck. To understand the structure of the deck, you want to look into the Deck file.
 * The CardInterpreter is only responsible for the individual card.
 *
 * A unresolved card (raw input) is a json-object with the following strutcture:
 * {
 *      //The text that will be displayed on the card.
 *      //It can contain variables. For further informations look at the resolveText() function.
 *      "text": {string}
 *
 *      //The frequency is used from the deck to control the distribution of the cards.
 *      //A higher number will increase the chances to appear.
 *      "frequency": {0-1}
 *
 *      //Appearance controls where the card is allowed to appear.
 *      //lower and upper are the lower and upper bound in percent.
 *      //(0-1 => the card can appear everywhere. 0.5-1 => the card appears only in the upper half)
 *      "appearance": {{"lower": 0-1, "upper": 0-1}}
 *
 *      //options are a more complex structure, the next passage explains their structure and purpose.
 *      //options is a list of options the player will see next to the card.
 *      //Non empty list will be extended with an extra "skip" option.
 *      //Empty or undefined lists will be replaced with a list with only a "next" option.
 *      "options": [option]
 *
 *      //actions are a more complex structure, an extra passage explains their structure and purpose.
 *      //actions is a list of events that will happen if any option is excuted. (=> they will always be executed)
 *      "actions": [action]
 *
 *      //variables are a more complex structure, an extra passage explains their structure and purpose.
 *      //variables are a way to generate data and use them at other points in the card.
 *      //Example: You want to display a number based on the Gamestate. In the text you can then reference the variable
 *      "variables": [variables]
 * }
 *
 *
 * ---
 * Option
 * ---
 *
 * An option will be displayed next to the card. The user can choose one option.
 * Structure of an Option
 * {
 *      //The text will be display on the button of this option. Like the text of a card, it can contain variables.
 *      "text": {string}
 *
 *      //Like the card itself each option has a own list of actions, that will be executed on top of the general actions of this card.
 *      "actions": [action]
 * }
 *
 * A option can pass two phases:
 * 1. Resolve: Resolves the text and the actions. (Every option will enter this phase)
 * 2. Run: Runs all actions that belong to this option. (Only selected options will enter this phase)
 *
 * ---
 * Action
 * ---
 *
 * An action is an event that will change the state of the game.
 * Any card can have actions (general and/or special ones for each option) that will be executed after the user choose an option.
 * There are multiple types of actions, but every unresolved/raw action ist based on this structure:
 * {
 *      //Name of the type (see list below)
 *      "type": {string}
 * }
 *
 * A action cann pass two phases:
 * 1. Resolve: Gathers als informations of the current gamestate it needs to run the action. (e.g. resolving selectors)
 * 2. Run: Perfroms the action and changes the current gamestate.
 *
 * List of all types of actions and their sturcutre:
 *
 * "move": Moves all selected players by an specified offset relative to their current position.
 * (postions out of bound will be replaced by the min/max value)
 * {
 *      "type": "move",
 *      "selectors" [selectors],
 *      "offset": {number}
 * }
 *
 * "moveBack": Like "move", but the offset is inverted. ("move" with offset:=-2 = "moveBack" with offset:=2)
 *
 * "nextPlayer": This action will change the current player to the next player on turn.
 * {
 *      "type": "nextPlayer"
 * }
 *
 * ---
 * Selectors
 * ---
 *
 * Like actions there are multiple types of selectors. An selector is term for set of players you want to determine.
 * e.g. some actions take a list of selectors to know on which players they have to perform the action.
 * The elements of a selector are distinct, but may have a specific order.
 * The basic sturtucture is:
 * {
 *      //name of the type
 *      "type": {string}
 *
 *      //Every selector allows a set of blacklistet players, that will be excluded by this selector.
 *      //This set is itself a selector. This way you can construct complex sets with only basic selctors.
 *      "excluded": [selector]
 * }
 *
 * List of all types of selectors:
 * "all": All players (no extra syntax)
 *
 * "self": The source of that card. (no extra syntax)
 *
 * "firstElementFromSelectors": Extracts the first player from selectors.
 * {
 *      ...
 *      //The selecors you want the first element of.
 *      "selectors": [selctor]
 * }
 *
 * "randomOrderOfSelectors": Shuffle the order of the elements from selctors.
 * {
 *      ...
 *      //The selecors you want to shuffle.
 *      "selectors": [selctor]
 * }
 *
 * "randomPlayer": Gives a single random player.
 * {
 *      ...
 *      //(default value = true) If true the source is included.
 *      ["self": {boolean}] = true
 * }
 *
 * "indexOffset": select players relative to their order in the player list.
 * {
 *      ...
 *      //the offset of the position in the player list.
 *      offset: {number},
 *
 *      //set of players as "starting point" for the offset
 *      selectors: [selectors]
 * }
 *
 * "sameSquare": all players on the same square.
 * {
 *      ...
 *      //Select all players, that are on the same square as the players in this selctor.
 *      selectors: [selector]
 * }
 *
 * ---
 * Variables
 * ---
 *
 * Variables are a way to gather some informations of the gamestate and deploy those at different points of the card.
 * Like selectors or actions they have multiple types too.
 * Basic structure:
 * {
 *      //To identify the variable.
 *      "name": {string}
 *
 *      //Type of the variable.
 *      "type": {string}
 * }
 *
 * List of all types of variables:
 * "randomInteger": Random integer in a range
 *
 * {
 *      ...
 *      //The range of the random number.
 *      "range": {"bottom": number, "top": number}
 * }
 *
 * "selectors": Allows to have a list of selectors as variable
 * {
 *      ...
 *      //The range of the random number.
 *      "selectors": [selctor]
 * }
 * 
 * "randomStringFromList": Picks a random string out of a list.
 * {
 *      ...
 *      //List of strings
 *      "strings": [string]
 * }
 *
 * Resolve: A resolved variable has this structure:
 * {
 *      //same name like unresolved
 *      "name": {string}
 *
 *      //the actual value of the variable
 *      "value": {*}
 *
 *      //representing the value as string
 *      "string": {string}
 * }
 *
 * If you want to use a variable you can use the following structure instead of the actual strucutre you would use:
 * {
 *      "type": "variable"
 *
 *      //the name of the variable.
 *      "name": {string}
 * }
 *
 * If you want to use a variable in a text, you can write "<variableName>" at any position in a text.
 *
 */

import { actionFromRaw } from "./Action";
import { shuffleList } from "../util/util";
import { getVariable } from "./CardUtil";

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
 *  "appearance": {"lower":0, "upper": 1},
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

    //resolve variables
    const variables = resolveVariables(globalState, cardRaw.variables, source);

    const actions = [...cardRaw.actions];

    return {
        text: resolveText(cardRaw.text, variables),
        options: resolveOptions(globalState, cardRaw.options, actions, source, variables),
        actions: resolveActions(globalState, actions, source, variables),
        frequency: cardRaw.frequency,
        appearance: cardRaw.appearance,
        source: source,
    };
}

/**
 * Replaces all variables in the text. A variable is encoded as a text seqment of the form: "<variableName>"
 * Example: "<a>b c" with a := "z" will resolve to "zb c"
 *
 * @param {string} text: unresolved input
 * @param {[*]} variables: List of all variables
 * @returns {string}
 */
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
 * @param {*} options list of unresolved options.
 * @param {*} source player who started the resolve process of this card.
 * @returns list of resolved options.
 */
function resolveOptions(globalState, options, cardActions, source, variables) {
    return options
        .map((o) =>
            resolveOption(globalState, o, cardActions, source, variables)
        )
        .filter((o) => o !== undefined);
}

/**
 * Resolve option:
 *  - resolve all actions
 *  - resolve variables in text to display
 *
 * When the list of actions is undefined, a default action will be added, that will skip to the next player.
 * If you do not want to perform any action at all, then you must pass an empty list.
 *
 * option:
 * {
 *  "text": string,
 *  "actions": [action]
 * }
 *
 * @param {*} globalState
 * @param {{text: string, actions: [unresolvedAction]}} option unresolved option
 * @param {*} source player who started the resolve process of this card.
 * @returns {{text: string, actions: [resolvedAction]}}
 */
function resolveOption(globalState, option, cardActions, source, variables) {
    return {
        text: resolveText(option.text, variables),
        actions: resolveActions(globalState, option.actions, source, variables),
    };
}

/**
 * Run option by running each action of the card and each action of that option.
 * 
 * @param {*} globalState 
 * @param {*} setGlobalState 
 * @param {*} cardActions 
 * @param {*} option 
 * @returns new gamestate
 */
export function runOption(globalState, setGlobalState, cardActions, option) {
    let x = runActions(globalState, setGlobalState, cardActions);
    x = runActions(x, setGlobalState, option.actions);
    return x;
}

/**
 * Resolve a list of actions
 * 
 * @param {*} globalState
 * @param {*} actions unresolved actions.
 * @param {*} source player who started the resolve process of this card.
 * @returns resolved actions
 */
function resolveActions(globalState, actions, source, variables) {
    return actions
        .map((a) => actionFromRaw(a, source, variables))
        .filter((a) => a !== undefined)
        .map((a) => {
            a.resolve(globalState);
            return a;
        });
}

/**
 * Run a list of actions.
 * 
 * @param {*} globalState 
 * @param {*} setGlobalState 
 * @param {*} actions 
 * @returns new gamestate
 */
export function runActions(globalState, setGlobalState, actions) {
    return actions.reduce(
        (state, nextCard) => nextCard.run(state, setGlobalState),
        globalState
    );
}
/**
 * Resolve a list of selectors or replace it with an variable.
 * 
 * @param {*} globalState 
 * @param {*} selectors 
 * @param {*} source 
 * @param {*} variables 
 * @returns list of player ids (distinct)
 */
export function resolveSelectors(globalState, selectors, source, variables) {
    if (selectors.type === "variable") {
        return getVariable(selectors.name, variables).value;
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
 * Resolve a selector to a set of player ids.
 * More information about the structure of selectors is above.
 * 
 * selector
 * {
 *  "type": {"all"|"self"}
 *  "excluded": [selector]
 * }
 *
 * @param {*} globalState
 * @param {*} selector
 * @param {*} source
 * @returns list of player ids
 */
export function resolveSelector(globalState, selector, source, varibales = []) {
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
            const s = resolveSelectors(
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
            const resSelectors = resolveSelectors(
                globalState,
                selector.selectors,
                source,
                varibales
            );

            shuffleList(resSelectors);

            unfiltered = resSelectors;
            break;

        /**
         * "type": "randomPlayer"
         * "excluded": [selector]
         * ["self": boolean] = true
         */
        case "randomPlayer":
            let self = selector.self;

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

            const offset = resolveVariableInput(
                selector.offset,
                varibales,
                0
            );
            const sels = resolveSelectors(
                globalState,
                selector.selectors,
                source,
                varibales
            );

            unfiltered = sels
                .map((s) => {
                    const playerIndex = globalState.getIndexFromId(s);
                    if (playerIndex === undefined) {
                        return undefined;
                    } else {
                        return globalState.players[
                            (playerIndex + offset) %
                            globalState.players.length
                        ].id;
                    }
                })
                .filter((s) => s !== undefined);

            break;

        /**
         * "type": "sameSqaure",
         * "excluded": [selector],
         * "selectors": [selector],
         */
        case "sameSquare":
            const sameSquareSelectors = resolveSelectors(
                globalState,
                selector.selectors,
                source,
                varibales
            );

            unfiltered = globalState.players
                .filter(
                    (player) =>
                        sameSquareSelectors.find(
                            (s) =>
                                globalState.getPlayerById(s).position ===
                                player.position
                        ) !== undefined
                )
                .map((p) => p.id);

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
 * Resolve a variable to an actual value
 * More information about the structure of variables is above.
 * 
 * variable:
 * {
 *  "name": string
 *  "type": {"randomInteger"|"selectors"}
 * }
 *
 * @param {*} globalState
 * @param {*} variable
 * @param {*} source
 * @returns {
 *      "name": {string},
 *      "value": {*},
 *      "string": {string}
 * }
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
                            : val
                                .reduce(
                                    (a, b) =>
                                        a +
                                        ", " +
                                        globalState.getPlayerById(b).name,
                                    ""
                                )
                                .substring(2);
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

        /**
         * {
         *  "name": string,
         *  "type": "randomStringFromList"
         *  "strings": [string]
         * }
         * 
         * TODO: more general approach (maybe use selectors as list substitute)
         */
        case "randomStringFromList":
            if (variable.strings === undefined) {
                invalidArgument();
            } else {
                console.log(variable)
                const ran = Math.floor(Math.random() * variable.strings.length)

                console.log(ran)
                console.log(variable.strings[ran])
                return {
                    name: variable.name,
                    value: variable.strings[ran],
                    string: variable.strings[ran]
                }
            }

            break;
        default:
            console.error("unkown variable type");
            break;
    }
}

/**
 * takes any json structure and replace variables with its value.
 * If the name of the variable is unkown, the default value will be used instead of the value.
 * 
 * In case the input structure isn't a variable, the unchanged input structure will be returned.
 * 
 * @param {*} input 
 * @param {*} variables 
 * @param {*} defaultValue 
 * @returns 
 */
export function resolveVariableInput(input, variables, defaultValue) {
    if (typeof input === "object" && input.type === "variable") {
        const variable = getVariable(input.name, variables);

        let variableValue;
        if (variable === undefined) {
            variableValue = defaultValue;
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
