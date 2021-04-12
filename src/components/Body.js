
import BoardView from './BoardView'
import ControlView from './ControlView';

const Body = ({globalState, setGlobalState}) => {
    return (
        <div className="body-view">
            <ControlView globalState={globalState} setGlobalState={setGlobalState}/>
            <BoardView globalState={globalState} setGlobalState={setGlobalState} />
        </div>
    )
}

export default Body
