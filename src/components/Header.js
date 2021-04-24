import { AddPlayerButton, NewGameButton } from "./Buttons";

const Header = ({ globalState, setGlobalState }) => {
    return (
        <header>
            <div/>
            <div>Second Circle</div>
            <div className="header-button-row">
                <AddPlayerButton size={40} />
                <NewGameButton size={40} />
            </div>
        </header>
    );
};

export default Header;
