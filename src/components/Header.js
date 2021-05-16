import { AddPlayerButton, NewGameButton, HideBoardButton } from "./Buttons";

const Header = ({ globalState, setGlobalState }) => {
    return (
        <header>
            <div/>
            <div>Second Circle</div>
            <div className="header-button-row">
                <HideBoardButton size={40} globalState={globalState} setGlobalState={setGlobalState} />
                <div></div>
                <AddPlayerButton size={40} />
                <NewGameButton size={40} />
            </div>
        </header>
    );
};

export default Header;
