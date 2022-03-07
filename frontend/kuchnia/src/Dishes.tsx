import React from "react";
import { Row, OuterElem, useRemoteArray } from "./Remote";
import './Dishes.css';
import { ReactComponent as Loading } from "./loading.svg";
import { usePopup } from "./App";

interface Dish extends Row {
    name: string,
    lastMade: string,
}

function sameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

function getDateStr(date: Date): string {
    const cmp = new Date();
    if (sameDay(cmp, date)) {
        return "Today";
    }
    cmp.setDate(cmp.getDate() - 1);
    if (sameDay(cmp, date)) {
        return "Yesterday";
    }
    cmp.setDate(cmp.getDate() - 6);
    if (date > cmp && date < new Date()) {
        return date.toLocaleDateString("en-GB", {
            weekday: "long"
        });
    }
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
    });
}

export default function DishList() {
    const dishes = useRemoteArray<Dish>('/dishes', ordering);
    const [popup, show] = usePopup<string>();
    if (dishes.array === undefined) {
        return <div className="loading"><Loading/></div>;
    }
    return (
        <div className="dishes">
            <button onClick={() => show(confirm => <DishAdder onAdd={confirm}/>).then(name => dishes.add({
                name,
                lastMade: (new Date()).toLocaleDateString()
            }))}>Add</button>
            {dishes.array.map(dish => <DishElem key={dish.id} dish={dish}/>)}
            {popup}
        </div>
    );
}

interface DishProps {
    dish: OuterElem<Dish>,
}

function DishElem({ dish }: DishProps) {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <> 
            <div className="dish" onClick={() => setExpanded(prev => !prev)}>
                <span>{getDateStr(new Date(dish.lastMade))}:</span> <span>{dish.name}</span>
            </div>
            {expanded && <div className="button-box">
                <button onClick={() => dish.lastMade = (new Date()).toLocaleDateString()}>
                    Done
                </button>
            </div>}
        </>
    )
}

function DishAdder({ onAdd }: { onAdd: (name: string) => void }) {
    const [name, setName] = React.useState("");
    return (
        <form onSubmit={function(event) {
            event.preventDefault();
            onAdd(name);
        }}>
            <input 
                name="name"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="dish name"
                required
                maxLength={63}
            />
            <button type="submit">Add</button>
        </form>
    )
}

function ordering(d1: Dish, d2: Dish): number {
    return (new Date(d1.lastMade)).getTime() - (new Date(d2.lastMade)).getTime();
}