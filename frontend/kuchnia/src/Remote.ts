import React from 'react';

export interface Row {
    id: number
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

export function useRemoteArray<T extends Row>(url: string, transform?: (raw: any) => T): RemoteArray<T> {
    const [data, setData] = React.useState<[T] | undefined>(undefined);
    const resource = React.useMemo((): RemoteArray<T> => ({
        data,
        fetch() {
            fetch(url)
            .then(response => response.json())
            .then(rawRows => transform ? rawRows.map(transform) : rawRows)
            .then(setData)
        },
        update(actionName, data) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({actionName, data})
            })
            .then(response => response.json())
            .then(rawRows => transform ? rawRows.map(transform) : rawRows)
            .then(setData);
        }
    }), [url, data, transform]);
    React.useEffect(() => resource.fetch(), [url]);
    return resource;
}

export async function loginOrSignup(url: string, username: string, password: string) {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    const response = await fetch(url, {
        method: 'POST',
        body: form
    });
    if (response.ok) {
        return 'ok';
    }
    throw response;
}

export async function logout() {
    const response = await fetch('/logout');
    if (response.ok) {
        return 'ok';
    }
    throw response;
}

// async function fetchDishes() {
//     const response = await fetch('/dishes');
//     if (response.ok) {
//         return await response.json();
//     }
//     throw new Error("Request failed");
// }