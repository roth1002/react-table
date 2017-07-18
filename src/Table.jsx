import classNames from 'classnames';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import elementResizeDetectorMaker from 'element-resize-detector';
import styles from './index.styl';
import TableTemplate from './TableTemplate';

class Table extends PureComponent {
    static propTypes = {
        bordered: PropTypes.bool,
        justified: PropTypes.bool,
        // averageColumnsWidth is deprecated and will be removed in a future release.
        averageColumnsWidth: PropTypes.bool,
        columns: PropTypes.array,
        data: PropTypes.array,
        emptyText: PropTypes.func,
        expandedRowKeys: PropTypes.array,
        expandedRowRender: PropTypes.func,
        footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        hoverable: PropTypes.bool,
        loading: PropTypes.bool,
        loaderRender: PropTypes.func,
        maxHeight: PropTypes.number,
        onRowClick: PropTypes.func,
        showHeader: PropTypes.bool,
        sortable: PropTypes.bool,
        title: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        useFixedHeader: PropTypes.bool,
        rowClassName: PropTypes.func,
        rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
    };
    static defaultProps = {
        bordered: true,
        justified: true,
        columns: [],
        data: [],
        hoverable: true,
        loading: false,
        maxHeight: 0,
        sortable: false,
        useFixedHeader: false
    };

    resizer = elementResizeDetectorMaker();

    mainTable = null;

    state = this.getInitState();

    actions = {
        detectScrollTarget: (e) => {
            if (this.scrollTarget !== e.currentTarget) {
                this.scrollTarget = e.currentTarget;
            }
        },
        handleBodyScroll: (e) => {
            if (e.target !== this.scrollTarget) {
                return;
            }
            this.setState({
                scrollTop: e.target.scrollTop
            });
        },
        handleRowHover: (isHover, key) => {
            const { hoverable } = this.props;
            if (hoverable) {
                this.setState({
                    currentHoverKey: isHover ? key : null
                });
            }
        },
        getTableSize: () => {
            if (this.tableWrapper) {
                const { maxHeight } = this.props;
                const tableTopBorder = this.tableWrapper.style['border-top-width'] || window.getComputedStyle(this.tableWrapper, null)['border-top-width'];
                const tableBottomBorder = this.tableWrapper.style['border-bottom-width'] || window.getComputedStyle(this.tableWrapper, null)['border-bottom-width'];
                const headerHeight = this.title ? this.title.getBoundingClientRect().height : 0;
                const footerHeight = this.foot ? this.foot.getBoundingClientRect().height : 0;
                const tableHeight = maxHeight - headerHeight - footerHeight - parseInt(tableTopBorder, 10) - parseInt(tableBottomBorder, 10);
                const tableWidth = this.tableWrapper.getBoundingClientRect().width;
                this.setState({
                    tableHeight,
                    tableWidth
                });
            }
        }
    };

    componentDidMount() {
        const { getTableSize } = this.actions;
        this.resizer.listenTo(this.tableWrapper, getTableSize);
        window.addEventListener('resize', getTableSize);
        getTableSize();
    }

    componentWillUnmount() {
        const { getTableSize } = this.actions;
        this.resizer.removeListener(this.tableWrapper, getTableSize);
        window.removeEventListener('resize', getTableSize);
        this.tableWrapper = null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.columns !== this.props.columns) {
            this.setState({
                thisColumns: this.columnsParser()
            });
        }
        if (prevProps.data !== this.props.data ||
            prevProps.maxHeight !== this.props.maxHeight ||
            prevProps.expandedRowKeys !== this.props.expandedRowKeys) {
            const { getTableSize } = this.actions;
            getTableSize();
        }
    }

    getInitState () {
        return {
            currentHoverKey: null,
            scrollTop: 0,
            tableHeight: 0,
            tableWidth: 0,
            thisColumns: this.columnsParser()
        };
    }

    columnsParser() {
        return this.props.columns.filter((column) => {
            return column;
        });
    }

    leftColumns() {
        const columns = this.state.thisColumns;
        const fixedColumns = columns.filter((column) => {
            return column.fixed === true;
        });
        const lastFixedColumn = fixedColumns[fixedColumns.length - 1];
        const lastFixedIndex = columns.lastIndexOf(lastFixedColumn);
        return columns.filter((column, index) => {
            return index <= lastFixedIndex;
        });
    }

    isAnyColumnsLeftFixed() {
        const columns = this.state.thisColumns;
        return columns.some((column) => {
            return column.fixed === true;
        });
    }

    renderTable() {
        const columns = this.state.thisColumns;
        const { currentHoverKey, scrollTop, tableHeight, tableWidth } = this.state;
        const { detectScrollTarget, handleBodyScroll, handleRowHover } = this.actions;
        return (
            <TableTemplate
                {...this.props}
                columns={columns}
                currentHoverKey={currentHoverKey}
                maxHeight={tableHeight}
                maxWidth={tableWidth}
                onMouseOver={detectScrollTarget}
                onRowHover={handleRowHover}
                onTouchStart={detectScrollTarget}
                onScroll={handleBodyScroll}
                scrollTop={scrollTop}
                ref={node => {
                    this.mainTable = node;
                }}
            />
        );
    }

    renderFixedLeftTable() {
        const { currentHoverKey, scrollTop, tableHeight, tableWidth } = this.state;
        const { detectScrollTarget, handleBodyScroll, handleRowHover } = this.actions;
        let fixedColumns = this.leftColumns();
        return (
            <TableTemplate
                {...this.props}
                columns={fixedColumns}
                currentHoverKey={currentHoverKey}
                className={styles.tableFixedLeftContainer}
                maxHeight={tableHeight}
                maxWidth={tableWidth}
                isFixed={true}
                onMouseOver={detectScrollTarget}
                onRowHover={handleRowHover}
                onTouchStart={detectScrollTarget}
                onScroll={handleBodyScroll}
                scrollTop={scrollTop}
                ref={node => {
                    this.tableFixedLeft = node;
                }}
            />
        );
    }

    renderTitle() {
        const { title } = this.props;
        const content = (typeof title === 'function' ? title() : title);
        return (
            <div
                className={styles.title}
                ref={(node) => {
                    this.title = node;
                }}
            >
                {content}
            </div>
        );
    }

    renderFooter () {
        const { footer } = this.props;
        const content = (typeof footer === 'function' ? footer() : footer);
        return (
            <div
                className={styles.tfoot}
                ref={(node) => {
                    this.foot = node;
                }}
            >
                {content}
            </div>
        );
    }

    renderLoader() {
        const { loaderRender } = this.props;
        const defaultLoader = () => {
            return (
                <div className={styles.loaderOverlay}>
                    <span className={classNames(styles.loader, styles.loaderLarge)} />
                </div>
            );
        };
        const loader = loaderRender || defaultLoader;
        return loader();
    }

    render() {
        const {
            data,
            className,
            loading,
            bordered,
            title,
            footer,
            hoverable,
            sortable,
            useFixedHeader,
            ...props
        } = this.props;

        const justified = (props.averageColumnsWidth !== undefined)
            ? props.averageColumnsWidth
            : props.justified;
        delete props.justified;
        delete props.averageColumnsWidth;

        delete props.rowKey;
        delete props.columns;
        delete props.expandedRowRender;
        delete props.expandedRowKeys;
        delete props.maxHeight;
        delete props.rowClassName;
        delete props.onRowClick;
        delete props.emptyText;
        delete props.showHeader;

        return (
            <div
                {...props}
                className={classNames(
                    className,
                    styles.tableWrapper,
                    { [styles.tableMinimalism]: !bordered },
                    { [styles.tableBordered]: bordered },
                    { [styles.tableExtendColumnWidth]: !justified },
                    { [styles.tableFixedHeader]: useFixedHeader },
                    { [styles.tableNoData]: !data || data.length === 0 },
                    { [styles.tableHover]: hoverable },
                    { [styles.tableSortable]: sortable }
                )}
                ref={(node) => {
                    if (node) {
                        this.tableWrapper = node;
                    }
                }}
            >
                { title && this.renderTitle() }
                <div className={styles.tableArea}>
                    { this.renderTable() }
                    { this.isAnyColumnsLeftFixed() && this.renderFixedLeftTable() }
                    { loading && this.renderLoader() }
                </div>
                { footer && this.renderFooter() }
            </div>
        );
    }
}

export default Table;
