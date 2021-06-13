import { virtualOption, ACTION_NEXT, getVariable } from "./CardUtil";

/**
 * Will unify a list of cards, all cards that turn out to be invalid, will be removed.
 * If the input isn't a list the empty list will be returned.
 * 
 * @param {*} cards 
 * @returns list of unified cards
 */
export function unifyCards(cards) {
    if (!Array.isArray(cards)) {
        warn(cards, "Argument isn't a list of cards.");
        return [];
    } else {
        return cards
            .map(card => unifyCard(card))
            .filter(card => card !== undefined);
    }
}

/**
 * Unifies a card by unify all options and actions 
 * and replaces missing attributes with default values.
 * 
 * attributes and their default value:
 * {
 *      "text": "",
 *      "frequency": 1, //value is limited to [0,1]
 *      "appearance": {"upper":1,"lower":0}, //both values are limited to [0,1]
 *      "options": [],
 *      "actions": [],
 *      "variables": []
 * }
 * 
 * If an option will execute no action at all the game gets stuck.
 * Thus the game will start the next turn.
 * 
 * @param {*} card 
 * @returns unified card
 */
function unifyCard(card) {
    if (typeof card === "object") {
        const c = {}
        c.text = typeof card.text === "string" ? card.text : "";
        c.frequency = typeof card.frequency === "number" ? Math.max(Math.min(card.frequency, 1), 0) : 1;

        if (typeof card.appearance === "object" && typeof card.appearance.lower === "number" && typeof card.appearance.upper === "number") {
            c.appearance = {
                upper: Math.max(0, Math.min(1, card.appearance.upper)),
                lower: Math.max(0, Math.min(1, card.appearance.lower))
            }
        } else {
            c.appearance = { upper: 1, lower: 0 }
        }

        c.variables = unifyVariables(card.variables);
        c.options = unifyOptions(card.options, c.variables);
        c.actions = unifyActions(card.actions, c.variables);

        if (c.actions.length === 0) {
            c.options.forEach(option => {
                if (option.actions.length === 0) {
                    option.actions = [ACTION_NEXT];
                }
            });
        }

        return c;
    } else {
        warn(card, "Argument isn't a card.");
        return undefined;
    }
}

/**
 * Unifies a list of options.
 * If the argument is null it will be replaced with the empty list.
 * If the argument is a empty list or of the wrong type it will be replaced with a "next"-option.
 * 
 * @param {*} options 
 * @param {*} variables 
 * @returns list of unified options
 */
function unifyOptions(options, variables) {
    let opts;
    if (options === null) {
        return [];
    } else if (!Array.isArray(options) || options.length === 0) {
        opts = [virtualOption("next", [])];
    } else {
        opts = [...options, virtualOption("skip", [])];
    }

    return opts
        .map(option => unifyOption(option, variables))
        .filter(option => option !== undefined);
}

/**
 * Unifies a option by replacing missing attributes with default values and unifies actions.
 * default values:
 * {
 *  "text": "",
 *  "actions": []
 * }
 * 
 * @param {*} option 
 * @param {*} variables 
 * @returns unified option
 */
function unifyOption(option, variables) {
    if (typeof option === "object") {
        const o = {};
        o.text = typeof option.text === "string" ? option.text : "";
        if (Array.isArray(option.actions)) {
            o.actions = unifyActions(option.actions, variables);
        } else {
            o.actions = [];
        }
        return o;
    } else {
        return undefined;
    }
}

/**
 * Unifies a list of actions, every invalid action will be removed.
 * If the attribute isn't a list, the empty list will be returned. 
 * 
 * @param {*} actions 
 * @param {*} variables 
 * @returns list of unified actions
 */
function unifyActions(actions, variables) {
    if (Array.isArray(actions)) {
        return actions
            .map(action => unifyAction(action, variables))
            .filter(action => action !== undefined);
    } else {
        return [];
    }
}

/**
 * Unifies an action. 
 * Each type of an action has an own structure.
 * Using the type attribute the function will complement the right default values. 
 * 
 * 
 * @param {*} action 
 * @param {*} variables 
 * @returns unitfied action
 */
function unifyAction(action, variables) {
    if (typeof action === "object" && typeof action.type === "string") {
        switch (action.type) {
            case "move":
            case "moveBack":
                if (Array.isArray(action.selectors)) {
                    action.selectors = unifySelectors(action.selectors);
                } else {
                    console.warn(action, "Action with empty selector.");
                    action.selectors = [];
                }

                action.offset = unifyVariableInput(action.offset, variables, 0);
                break;
            case "nextPlayer":
                //Nothing to do
                break;
            default:
                warn(action, "Action with invalid type.");
                break;
        }
        return action;
    } else {
        return undefined;
    }
}

/**
 * Unifies a list of selectors and filters every invalid selector.
 * If the attribute is invalid, the empty list will be returned.
 * 
 * @param {*} selectors 
 * @param {*} variables 
 * @returns list of unified selectors
 */
function unifySelectors(selectors, variables) {
    const ret = unifyVariableInput(
        selectors,
        variables,
        [],
        (ss) => ss
            .map(s => unifySelector(s, variables))
            .filter(s => s !== undefined));
    return ret;
}

/**
 * unifies selector depending on the type attribute.
 * 
 * @param {*} selector 
 * @param {*} variables 
 * @returns unified selector
 */
function unifySelector(selector, variables) {
    if (typeof selector === "object") {
        selector.excluded = unifySelectors(selector.excluded, variables);
        switch (selector.type) {
            case "all":
            case "self":
                //Nothing to do
                break;
            case "firstElementFromSelectors":
            case "randomOrderOfSelectors":
            case "sameSquare":
                selector.selectors = unifySelectors(selector.selectors, variables);
                break;
            case "randomPlayer":
                if (typeof selector.self !== "boolean") {
                    selector.self = true;
                }
                break;
            case "indexOffset":
                selector.offset = unifyVariableInput(selector.offset, variables, 0);
                selector.selectors = unifySelectors(selector.selectors, variables);
                break;
            default:
                warn(selector, "Invalid selector type.")
                break;
        }
        return selector;
    } else {
        warn(selector, "Invalid selector.");
    }
}

/**
 * Unifies list of selectors and filters all invalid variables.
 * If the input is invalid it will return the empty list.
 * 
 * @param {*} variables 
 * @returns list of unified variables
 */
function unifyVariables(variables) {
    if (Array.isArray(variables)) {
        return variables
            .map(variable => unifyVariable(variable))
            .filter(variable => variable !== undefined);
    } else {
        return [];
    }
}

/**
 * Unifies variable depending of the type attribute.
 * 
 * @param {*} variable 
 * @returns unified variable
 */
function unifyVariable(variable) {
    if (typeof variable === "object" && typeof variable.type === "string") {
        switch (variable.type) {
            case "randomInteger":
                if (typeof variable.range !== "object" || typeof variable.range.top !== "number" || typeof variable.range.bottom !== "number") {
                    warn(variable, "invalid argument.");
                    return undefined;
                }
                break;
            case "selectors":
                variable.selectors = unifySelectors(variable.selectors, []);
                break;
            case "randomStringFromList":
                if (!Array.isArray(variable.strings)) {
                    warn(variable, "invalid argument.")
                    return undefined;
                }
                break;
            default:
                warn(variable, "Variable of unkown type.")
                break;
        }
        return variable;
    } else {
        warn(variable, "Argument isn't a variable.");
        return undefined;
    }
}

/**
 * If the input is a variable, this function checks if the variable exist.
 * 
 * @param {*} input 
 * @param {*} variables 
 * @param {*} defaultValue 
 * @param {*} onNotAVariable will be called with "input" as argument if the "input" isn't a variable.
 * @returns input or default value
 */
function unifyVariableInput(input, variables, defaultValue, onNotAVariable = (v) => v) {
    if (typeof input === "object" && input.type === "variable") {
        const variable = getVariable(input.name, variables);

        if (variable !== undefined) {
            return input;
        } else {
            warn(input, "Use of an invalid variable.");
            return defaultValue;
        }
    } else if (typeof input === typeof defaultValue) {
        return onNotAVariable(input);
    } else {
        return defaultValue;
    }
}

function warn(object, text) {
    console.warn(Object.toString(object) + "\n" + text)
}

