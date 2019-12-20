import React, {Component} from 'react';

import Cell from './Cell';

class Row extends Component {
    render () {
        const cells = [];

        for (let i = 0; i < this.props.x; i++) {
            cells.push(
                <Cell key={`${i}-${this.props.y}`}
                    y={this.props.y}
                    x={i}
                    handleChangedCell={this.props.handleChangedCell}
                    updateCell={this.props.updateCell}
                    value={this.props.rowData[i] || ''}/>
            )
        }

        return <div>{cells}</div>;
    }
}

export default Row;