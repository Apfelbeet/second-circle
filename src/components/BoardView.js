import SquareView from "./SquareView";
import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const BoardView = ({ globalState, setGlobalState }) => {
    const [boardSize, setBoardSize] = useState(100);

    if (globalState.boardState === undefined) {
        return <div></div>;
    }

    const bs = boardSize / 100;

    const grid_style = {
        display: "grid",
        gridTemplateColumns:
            "auto ".repeat(globalState.boardState.size - 1) + "auto",
        transform: "scale(" + bs + "," + bs + ")",
    };

    return (
        <div className="board-container" style={{}}>
            <div className="board" style={grid_style}>
                {toSpiral(
                    globalState.boardState.squares,
                    globalState.boardState.size,
                    globalState
                )}
                {
                    <div className="slidecontainer">
                        <FaMinus
                            className="icon-btn icon-btn-padding"
                            size={30}
                            onClick={() => {
                                if (boardSize > 10) setBoardSize(boardSize - 5);
                            }}
                        />
                        <FaPlus
                            className="icon-btn icon-btn-padding"
                            size={30}
                            onClick={() => {
                                setBoardSize(boardSize + 5);
                            }}
                        />
                    </div>
                }
            </div>
        </div>
    );
};

const BOUND_PIECES = [
    { up: true, down: true, left: false, right: false },
    { up: false, down: false, left: true, right: true },
    { up: true, down: true, left: false, right: false },
    { up: false, down: false, left: true, right: true },
];

const BOUND_FIRST_PIECES = [
    { up: true, down: true, left: false, right: false },
    { up: true, down: false, left: false, right: true },
    { up: false, down: true, left: false, right: true },
    { up: false, down: true, left: true, right: false },
];

const BOUND_LAST_PIECES = [
    { up: true, down: true, left: false, right: false },
    { up: false, down: false, left: true, right: true },
    { up: true, down: true, left: false, right: false },
    { up: true, down: false, left: true, right: false },
];

function toSpiral(squares, size, globalState) {
    const createSqView = (sqState, dir, first, last) => {
        let x = BOUND_PIECES;
        if (first) x = BOUND_FIRST_PIECES;
        else if (last) x = BOUND_LAST_PIECES;

        return (
            <SquareView
                key={sqState.index}
                squareState={sqState}
                bounds={x[dir % 4]}
                globalState={globalState}
            />
        );
    };

    let bor = Array(size);

    for (let i = 0; i < size; i++) {
        bor[i] = Array(size);
    }

    let counter = 0;
    let counterX = 0;
    let counterY = 0;

    for (let i = size - 1; i >= 0; i -= 2) {
        if (i === 0) {
            bor[counterY][counterX] = createSqView(
                squares[counter],
                0,
                true,
                true
            );
        } else {
            for (let direction = 0; direction < 4; direction++) {
                for (let x = 0; x < i; x++) {
                    bor[counterY][counterX] = createSqView(
                        squares[counter],
                        direction,
                        x === 0,
                        x === i - 1
                    );
                    counter++;
                    counterX += (-direction + 1) % 2;
                    counterY += (-direction + 2) % 2;
                }
            }
        }

        counterX++;
        counterY++;
    }

    return bor.flat();
}

export default BoardView;
