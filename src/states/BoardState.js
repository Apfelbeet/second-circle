import { SquareState, getFinishSquare, getStartSquare } from './SquareState';

export class BoardState {

    constructor(size, deck) {
        this.size = size;
        this.deck = deck;

        const squareAmount = size * size;
        this.squares = Array(squareAmount);

        this.squares[0] = getStartSquare();
        for (let i = 1; i < squareAmount - 1; i++) {
            this.squares[i] = new SquareState(i, this.deck.randomType()); 
        }
        this.squares[squareAmount - 1] = getFinishSquare(squareAmount - 1); 
    }
}