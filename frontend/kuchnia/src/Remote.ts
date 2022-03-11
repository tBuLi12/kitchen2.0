import React from 'react';

export interface Row {
    id: number
}

interface RemoteArray<T extends Row> {
    array: OuterElem<T>[] | undefined
    add(row: T | Omit<T, "id">): void
    refresh(): void
    batchUpdate(actions: OuterDataAction<T>[]): void
}

interface Elem<T extends Row> extends ElemProto<T> {
    data: T
}

export type OuterElem<T extends Row> = T & ElemProto<T>;

interface ElemProto<T extends Row> {
    delete(this: Elem<T>): void
    dispatch: React.Dispatch<Action<T>>
}

type Change<T extends Row> =
    | {action: "add", values: T}
    | {action: "update", id: number, values: Partial<T>}
    | {action: "delete", id: number}

interface State<T extends Row> { 
    array: Elem<T>[] | undefined
    lastKey: number
    changes: Change<T>[]
}

type DataAction<T extends Row> = 
    | {action: "add", row: T | Omit<T, "id">}
    | {action: "delete", row: Elem<T>}
    | {action: "update", current: Elem<T>, prop: string | symbol, value: any}

type OuterDataAction<T extends Row> = 
    | {action: "add", row: T | Omit<T, "id">}
    | {action: "delete", row: OuterElem<T>}
    | {action: "update", current: OuterElem<T>, prop: string | symbol, value: any}

type Action<T extends Row> = 
    | "lock"
    | DataAction<T>
    | {action: "setArray", array: T[]}
    | {action: "batch", actions: DataAction<T>[]}

type OrdType<T extends Row> = (e1: Elem<T>, e2: Elem<T>) => number;

function getReducer<T extends Row>(dspObj: { dispatch: React.Dispatch<Action<T>>}, ordering?: (r1: T, r2: T) => number): (state: State<T>, action: Action<T>) => State<T> {
    const elem = function(this: Omit<T, "id"> | T, data: T) {
        Object.defineProperty(this, "data", {value: data, writable: true});
    } as any as {new (data: T): Elem<T>, prototype: ElemProto<T>}
    elem.prototype = new Proxy({
        delete() {
            this.dispatch({action: "delete", row: this});
        },
        get dispatch() {
            return dspObj.dispatch;
        }
    }, {
        set(target, prop, value, receiver: Elem<T>) {
            receiver.dispatch({action: "update", current: receiver, prop, value});
            return true;
        },
        get(target, prop, receiver) {
            if (prop in receiver.data) {
                return receiver.data[prop];
            }
            //@ts-ignore
            return target[prop];
        }
    });
    function processDataAction(state: State<T> & {array: Elem<T>[]}, action: DataAction<T>): void {
        switch (action.action) {
            case "add":
                if ("id" in action.row) {
                    state.array.push(new elem(action.row));
                    state.changes.push({action: "add", values: {...action.row}})
                } else {
                    state.array.push(new elem({...action.row, id: state.lastKey} as T));
                    state.changes.push({action: "add", values: {...action.row, id: state.lastKey} as T});
                    --state.lastKey;
                }
                break;
            case "delete":
                state.array.splice(state.array.findIndex(elem => elem.data.id === action.row.data.id), 1);
                state.changes.push({action: "delete", id: action.row.data.id});
                break;                
            case "update":
                const i = state.array.findIndex(elem => elem.data.id === action.current.data.id)
                state.array[i] = new elem({...action.current.data, [action.prop]: action.value});
                state.changes.push({id: action.current.data.id, action: "update", values: {[action.prop]: action.value} as Partial<T>});
        }
    }
    function reducer(state: State<T>, action: Action<T>): State<T> {
        if (typeof action === "object") {
            if (action.action !== "setArray") {
                if (state.array !== undefined) {
                    const newState = {...state, array: [...state.array], changes: [...state.changes]};
                    if (action.action === "batch") {
                        action.actions.forEach(a => processDataAction(newState, a));
                    } else {
                        processDataAction(newState, action);
                    }
                    ordering && newState.array.sort(ordering as any as OrdType<T>);
                    return newState;
                }
                return state;
            }
            const arr = action.array.map(r => new elem(r));
            ordering && arr.sort(ordering as any as OrdType<T>);
            return {...state, array: arr, changes: []};
        }
        return {...state, array: undefined};
    }    
    return reducer;
}

function getRefresh() {
    let pending = false;
    function refresh<T extends Row>(url: string, dispatch: React.Dispatch<Action<T>>, changes: Change<T>[]) {
        if (!pending) {
            dispatch("lock");
            pending = true;
            (changes.length === 0 ? fetch(url) : fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changes)
            }))
            .then(res => res.json())
            .then(data => dispatch({action: "setArray", array: data}))
            .finally(() => pending = false);
        }
    }
    return refresh;
}


export function useRemoteArray<T extends Row>(url: string, ordering?: (r1: T, r2: T) => number): RemoteArray<T> {
    let disObj: {dispatch: React.Dispatch<Action<T>>} = {} as {dispatch: React.Dispatch<Action<T>>};
    let array: Elem<T>[] | undefined;
    let changes: Change<T>[];
    const reducer = React.useMemo(() => getReducer(disObj, ordering), [ordering]);
    const refresh = React.useMemo(getRefresh, []);
    [{ array, changes }, disObj.dispatch] = React.useReducer(reducer, {array: undefined, lastKey: -1, changes: []});
    let changesRef = React.useRef(changes);
    changesRef.current = changes;
    React.useEffect(function() {
        const onVChange = () => refresh(url, disObj.dispatch, changesRef.current);
        refresh(url, disObj.dispatch, []);
        document.addEventListener("visibilitychange", onVChange);
        window.addEventListener("pagehide", onVChange);
        return () => {
            document.removeEventListener("visibilitychange", onVChange);
            window.removeEventListener("pagehide", onVChange);
        }
    }, []);
    return {array: array as any as OuterElem<T>[] | undefined,
        add(row: T | Omit<T, "id">) {
            disObj.dispatch({action: "add", row});
        },
        refresh() {
            refresh(url, disObj.dispatch, changes);
        },
        batchUpdate(actions) {
            disObj.dispatch({action: "batch", actions: actions as any as DataAction<T>[]});
        }
    };
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
