import * as React from 'react';

import './UserCursor.scss';

interface UserCursorProps {
    name: string;
    color: string;
}

function rollDice(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
}

interface UserCursorState {
    x: number;
    y: number;
}

export class UserCursor extends React.PureComponent<UserCursorProps, UserCursorState> {

    constructor(props: UserCursorProps, context: any) {
        super(props, context);
        this.state = { x: rollDice(0, 1600), y: rollDice(0, 1600) };
    }

    public componentDidMount() {
        this.next();
    }

    private changePosition = () => {
        this.setState({ x: rollDice(0, 1600), y: rollDice(0, 1600)});
    }

    private next = () => {
        this.changePosition();
        setTimeout(this.next, rollDice(5000, 10000));
    }
    
    public render() {
        return <div className='user-cursor' style={{ color: this.props.color, left: this.state.x, top: this.state.y }}>
        <i className='fa fa-mouse-pointer' />
        <div className='user-name' style={{ backgroundColor: this.props.color }}>{this.props.name}</div>
    </div>;

    }
}
