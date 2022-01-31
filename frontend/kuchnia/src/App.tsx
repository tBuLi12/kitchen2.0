import { useState } from 'react';
import NavBar from './Nav';
import './App.css';
import DishList from './Dishes';
import LogIn from './Login';

function App() {
  const [content, setContent] = useState<JSX.Element | null>(null);
  return (
    <div className="App">
      <NavBar links={{
        Dishes: <DishList/>,
        "Log In": <LogIn/>
      }} setContent={setContent}/>
      {content}
    </div>
  );
}

export default App;
