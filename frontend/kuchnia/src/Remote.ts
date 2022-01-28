import React from 'react';

export interface Row {
    id: string
}

// interface DataObject<T extends Row> {
//     [id :string]: T
// }

// function dataToObject<T extends Row>(data: [T]): DataObject<T> {
//     const dataObj: DataObject<T> = {};
//     data.forEach(row => {dataObj[row.id] = row})
//     return dataObj;
// }

interface RemoteArray<T extends Row> {
    data?: [T],
    fetch(): void,
    update(
        actionName: string,
        data?: any
    ): void;
}

export function useRemoteArray<T extends Row>(url: string): RemoteArray<T> {
    const [data, setData] = React.useState<[T] | undefined>(undefined);
    return {
        data,
        fetch() {
            fetch(url)
            .then(response => response.json())
            .then(setData);
        },
        update(actionName, data) {
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({actionName, data})
            })
            .then(response => response.json())
            .then(setData);
        }
    };
}

// async function fetchDishes() {
//     const response = await fetch('/dishes');
//     if (response.ok) {
//         return await response.json();
//     }
//     throw new Error("Request failed");
// }