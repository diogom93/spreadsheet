import React, { Component } from 'react';

class Cell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: false,
            editing: false,
            value: props.value
        }

        this.display = this.determineDisplay({x: props.x, y: props.y}, props.value);
        this.timer = 0;
        this.delay = 200;
        this.prevent = false;
    }

    componentDidMount = () => {
        window.document.addEventListener('unselectAll', this.handleUnselectAll);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.value !== '' && this.state.value.slice(0, 1) === '=') {
            return true;
        }

        if (nextState.value !== this.state.value || nextState.editing !== this.state.editing || nextState.selected !== this.state.selected || nextProps.value !== this.props.value) {
                return true;
            }

        return false;
    }

    componentWillUpdate() {
        this.display = this.determineDisplay({x: this.props.x, y: this.props.y}, this.state.value);
    }

    componentWillUnmount() {
        window.document.removeEventListener('unselectAll', this.handleUnselectAll);
    }

    onBlur = event => {
        this.hasNewValue(event.target.value);
    }

    handleKeyPressOnInput = event => {
        if (event.key === 'Enter') {
            this.hasNewValue(event.target.value);
        }
    }

    handleKeyPressOnSpan = event => {
        if (!this.state.editing) {
            this.setState({editing: true});
        }
    }

    handleClick = () => {
        this.timer = setTimeout(() => {
            if (!this.prevent) {
                this.triggerUnselectAll();
                this.setState({selected: true});
            }

            this.prevent = false;
        }, this.delay);
    }

    handleDoubleClick = () => {
        clearTimeout(this.timer);
        this.prevent = true;
        this.triggerUnselectAll();
        this.setState({selected: true, editing: true});
    }

    handleChange = event => {
        this.setState({value: event.target.value});
        this.display = this.determineDisplay({x: this.props.x, y: this.props.y}, event.target.value);
    }

    handleUnselectAll = () => {
        if (this.state.selected || this.state.editing) {
            this.setState({selected: false, editing: false});
        }
    }

    triggerUnselectAll = () => {
        const unselectAllEvent = new Event('unselectAll');
        window.document.dispatchEvent(unselectAllEvent);
    }

    hasNewValue = value => {
        this.props.handleChangedCell({x: this.props.x, y: this.props.y}, value);
        this.setState({editing: false});
    }

    determineDisplay = ({x, y}, value) => {
        if (value.slice(0, 1) === '=') {
            const res = this.props.executeFormula({x, y}, value.slice(1));
            if (res.error) {
                return '#INVALID!';
            }

            return res.result;
        }

        return value;
    }

    calculateCss = () => {
        const css = {
            width: '80px',
            padding: '4px',
            margin: '0',
            height: '25px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'inline-block',
            color: 'black',
            border: '1px solid #cacaca',
            textAlign: 'left',
            verticalAlign: 'top',
            fontSize: '14px',
            lineHeight: '15px',
            overflow: 'hidden',
            fontFamily: "Calibri, 'Segoe UI', Thonburi, Arial, Verdana, sans-serif"
        }

        if (this.props.x === 0 || this.props.y === 0) {
            css.textAlign = 'center'
            css.backgroundColor = '#f0f0f0'
            css.fontWeight = 'bold'
        }

        if (this.state.selected) {
            css.outlineColor = 'lightblue'
            css.outlineStyle = 'dotted'
        }

        return css
    }

    render() {
        const css = this.calculateCss();

        if (this.props.y === 0) {
            const alpha = ' abcdefhijklmnopqrstuvwxyz'.toUpperCase().split('');
            return (
                <span onKeyPress={this.handleKeyPressOnSpan}
                    style={css}
                    role="presentation">{alpha[this.props.x]}</span>
            )
        }

        if (this.props.x === 0) {
            return <span style={css}>{this.props.y}</span>
        }

        if (this.state.editing) {
            return (
                <input style={css}
                    type="text"
                    onBlur={this.onBlur}
                    onKeyPress={this.handleKeyPressOnInput}
                    onChange={this.handleChange}
                    value={this.state.value}
                    autoFocus />

            )
        }

        return (
            <span onClick={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                style={css}
                role="presentation">{this.display}</span>
        );
    }
}

export default Cell;