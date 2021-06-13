import { virtualOption, ACTION_NEXT, getVariable } from "./CardUtil";

export function unifyCards(cards) {
    if (!Array.isArray(cards)) {
        warn(cards, "Argument isn't a list of cards.");
        return [];
    } else {
        return cards.map(card => unifyCard(card)).filter(card => card !== undefined);
    }
}

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

        if (Array.isArray(card.variables)) {
            c.variables = unifyVariables(card.variables);
        } else {
            c.variables = [];
        }

        c.options = unifyOptions(card.options, c.variables);

        if (Array.isArray(card.actions)) {
            c.actions = unifyActions(card.actions, c.variables);
        } else {
            c.actions = [];
        }

        if (c.actions.length === 0) {
            c.options.forEach(option => { 
                if(option.actions.length === 0) {
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

function unifyActions(actions, variables) {
    return actions
        .map(action => unifyAction(action, variables))
        .filter(action => action !== undefined);
}

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

function unifySelectors(selectors, variables) {
    const ret = unifyVariableInput(
        selectors,
        variables,
        [],
        (ss) => ss
            .map(s => unifySelector(s, variables))
            .filter(s => s !== undefined));
    if (ret.length === 0) {
        console.warn(selectors, "Empty list of selectors.")
        return [];
    }
    return ret;
}

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

function unifyVariables(variables) {
    return variables
        .map(variable => unifyVariable(variable))
        .filter(variable => variable !== undefined);
}

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

