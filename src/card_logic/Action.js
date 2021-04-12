import * as CardInterpreter from "./CardInterpreter";
import { GAME_STATUS } from "../states/GlobalState";

export function actionFromRaw(raw, source, variables) {
    if (raw === undefined || raw.type === undefined) {
        console.error("can't create action from: " + raw);
        return undefined;
    }

    const reprimand = ACTION_TYPES.find(ty => ty.type === raw.type);
    return reprimand === undefined ? undefined : new (reprimand.class)(raw, source, variables);
}

/**
 * {
 *  "type": string,
 * }
 */
class Action {
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

    run(globalState) {
        console.error("abstract function called");
        return globalState;
    }
}

/**
 * raw: {
 *  type: "move",
 *  offset: <number>,
 *  selector: <Selector>
 * }
 */
class MoveAction extends Action {

    resolve(globalState) {

        this.offset = CardInterpreter.resolveVariableInput(this.raw.offset, this.variables, 0);

        this.selected = CardInterpreter.resolveSelectors(
            globalState,
            this.raw.selectors,
            this.source,
            this.variables,
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

class MoveBackAction extends MoveAction {

    resolve(globalState) {
        super.resolve(globalState);
        this.offset *= -1;
    }
}

class NextPlayerAction extends Action {
    
    resolve(globalState) {
    }

    run(globalState) {
        return globalState.withNextCurrentPlayer().withGameStatus(GAME_STATUS.TURN);
    }
}

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
    }
];
