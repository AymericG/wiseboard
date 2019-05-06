import * as React from 'react';

export interface ClipboardHooksProps {
    onCopy: (e: ClipboardEvent) => void;
    onCut: (e: ClipboardEvent) => void;
    onPaste: (e: ClipboardEvent) => void;
}

export class ClipboardHooks extends React.Component<ClipboardHooksProps> {
    public componentDidMount() {
        document.addEventListener('copy', this.props.onCopy);
        document.addEventListener('cut', this.props.onCut);
        document.addEventListener('paste', this.props.onPaste);
    }

    public componentWillUnmount() {
        document.removeEventListener('copy', this.props.onCopy);
        document.removeEventListener('cut', this.props.onCut);
        document.removeEventListener('paste', this.props.onPaste);
    }
   

    public shouldComponentUpdate() {
        return false;
    }

    public render(): any {
        return null;
    }
}