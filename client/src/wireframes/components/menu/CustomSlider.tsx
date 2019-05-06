import { Slider } from 'antd';
import * as React from 'react';

interface CustomSliderProps {
    // The slider value.
    value: number;

    // The minimum slider value.
    min: number;

    // The maximum slider value.
    max: number;

    // Change the items appearance..
    onChange: (value: number) => void;
}

interface CustomSliderState {
    // The slider value.
    value: number;
}

export class CustomSlider extends React.PureComponent<CustomSliderProps, CustomSliderState> {
    constructor(props: CustomSliderProps) {
        super(props);

        this.state = { value: props.value };
    }

    public componentWillReceiveProps(nextProps: CustomSliderProps) {
        this.doSetValue(nextProps.value);
    }

    private doSetValue = (value: number) => {
        this.setState({ value });
    }

    private doEmitValue = (value: number) => {
        this.props.onChange(value);
    }

    public render() {
        return (
            <Slider
                value={this.state.value}
                min={this.props.min}
                max={this.props.max}
                onChange={this.doSetValue}
                onAfterChange={this.doEmitValue} />
        );
    }
}