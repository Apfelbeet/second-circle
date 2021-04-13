/**
 * An action is an event that will change the state of the game.
 * You find detailed information about the purpose and structure of actions in the CardInterpreter file.
 *
 * In the following the internal structure is considered.
 *
 * The different types of action are encoded as classes. The list "ACTION_TYPES" maps a name to an actual class.
 * (With increasing complexity and quantity of actions, some/all actions will probably be divied among several files.)
 */

import * as CardInterpreter from "./CardInterpreter";
import { GAME_STATUS } from "../states/GlobalState";

/**
 * Instances a new class of an action from unresolved action.
 *
 * @param {*} raw: unresolved action (input from json)
 * @param {*} source: player that caused that action
 * @param {*} variables: list of all variables of that card
 * @returns {* | undefined} instance of a class of this action type (or undefinded if the type is unknown)
 */
export function actionFromRaw(raw, source, variables) {
    if (raw === undefined || raw.type === undefined) {
        console.error("can't create action from: " + raw);
        return undefined;
    }

    const reprimand = ACTION_TYPES.find((ty) => ty.type === raw.type);
    return reprimand === undefined
        ? undefined
        : new reprimand.class(raw, source, variables);
}

/**
 * Action is an 'abstract' class. It should not be initialized.
 * It's a blueprint for an actual action.
 *
 * An action is defined by two phases:
 * - Resolve (resolve()):
 *      Called when the card is resolved to be displayed.
 *      Gathers all necessary information from the current gamestate.
 *
 * - Run (run()):
 *      Called when the users chooses an option and this actions belongs to that option.
 *      It will change the current gamestate in the way the action is supposed to do.
 */
class Action {
    /**
     * Stores raw, source and variables as attributes.
     * resolve() and run() can use them.
     * 
     * 
     * @param {*} raw: unresolved action (input from json)
     * @param {*} source: player that caused that action
     * @param {*} variables: list of all variables of that card
     */
    constructor(raw, source, variables) {
        if (raw === undefined || source === undefined) {
            throw Error("undefinded content in action-class");
        }
        this.raw = raw;
        this.source = source;
        this.variables = variables;
    }

    resolve(globalState) {
        console.error("abstract function called");
    }

    run(globalState, setGlobalState) {
        console.error("abstract function called");
        return globalState;
    }
}

/**
 * {
 *  type: "move",
 *  offset: <number>,
 *  selector: <Selector>
 * }
 */
class MoveAction extends Action {
    resolve(globalState) {
        this.offset = CardInterpreter.resolveVariableInput(
            this.raw.offset,
            this.variables,
            0
        );

        this.selected = CardInterpreter.resolveSelectors(
            globalState,
            this.raw.selectors,
            this.source,
            this.variables
        );
    }

    run(globalState, setGlobalState) {
        if (this.offset === 0) return;
        let x = globalState;

        for (let i = 0; i < this.selected.length; i++) {
            x = x.withPlayerMove(
                this.selected[i],
                globalState.getPlayerById(this.selected[i]).position +
                    this.offset,
                setGlobalState
            );
        }

        return x;
    }
}

/**
 * {
 *  type: "moveBack",
 *  offset: <number>,
 *  selector: <Selector>
 * }
 */
class MoveBackAction extends MoveAction {
    resolve(globalState) {
        super.resolve(globalState);
        this.offset *= -1;
    }
}

/**
 * {
 *  type: "nextPlayer",
 * }
 */
class NextPlayerAction extends Action {
    resolve(globalState) {}

    run(globalState, setGlobalState) {
        return globalState
            .withNextCurrentPlayer()
            .withGameStatus(GAME_STATUS.TURN);
    }
}

/**
 * List of all actions.
 * "type" as name maps to the class of this type.
 * (ACTION_TYPES has to be under the classes, because they need to be declared first.)
 */
const ACTION_TYPES = [
    {
        type: "move",
        class: MoveAction,
    },
    {
        type: "moveBack",
        class: MoveBackAction,
    },
    {
        type: "nextPlayer",
        class: NextPlayerAction,
    },
];
