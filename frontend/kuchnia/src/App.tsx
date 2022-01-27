import { useState } from 'react';
import NavBar from './Nav';
import './App.css';

function App() {
  const [content, setContent] = useState<JSX.Element | null>(null);
  return (
    <div className="App">
      <NavBar links={{
        Link1: <div/>,
        Link2: <div/>
      }} setContent={setContent}/>
      {content}
    </div>
  );
}

export default App;
