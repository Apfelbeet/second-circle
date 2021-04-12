import Header from './components/Header'
import { GlobalState } from './states/GlobalState'
import PlayerList from './components/PlayerList'
import { useState } from 'react';
import AddPlayer from './components/AddPlayer';
import NewGame from './components/NewGame';
import Body from './components/Body';
import * as Deck from './card_logic/Deck';

function App() {
  Deck.loadDecklist();

  const [globalState, setGlobalState] = useState(new GlobalState());
  return (
    <div>
      <Header globalState={globalState} setGlobalState={setGlobalState} />
      <PlayerList globalState={globalState} setGlobalState={setGlobalState} />
      <Body globalState={globalState} setGlobalState={setGlobalState}/>
      <AddPlayer globalState={globalState} setGlobalState={setGlobalState} />
      <NewGame globalState={globalState} setGlobalState={setGlobalState}/>
    </div>
  );
}

export default App;
