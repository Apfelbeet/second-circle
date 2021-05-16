import BoardView from "./BoardView";
import ControlView from "./ControlView";

const GameView = ({ globalState, setGlobalState }) => {
    const style = globalState.boardVisible ? "game-view-grid" : "game-view-grid-boardless";

    return (
        <div className={style}>
            <div />
            <ControlView
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
            <BoardView
                globalState={globalState}
                setGlobalState={setGlobalState}
            />
            <div />
        </div>
    );
};

export default GameView;
