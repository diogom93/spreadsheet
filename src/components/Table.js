import React, {Component} from 'react';
import {Parser as FormulaParser} from 'hot-formula-parser';

import Row from './Row';

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {}
        };

        this.tableIdentifier = `tableData-${props.id}`;

        this.parser = new FormulaParser();

        this.parser.on('callCellValue', (cellCoordinate, done) => {
            const x = cellCoordinate.column.index + 1;
            const y = cellCoordinate.row.index + 1;

            if (x > props.x || y > props.y) {
                throw this.parser.Error(this.parser.ERROR_NOT_AVAILABLE);
            }

            if (x === props.x && y === props.y) {
                throw this.parser.Error(this.parser.ERROR_REF);
            }

            if (!this.state.data[y] || !this.state.data[y][x]) {
                return done('');
            }

            return done(this.state.data[y][x]);
        });

        this.parser.on('callRangeValue', (startCellCoordinate, endCellCoordinate, done) => {
            const startX = startCellCoordinate.column.index + 1;
            const startY = startCellCoordinate.row.index + 1;
            const endX = endCellCoordinate.column.index + 1;
            const endY = endCellCoordinate.row.index + 1;
            const fragment = [];

            for (let y = startY; y <= endY; y++) {
                const row = this.state.data[y];
                if (!row) {
                    continue;
                }

                const columnFragment = [];

                for (let x = startX; x <= endX; x++) {
                    let value = row[x];
                    if (!value) {
                        value = '';
                    }

                    if (value.slice(0, 1) === '=') {
                        const res = this.executeFormula({x, y}, value.slice(1));
                        if (res.error) {
                            throw this.parser.Error(res.error);
                        }

                        value = res.result;
                    }

                    columnFragment.push(value);
                }

                fragment.push(columnFragment);
            }

            if (fragment) {
                done(fragment);
            }
        });
    }

    componentWillMount = () => {
        const data = localStorage.getItem(this.tableIdentifier);
        if (data) {
            this.setState({data: JSON.parse(data)});
        }
    }

    executeFormula = (cell, value) => {
        this.parser.cell = cell;

        let res = this.parser.parse(value);
        if (res.error || res.result.toString() === '') {
            return res;
        }

        if (res.result.toString().slice(0, 1) === '=') {
            res = this.executeFormula(cell, res.result.slice(1));
        }

        return res;
    }

    handleChangedCell = ({x, y}, value) => {
        const modifiedData = {...this.state.data};
        if (!modifiedData[y]) {
            modifiedData[y] = {};
        }
        modifiedData[y][x] = value;
        this.setState({data: modifiedData});

        localStorage.setItem(this.tableIdentifier, JSON.stringify(modifiedData));
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
                    key={i}
                    y={i}
                    x={this.props.x + 1}
                    rowData={rowData}
                    executeFormula={this.executeFormula} />
            )
        }

        return <div>{rows}</div>
    }
}

export default Table;