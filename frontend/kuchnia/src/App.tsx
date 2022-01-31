import React from 'react';
import NavBar from './Nav';
import './App.css';
import DishList from './Dishes';
import LogIn, { SignUp } from './Login';

function App() {
  const [content, setContent] = React.useState<JSX.Element | null>(null);
  return (
    <div className="App">
      <NavBar links={{
        Dishes: <DishList/>,
        "Log In": <LogIn/>,
        "Sign up": <SignUp/>
      }} setContent={setContent}/>
      {content}
    </div>
  );
}

export default App;
