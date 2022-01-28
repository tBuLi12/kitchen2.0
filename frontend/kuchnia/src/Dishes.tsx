import React from "react";
import { Row, useRemoteArray } from "./Remote";

interface Dish extends Row {
    name: string,
    lastMade: Date,
}

export default function DishList() {
    const dishes = useRemoteArray<Dish>('/dishes');
    if (dishes.data === undefined) {
        return <div>Loading</div>;
    }
    return (
        <div>
            {dishes.data.map(dish => <div key={dish.id}>
                {dish.lastMade}: {dish.name}
                <button onClick={() => dishes.update("done", dish.id)}>Done</button>
            </div>)}
        </div>
    );
}