import React, {Component} from 'react';

import Row from './Row';

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {}
        };
    }

    handleChangedCell = ({x, y}, value) => {
        const modifiedData = {...this.state.data};
        if (!modifiedData[y]) {
            modifiedData[y] = {};
        }
        modifiedData[y][x] = value;
        this.setState({data: modifiedData});
    }

    updateCells = () => {
        this.forceUpdate();
    }

    render () {
        const rows = [];

        for (let i = 0; i < this.props.y + 1; i++) {
            const rowData = this.state.data[i] || {};

            rows.push(
                <Row handleChangedCell={this.handleChangedCell}
                    updateCells={this.updateCells}
                    key={y}
                    y={i}
                    x={this.props.x + 1}
                    rowData={rowData} />
            )
        }

        return <div>{rows}</div>
    }
}

export default Table;