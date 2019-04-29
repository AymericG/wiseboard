import { Reducer } from 'redux';

let url = 'https://api.mydraft.cc';

if (process.env.NODE_ENV === 'test_development') {
    url = 'http://localhost:4000';
}

export function autoPersistable<T>(reducer: Reducer<T>): Reducer {
    return (state: any, action: any) => {
        const nextState: any = reducer(state, action);
        if (!!nextState && !!nextState.loading && !!nextState.loading.isLoaded) {
            if (nextState.editor.presentState !== state.editor.presentState) {
                const s = nextState;
                const readToken = s.loading.readToken || 'default';
                const body = JSON.stringify(s.editor.actions);
                console.log('autosaving...' + `${url}/${readToken}`);
                localStorage.setItem(`${url}/${readToken}`, body);
            }
        }
        return nextState;
    };
}
