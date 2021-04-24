import { START_SQUARE, FINISH_SQUARE } from '../states/SquareState';
import * as Icons from "react-icons/fa";

const BORDER_ON = "solid";
const BORDER_OFF = "none";

const SquareView = ({squareState, bounds, globalState}) => {

    let style = {};
    if (squareState.type === START_SQUARE || squareState.type === FINISH_SQUARE) {
        style.borderTopStyle = BORDER_ON;
        style.borderBottomStyle = BORDER_ON;
        style.borderLeftStyle = BORDER_OFF;
        style.borderRightStyle = BORDER_OFF;
    } else {
    
        style.borderTopStyle = bounds.up ? BORDER_ON : BORDER_OFF;
        style.borderBottomStyle = bounds.down ? BORDER_ON : BORDER_OFF;
        style.borderLeftStyle = bounds.left ? BORDER_ON : BORDER_OFF;
        style.borderRightStyle = bounds.right ? BORDER_ON : BORDER_OFF;

    }

    const SqIconComponentName = Icons[squareState.type.icon];

    let icon;
    if(SqIconComponentName === undefined) {
        icon = squareState.type.name;
    } else {
        icon = (<div>
            <SqIconComponentName size={ 20}/>
            </div>)
    }

    let playersView = globalState.players.filter((p) => squareState.index === p.position).map((p) => <PlayerFigure key={p.id} playerState={p}/>)
    if (playersView.length === 0) {
        playersView = <PlayerFigure />;
    }

    return (
        <div className="board-square" style={style}>
            <div className = "board-sqaure-inner">
                <div className="board-sqaure-content">
                    <h3>{squareState.index}</h3>
                    {icon}
                </div>
                <div/>
                <div className="board-sqaure-player-row">
                    {playersView}
                </div>
            </div>
        </div>
    )

}

SquareView.defaultProps = {
    bounds: { up: false, down: false, left: false, right: false },
    squareSize: 100
};

export default SquareView

const PlayerFigure = ({playerState}) => {
    if (playerState === undefined) {
        return (
            <div className="card-player" style={{ color: "#ffffff00", backgroundColor: "#ffffff00" , borderColor: "#ffffff00"}}>
                {/*<Icons.FaChessPawn />*/}
            </div>
        )
    }
    
    return (
        <div className="card-player" style={{ backgroundColor: playerState.getColor().color, color: playerState.getColor().white ? "var(--white)" : "var(--black)" }}>
            {/* <Icons.FaChessPawn /> */}
        </div>
        
    )
}

