import { Button, InputNumber, Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';

import { CustomSlider } from '@app/wireframes/components/menu/CustomSlider';


import './SelectPicker.scss';

interface NumberPickerProps {
    // The selected color.
    value?: number | null;
    min: number;
    max: number;
    asSlider?: boolean;

    className?: string;

    // Where to place the popover
    popoverPlacement?: TooltipPlacement;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (value: number) => void;
}

interface SelectPickerState {
    visible: boolean;

    value: number;
}

export class NumberPicker extends React.PureComponent<NumberPickerProps, SelectPickerState> {
    constructor(props: NumberPickerProps) {
        super(props);
        this.state = { visible: false, value: props.value };
    }

    public componentWillReceiveProps(newProps: NumberPickerProps) {
        this.setState(s => ({ ...s, value: newProps.value }));
    }

    private doSetVisibility = (visible: boolean) => {
        this.setState(s => ({ ...s, visible }));
    }

    private doToggle = () => {
        this.setState(s => ({ ...s, visible: !s.visible }));
    }

    private doSetValue = (value: number) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }

        this.setState({ visible: false });
    }

    public render() {
        const { asSlider, className, disabled, min, max } = this.props;

        const content = !asSlider ? <InputNumber value={this.state.value}
                min={min}
                max={max}
                onChange={value => this.doSetValue(value)} /> : <CustomSlider value={this.state.value}
                min={min}
                max={max}
                onChange={(value: number) => this.doSetValue(value)} />;

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