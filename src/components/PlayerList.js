import { FaTimes} from "react-icons/fa";

const PlayerList = ({ globalState, setGlobalState }) => {
    return (
        <div className="player-list">
            {globalState.players.map((s) => {
                return <Player key={s.id} playerState={s} globalState={ globalState} setGlobalState = {setGlobalState} />
            })}
        </div>
    )
}

const Player = ({playerState, globalState, setGlobalState}) => {
    const removePlayer = () => {
        setGlobalState(globalState.withPlayerRemove(playerState.id));
    }
    
    return (
        <div className="player-card" style={{backgroundColor: playerState.getColor()}}>
            {playerState.name}
            <span style={{ marginLeft: "10px", float: "right"}}>
                <div className="box-text">
                    {playerState.position}
                </div>
                <div className="tooltip">
                    <FaTimes className="icon-btn" style={{ marginLeft: "5px", paddingTop: "4px" }} onClick={removePlayer} />
                    {/*<span className="tooltiptext">
                        Remove Player
                    </span>*/}
                </div>
                

            </span>
            
        </div>
    )
}

export default PlayerList
