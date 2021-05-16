import SquareView from "./SquareView";

const BoardView = ({ globalState, setGlobalState }) => {
    //document.querySelector(':root').style.setProperty('--board-visible', globalState.boardVisible ? "auto max-content 1fr auto" : "0 auto 0 0");

    if (globalState.boardState === undefined) {
        return <div></div>;
    }

    const grid_style = {
        display: "grid",
        gridTemplateColumns:
            "1fr ".repeat(globalState.boardState.size - 1) + "1fr",
    };

    const board = globalState.boardVisible ? (
        <div className="board-wrapper disappear-on-small">
            <div className="board" style={grid_style}>
                {toSnake(
                    globalState.boardState.squares,
                    globalState.boardState.size,
                    globalState
                )}
            </div>
        </div>
    ) : (
        <div />
    );

    return board;
};

const DEFAULT_BOUNDS = { up: true, down: true, left: false, right: false };
const ROW_LEFT_BOUNDS = [
    { up: false, down: true, left: true, right: false },
    { up: true, down: false, left: true, right: false },
];
const ROW_RIGHT_BOUNDS = [
    { up: true, down: false, left: false, right: true },
    { up: false, down: true, left: false, right: true },
];

function toSnake(squares, size, globalState) {
    const createSqView = (sqState, row, column, i) => {
        let bound = DEFAULT_BOUNDS;
        if (column === 0 && i !== 0)
            bound = ROW_LEFT_BOUNDS[row % ROW_LEFT_BOUNDS.length];
        else if (column === size - 1 && i !== size * size - 1)
            bound = ROW_RIGHT_BOUNDS[row % ROW_RIGHT_BOUNDS.length];

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
        const column = row % 2 === 0 ? i % size : size - 1 - (i % size);

        bor[row][column] = createSqView(squares[i], row, column, i);
    }

    return bor.flat();
}

export default BoardView;
