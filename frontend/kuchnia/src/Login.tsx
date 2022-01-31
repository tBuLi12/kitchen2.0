import './Login.css';

export default function LogIn() {
    return (
        <form action="/login" method="POST" autoComplete='off'>
            <input type="text" placeholder="username" name="username" required/>
            <input type="password" placeholder="password" name="password" required/>
            <button type="submit">Log In</button>
        </form>
    )
}

export function SignUp() {
    return (
        <form action="/signup" method="POST" autoComplete='off'>
            <input type="text" placeholder="username" name="username" required/>
            <input type="password" placeholder="password" name="password" required/>
            <button type="submit">Sign Up</button>
        </form>
    )
}