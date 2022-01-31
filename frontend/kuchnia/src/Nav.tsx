import React from 'react';
import { DispatchContext } from './App';
import LogIn, { SignUp } from './Login';
import './Nav.css';
import { logout } from './Remote';

interface NavBarProps {
    links: {
        [linkName: string]: JSX.Element
    },
    user: string | null
}

export default function NavBar({ links, user }: NavBarProps) {
    const dispatch = React.useContext(DispatchContext);
    return (
        <nav>
            {Object.entries(links).map(([name, content]) => <div
                key={name}
                onClick={() => dispatch({action: 'setContent', content})}
            >
                {name}
            </div>)}
            <div className='spacer'></div>
            {user === 'admin' && <div onClick={() => dispatch({action: 'setContent', content: <SignUp/>})}>Sign Up</div>}
            {user ?
                <div onClick={() => logout().then(() => dispatch('logout'))}>Log Out</div>
            :   <div onClick={() => dispatch({action: 'setContent', content: <LogIn/>})}>Log In</div>}
        </nav>
    );
}
