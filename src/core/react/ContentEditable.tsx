import * as React from 'react';
import ReactDOM = require('react-dom');
import * as textFit from 'textfit';

interface ContentEditableProps {
    html: string;
    shouldFitText: boolean;
    autoFocus?: boolean;
    style?: object;
    className?: string;
    onChange: (e: any) => any;
    onBlur?: (e: any) => any;
    onKeyDown?: (e: React.KeyboardEvent) => any;
}

export class ContentEditable extends React.Component<ContentEditableProps> {
    private lastHtml: string;
    private span: React.RefObject<any>;

    constructor(props: ContentEditableProps, context: any) {
        super(props, context);
        this.span = React.createRef();
    }

    public render() {
        const { html } = this.props;
        const multiLine = !html ? html : html.replace(/\n/g, '<br/>');
        return <div 
            style={this.props.style}
            className={'editable ' + this.props.className}>
            <span 
                ref={this.span}
                onKeyDown={this.props.onKeyDown}
                onInput={this.emitChange}
                onBlur={this.onBlur}
                contentEditable 
                className='textFitted' 
                dangerouslySetInnerHTML = {{ __html: multiLine }}></span>
        </div>;
    }

    public shouldComponentUpdate(nextProps: ContentEditableProps) {
        return nextProps.style !== this.props.style || nextProps.html !== this.span.current.innerText;
    }
    public componentDidMount() {
        if (this.props.autoFocus) {
            this.span.current.focus();
        }
        this.updateTextSize();
     }

     private updateTextSize = () => {
        const div = ReactDOM.findDOMNode(this);
        if (!div || !this.props.shouldFitText) { return; }
        textFit(div, { alignHoriz: true, multiLine: true });
     }
     
    private onBlur = (e: React.FocusEvent) => {
        if (this.props.onBlur) { this.props.onBlur(e); }
        this.emitChange();
    }
    
    private emitChange = () => {
        const { onChange } = this.props; 
        const html = this.span.current.innerText;
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