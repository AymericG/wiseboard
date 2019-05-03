import * as React from 'react';
import ReactDOM = require('react-dom');
import * as textFit from 'textfit';

interface ContentEditableProps {
    html: string;
    autoFocus?: boolean;
    style?: object;
    className?: string;
    onChange: (e: any) => any;
    onBlur?: (e: any) => any;
    onKeyDown?: (e: React.KeyboardEvent) => any;
}

export class ContentEditable extends React.Component<ContentEditableProps> {
    private lastHtml: string;
    private div: React.RefObject<any>;

    constructor(props: ContentEditableProps, context: any) {
        super(props, context);

        this.div = React.createRef();
    }

    public render() {
        return <div 
            ref={this.div}
            style={this.props.style}
            className={this.props.className}
            onKeyDown={this.props.onKeyDown}
            onInput={this.emitChange}
            onBlur={this.onBlur}
            contentEditable
            dangerouslySetInnerHTML = {{ __html: this.props.html }} />;
    }
                
    public shouldComponentUpdate(nextProps: ContentEditableProps) {
        return nextProps.html !== this.div.current.innerText;
    }

    public componentDidMount() {
        if (this.props.autoFocus) {
            this.div.current.focus();
        }
        this.updateTextSize();
     }

     private updateTextSize = () => {
        const div = ReactDOM.findDOMNode(this);
        if (!div) { return; }
        textFit(div, { alignHoriz: true, multiLine: true });
     }
     
    private onBlur = (e: React.FocusEvent) => {
        if (this.props.onBlur) { this.props.onBlur(e); }
        this.emitChange();
    }
    
    private emitChange = () => {
        const { onChange } = this.props; 
        const html = this.div.current.innerText;
        this.updateTextSize();
        if (onChange && html !== this.lastHtml) {

            onChange({
                target: {
                    value: html
                }
            });
        }
        this.lastHtml = html;
    }
}