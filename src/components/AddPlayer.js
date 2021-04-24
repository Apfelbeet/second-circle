import {useState} from 'react'
import { FaTimes } from "react-icons/fa";
import { PlayerState } from "../states/PlayerState";

function closeOverlay() {
    document.getElementById("overlay-add-player").style.display = "none";
}

const AddPlayer = ({ globalState, setGlobalState}) => {
    const [name, setName] = useState("");
    

    const addPlayer = () => {
        if (name !== "") {
            setGlobalState(globalState.withPlayer(new PlayerState(name)));
        }
        setName("");
        closeOverlay();
    }
    
    const onSubmit = (e) => {
        e.preventDefault();

        addPlayer();
    }

    return (
        <div id="overlay-add-player" className="overlay">
            <FaTimes className="button close-btn" onClick={closeOverlay} />
            <form className='form' onSubmit={onSubmit}>
                <div className="form-control">
                    <label >Name</label>
                    <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />
                    <input type="submit" value="Submit" />
                </div>
            </form>
        </div>
    );
}
export default AddPlayer




