import { Button, Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';

import './ColorPicker.scss';

import {
    Color,
    ColorPalette
} from '@app/core';

interface ColorPickerProps {
    // The selected color.
    value?: Color | string | null;

    className?: string;

    // The color palette.
    palette?: ColorPalette;

    // The active color tab.
    activeColorTab?: string;

    // Where to place the popover
    popoverPlacement?: TooltipPlacement;

    // If disabled or not.
    disabled?: boolean;

    // Triggered when the color has changed.
    onChange?: (color: Color) => void;

    // Triggered when the active color tab has changed.
    onActiveColorTabChanged?: (key: string) => void;
}

interface ColorPickerState {
    visible: boolean;

    color: Color;

    colorHex: string;
}

export class ColorPicker extends React.PureComponent<ColorPickerProps, ColorPickerState> {
    constructor(props: ColorPickerProps) {
        super(props);

        const color = props.value ? Color.fromValue(props.value) : Color.BLACK;

        this.state = { visible: false, color, colorHex: color.toString() };
    }

    public componentWillReceiveProps(newProps: ColorPickerProps) {
        const color = newProps.value ? Color.fromValue(newProps.value) : Color.BLACK;

        this.setState(s => ({ ...s, color, colorHex: color.toString() }));
    }

    private doSetVisibility = (visible: boolean) => {
        this.setState(s => ({ ...s, visible }));
    }

    private doToggle = () => {
        this.setState(s => ({ ...s, visible: !s.visible }));
    }

    private doSelectColor = (color: Color) => {
        if (this.props.onChange) {
            this.props.onChange(color);
        }

        this.setState({ visible: false, colorHex: color.toString() });
    }

    public render() {
        const { className, disabled } = this.props;

        const selectedPalette = this.props.palette || ColorPalette.colors();

        const colorClassName = (color: Color) => {
            if (color.eq(this.state.color)) {
                return 'color-picker-color selected';
            } else {
                return 'color-picker-color';
            }
        };

        const content = (
            <div className='color-picker-colors'>
                {selectedPalette.colors.map(c =>
                    <div className={colorClassName(c)} key={c.toString()} onClick={() => this.doSelectColor(c)} style={{background: c.toString()}} />
                )}
            </div>
        );

        const placement = this.props.popoverPlacement || 'left';

        return (
            <Popover content={content} visible={this.state.visible} placement={placement} trigger='click' onVisibleChange={this.doSetVisibility}>
                <Button disabled={disabled} className={className ? className + ' color-picker-button' : 'color-picker-button'}  onClick={this.doToggle}>
                    <div className='color-picker-color' style={{ background: this.state.colorHex }} />
                </Button>
            </Popover>
        );
    }
}