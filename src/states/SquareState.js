import { GAME_STATUS } from "./GlobalState";
import * as CardInterpreter from "../card_logic/CardInterpreter"

/**
 * First square on the board.
 */
export const START_SQUARE = {
    name: "Start",
    frequency: 0,
    icon: "FaArrowRight"
};

export function getStartSquare(index = 0) {
    return new SquareState(index, START_SQUARE, (globalState) => globalState.withNextCurrentPlayer().withGameStatus(GAME_STATUS.TURN));
}

/**
 * Last square on the board.
 * Shows alert and changes gamestatus to FINISHED
 */
export const FINISH_SQUARE = {
    name: "Finish",
    frequency: 0,
    icon: "FaFlagCheckered"
};


export function getFinishSquare(index) {
    return new SquareState(
        index,
        FINISH_SQUARE,
        (globalState, sqaure, source) => {
            alert(source.name + " has won!");
            return globalState.withGameStatus(GAME_STATUS.FINISHED);
        }
    );
}

/**
 * Default onArrive event:
 * A random card dependent on the square will be drawn and will be used as active card. 
 */
const defaultOnArriveFunc = (globalState, square, source) => {
    const card = CardInterpreter.resolveCard(globalState.deck.getRandomCard(square.type, source.position, globalState), globalState, source);
    return globalState.withActiveCard(card);
};

/**
 * A SquareState represents a square on the board.
 */
export class SquareState {
    constructor(index, type, onArrive = defaultOnArriveFunc) {
        /**
         * The position on the baord/ index in the list of all squares
         * @type {number}
         */
        this.index = index;

        /**
         * type/category of the square. The category determines the set of possible cards.
         * @type {*}
         */
        this.type = type;

        /**
         * this a function that will be called if the player comes to this square.
         * this allows different behaviors with different sqaures.
         * @type {*}
         */
        this.onArriveFunc = onArrive;
    }

    /**
     * Wrapper for this.onArriveFunc
     */
    onArrive(globalState, source) {
        return this.onArriveFunc(globalState, this, source);
    }
}
