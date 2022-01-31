import React from 'react';
import NavBar from './Nav';
import './App.css';
import DishList from './Dishes';
import LogIn from './Login';

interface AppState {
    content: JSX.Element,
    user: string | null;
}

type Action = 
    | 'logout'
    | {action: 'login', username: string}
    | {action: 'setContent', content: JSX.Element}

export const DispatchContext = React.createContext((action: Action) => {});

function reducer(state: AppState, action: Action): AppState {
    if (typeof action === 'string') {
        switch (action) {
            case 'logout':
                return {...state, user: null, content: <LogIn/>};
        }
    } else if (typeof action === 'object') {
        switch (action.action) {
            case 'setContent':
                return {...state, content: action.content};
            case 'login':
                return {...state, user: action.username, content: <DishList/>};
        }
    }
    return state;
}

function App() {
    const [{ content, user }, dispatch] = React.useReducer(reducer, {content: <LogIn/>, user: null});
    return (
        <DispatchContext.Provider value={dispatch}>
            <div className="App">
                <NavBar links={{
                Dishes: <DishList/>,
                }} user={user}/>
                {content}
            </div>
        </DispatchContext.Provider>
    );
}

export function usePopup<T>(): [JSX.Element | null, (getElem: (confirm: (data: T) => void) => JSX.Element) => Promise<T>] {
    const [popupElem, setPopupElem] = React.useState<JSX.Element | null>(null);
    return [popupElem, function(getElem) {
        return new Promise(function(resolve, reject) {
            setPopupElem(
                <div className='popup'>
                    <div>
                        <button onClick={() => {
                            reject("closed")
                            setPopupElem(null);
                        }} className="close-button">X</button>
                        {getElem(data => {
                            resolve(data);
                            setPopupElem(null);
                        })}
                    </div>
                </div>
            );
        })
    }];
}

export default App;
