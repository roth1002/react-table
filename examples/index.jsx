import 'trendmicro-ui/dist/css/trendmicro-ui.css';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Navbar from './Navbar';
import Types from './tables/Types';
import Displays from './tables/Displays';
import FixedColumns from './tables/FixedColumns';
import Pagination from './tables/Pagination';
import RowSelection from './tables/RowSelection';
import ExpandedRow from './tables/ExpandedRow';

class App extends Component {

    render() {
        const name = 'React Table';
        const url = 'https://github.com/trendmicro-frontend/react-table';

        return (
            <div>
                <Navbar name={name} url={url} />
                <div className="container-fluid" style={{ padding: '20px 20px 0' }}>
                    <div className="row">
                        <Types />
                        <Displays />
                        <FixedColumns />
                        <Pagination />
                        <RowSelection />
                        <ExpandedRow />
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
