import React from "react";
import { Row, useRemoteArray } from "./Remote";
import './Dishes.css';
import { ReactComponent as Loading } from "./loading.svg";

interface Dish extends Row {
    name: string,
    lastMade: Date,
}

interface RawDish extends Row {
    name: string,
    lastMade: string,
}

function fromRaw(raw: RawDish) {
    return {...raw, lastMade: new Date(raw.lastMade)};
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
    const dishes = useRemoteArray<Dish>('/dishes', fromRaw);
    if (dishes.data === undefined) {
        return <div className="loading"><Loading/></div>;
    }
    return (
        <div className="dishes">
            {dishes.data.map(dish => <DishElem dish={dish} done={() => dishes.update("done", dish.id)}/>)}
        </div>
    );
}

interface DishProps {
    dish: Dish,
    done: () => void;
}

function DishElem({ dish, done }: DishProps) {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <> 
            <div key={dish.id} className="dish" onClick={() => setExpanded(prev => !prev)}>
                <span>{getDateStr(dish.lastMade)}:</span> <span>{dish.name}</span>
            </div>
            {expanded ? <div className="button-box">
                <span onClick={done} className="button">
                    Done
                </span>
            </div> : null}
        </>
    )
}