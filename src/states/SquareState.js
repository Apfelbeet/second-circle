import { GAME_STATUS } from "./GlobalState";
import * as CardInterpreter from "../card_logic/CardInterpreter"

export const START_SQUARE = {
    name: "Start",
    frequency: 0,
    icon: "FaArrowRight"
};

export const FINISH_SQUARE = {
    name: "Finish",
    frequency: 0,
    icon: "FaFlagCheckered"
};

export function getStartSquare(index = 0) {
    return new SquareState(index, START_SQUARE, (globalState) => globalState);
}

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

export function randomType(deck) {
    let selectedTypes;

    do {
        const ran = Math.random();
        selectedTypes = deck
            .getTypes()
            .filter((value) => ran < value.frequency);
    } while (selectedTypes.length === 0);

    const x = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
    return x;
}

const defaultOnArriveFunc = (globalState, square, source) => {
    const card = CardInterpreter.resolveCard(globalState.deck.getRandomCard(square.type, source.position, globalState), globalState, source);
    return globalState.withActiveCard(card);
};

export class SquareState {
    constructor(index, type, onArrive = defaultOnArriveFunc) {
        this.index = index;
        this.type = type;
        this.onArriveFunc = onArrive;
    }

    onArrive(globalState, source) {
        return this.onArriveFunc(globalState, this, source);
    }
}
