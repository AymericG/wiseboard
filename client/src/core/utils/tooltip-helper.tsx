import * as React from 'react';

export function withShortcut(text: string, keys: string[]) {
    return <>
        {text}
        {keys.map(x => <span className='key' key={x}>{x}</span>)}
    </>;
}
