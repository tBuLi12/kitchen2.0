import { useState } from 'react';
import NavBar from './Nav';
import './App.css';
import DishList from './Dishes';

function App() {
  const [content, setContent] = useState<JSX.Element | null>(null);
  return (
    <div className="App">
      <NavBar links={{
        Dishes: <DishList/>,
        Link2: <div/>
      }} setContent={setContent}/>
      {content}
    </div>
  );
}

export default App;
