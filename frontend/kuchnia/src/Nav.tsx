import React from 'react';
import './Nav.css';

interface NavBarProps {
    links: {
        [linkName: string]: JSX.Element
    },
    setContent: React.Dispatch<React.SetStateAction<JSX.Element | null>>
}

export default function NavBar({ links, setContent }: NavBarProps) {
    return (
        <nav>
            {Object.entries(links).map(([name, content]) => <div
                key={name}
                onClick={() => setContent(content)}
            >
                {name}
            </div>)}
        </nav>
    );
}
