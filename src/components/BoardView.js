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
                {toSnake(
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


const DEFAULT_BOUNDS = { up: true, down: true, left: false, right: false }
const ROW_LEFT_BOUNDS = [
    { up: false, down: true, left: true, right: false },
    { up: true, down: false, left: true, right: false  },
    
]
const ROW_RIGHT_BOUNDS = [
    { up: true, down: false, left: false, right: true  },
    { up: false, down: true, left: false, right: true}
]

function toSnake(squares, size, globalState) {
    const createSqView = (sqState, row, column, i) => {
        let bound = DEFAULT_BOUNDS;
        if (column === 0 && i !== 0) bound = ROW_LEFT_BOUNDS[row%ROW_LEFT_BOUNDS.length];
        else if (column === size - 1 && i !== size*size-1) bound = ROW_RIGHT_BOUNDS[row%ROW_RIGHT_BOUNDS.length];

        return (
            <SquareView
                key={sqState.index}
                squareState={sqState}
                bounds={bound}
                globalState={globalState}
            />
        );
    };

    let bor = Array(size);

    for (let i = 0; i < size; i++) {
        bor[i] = Array(size);
    }
    
    for (let i = 0; i < size * size; i++) {
        const row = Math.floor(i / size);
        const column = row % 2 === 0 ? i % size : size - 1 - (i % size)
        
        bor[row][column] = createSqView(squares[i], row, column, i)
    }

    return bor.flat();

}

export default BoardView;
