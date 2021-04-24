
import BoardView from './BoardView'
import ControlView from './ControlView';

const GameView = ({globalState, setGlobalState}) => {
    return (
        <div className="game-view-grid">
            <div/>
            <ControlView globalState={globalState} setGlobalState={setGlobalState} />
            <BoardView globalState={globalState} setGlobalState={setGlobalState} />
            <div/>
        </div>
    )
}

export default GameView
