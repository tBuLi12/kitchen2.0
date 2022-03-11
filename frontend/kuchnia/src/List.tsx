import React from "react";
import { Row, useRemoteArray } from "./Remote";
import { ReactComponent as Loading } from "./loading.svg";
import "./List.css";

interface ListItem extends Row {
    name: string,
    quantity: number,
    unit: string | null,
    checked: boolean
}

export default function ShoppingList() {
    const [showAdder, setShowAdder] = React.useState(false);
    const items = useRemoteArray<ListItem>("/list", compareItems);
    if (items.array === undefined) {
        return <div className="loading"><Loading/></div>;
    }
    return (
        <>
            <ItemAdder onAdd={function(name, quantity, unit) {
                items.add({name, quantity, unit, checked: false});
            }} visible={showAdder}/>{showAdder && <br/>}
            <div className="list">
                {items.array.length === 0 || <button onClick={() => items.batchUpdate(
                    items.array!
                    .filter(e => e.checked)
                    .map(e => ({action: "delete", row: e}))
                )}>Clear</button>}
                <button onClick={() => setShowAdder(prev => !prev)}>+</button>
                {items.array.map((item, i) => <ItemElem key={item.id} item={item}/>)}
            </div>
        </>
    )
}

function compareItems(a: ListItem, b: ListItem): number {
    if (!a.checked && b.checked) {
        return -1;
    }
    if (a.checked && !b.checked) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function ItemElem({ item }: { item: ListItem }) {
    return (
        <div className={"list-item" + (item.checked ? " checked" : "")} onClick={() => item.checked = !item.checked}>
            <span>{item.name}</span>
            <span>{item.quantity}</span>
            <span>{item.unit}</span>
        </div>
    );
}

function ItemAdder({ onAdd, visible }: { onAdd: (name: string, quantity: number, unit: string | null) => void, visible: boolean }) {
    const quantRef = React.useRef<HTMLInputElement>(null);
    const unitRef = React.useRef<HTMLInputElement>(null);
    const nameRef = React.useRef<HTMLInputElement>(null);
    const [name, setName] = React.useState("");
    const [quantity, setQuantity] = React.useState("");
    const [unit, setUnit] = React.useState("");
    React.useEffect(function() {
        if (visible) {
            if (!name) {
                nameRef.current?.focus();
            } else if (!unit) {
                quantRef.current?.focus();
            } else {
                unitRef.current?.focus();
            }
        }
    }, [visible])
    return (
        <form  className="list-form" onSubmit={function(event) {
            event.preventDefault();
            setName("");
            setQuantity("");
            setUnit("");
            onAdd(name, parseQuantity(quantity), unit || null);
        }} style={visible ? {} : {display: "none"}}>
            <input 
                name="name"
                value={name}
                onKeyDown={event => event.code.startsWith("Digit") && quantRef.current?.focus()}
                onChange={event => setName(event.target.value)}
                placeholder="item"
                required
                ref={nameRef}
                maxLength={63}
            />
            <input
                className={verifyQuantity(quantity) ? "" : "invalid"}
                name="quantity"
                value={quantity}
                onKeyDown={function(event) {
                    if (event.code.startsWith("Key")) {
                        unitRef.current?.focus()
                    } else if (event.code === 'Backspace' && !quantity) {
                        nameRef.current?.focus()
                    }
                }}
                onChange={event => setQuantity(event.target.value)}
                placeholder="1"
                ref={quantRef}
                pattern="((\d*\.?\d+|\d+\.?\d*)(\/(\d*\.?\d+|\d+\.?\d*))?)?"
            />
            <input 
                name="unit"
                value={unit}
                onChange={event => setUnit(event.target.value)}
                onKeyDown={event => event.code === 'Backspace' && !unit && quantRef.current?.focus()}
                ref={unitRef}
                maxLength={15}
            />
            <button type="submit">Add</button>
        </form>
    )
}

function verifyQuantity(quantityStr: string): boolean {
    return quantityStr.match(/^((\d*\.?\d+|\d+\.?\d*)(\/(\d*\.?\d+|\d+\.?\d*))?)?$/) !== null;
}

function parseQuantity(quantityStr: string): number {
    if (!quantityStr) {
        return 1;
    }
    const [n, d] = quantityStr.split('/');
    return parseFloat(n) / parseFloat(d ?? 1);
}