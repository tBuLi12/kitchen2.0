import React from 'react';
import { DispatchContext } from './App';
import './Login.css';
import { loginOrSignup } from './Remote';

export default function LogIn() {
    return <UsrnPassForm buttonText='Log In' url='/login'/>;
}

export function SignUp() {
    return <UsrnPassForm buttonText='Sign Up' url='/signup'/>;

}

interface upForm {
    buttonText: string,
    url: '/login' | '/signup'
}

function UsrnPassForm({ buttonText, url }: upForm) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const dispatch = React.useContext(DispatchContext);
    return (
        <form autoComplete='off' onSubmit={function(event) {
            event.preventDefault();
            loginOrSignup(url, username, password)
            .then(() => dispatch({action: 'login', username}));
        }}>
            <input 
                type="text"
                placeholder="username"
                name="username"
                value={username}
                required
                onChange={event => setUsername(event.target.value)}
            />
            <input type="password"
                placeholder="password"
                name="password"
                value={password}
                required
                onChange={event => setPassword(event.target.value)}
            />
            <button type="submit">{buttonText}</button>
        </form>
    )
}