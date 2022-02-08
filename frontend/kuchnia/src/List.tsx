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
    const items = useRemoteArray<ListItem>("/list");
    if (items.data === undefined) {
        return <div className="loading"><Loading/></div>;
    }
    return (
        <div className="list">
            {items.data.map(item => <ItemElem key={item.id} item={item}/>)}
        </div>
    )
}

function ItemElem({ item }: { item: ListItem }) {
    return (
        <div className={"list-item" + (item.checked ? " checked" : "")}>
            <span>{item.name}</span>
            <span>{item.quantity}</span>
            <span>{item.unit}</span>
        </div>
    );
}