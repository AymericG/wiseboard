import { Button, Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';

import './SelectPicker.scss';

interface SelectPickerProps {
    // The selected color.
    value?: string | null;

    options: string[];

    className?: string;

    // Where to place the popover
    popoverPlacement?: TooltipPlacement;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (value: string) => void;
}

interface SelectPickerState {
    visible: boolean;

    value: string;
}

export class SelectPicker extends React.PureComponent<SelectPickerProps, SelectPickerState> {
    constructor(props: SelectPickerProps) {
        super(props);
        this.state = { visible: false, value: props.value };
    }

    public componentWillReceiveProps(newProps: SelectPickerProps) {
        this.setState(s => ({ ...s, value: newProps.value }));
    }

    private doSetVisibility = (visible: boolean) => {
        this.setState(s => ({ ...s, visible }));
    }

    private doToggle = () => {
        this.setState(s => ({ ...s, visible: !s.visible }));
    }

    private doSelectItem = (value: string) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }

        this.setState({ visible: false });
    }

    public render() {
        const { className, disabled, options } = this.props;

        const itemClassName = (value: string) => {
            if (value === this.state.value) {
                return 'select-picker-item selected';
            } else {
                return 'select-picker-item';
            }
        };

        const content = (
            <ul className='select-picker-items'>
                {options.map(c =>
                    <li 
                        className={itemClassName(c)} 
                        key={c.toString()} 
                        onClick={() => this.doSelectItem(c)} 
                        style={{background: c.toString()}}>
                        {c}
                    </li>
                )}
            </ul>
        );

        const placement = this.props.popoverPlacement || 'bottom';

        return (
            <Popover content={content} visible={this.state.visible} placement={placement} trigger='click' onVisibleChange={this.doSetVisibility}>
                <Button disabled={disabled} className={className}  onClick={this.doToggle}>
                    {this.state.value}
                </Button>
            </Popover>
        );
    }
}