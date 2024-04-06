// datagrid.js
/* eslint-disable */
import React, { useState, useEffect } from 'react';
//Report Viewer source
import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';
import '@boldreports/javascript-reporting-controls/Content/material/bold.reports.all.min.css';
//Data-Visualization
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';
//Reports react base
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';

import 'devextreme/dist/css/dx.light.css';
import {
    DataGrid, Column, Paging, Pager, FilterRow, Editing, ColumnChooser, ColumnFixing, Scrolling, Export
} from 'devextreme-react/data-grid';
import { RadioGroup } from 'devextreme-react/radio-group';
import { SelectBox } from 'devextreme-react/select-box';
import { Button } from 'devextreme-react/button';
import DateBox from 'devextreme-react/date-box';

import {
    Grouping,
    GroupPanel
} from 'devextreme-react/data-grid';
import ExcelJs from 'exceljs';
import { useSidebar } from './sidebar';

import { jsPDF } from 'jspdf';
import { exportDataGrid } from 'devextreme/pdf_exporter';

import { TbTableExport } from "react-icons/tb";

// import companyImg from '../assets/images/company.png'



const dataTimeLabel = { 'aria-label': 'Date Time' };

const standardFilterOptions = ['Previous Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'All'];

const allowedPageSizes = [5, 10, 'all'];

const exportFormats = ['pdf'];


function MyDataGrid({ content }) {

    const [base64Img, setBase64Img] = useState('');
    const [clientName, setClientName] = useState('');
    const [projName, setProjName] = useState('');
    // const [previewButtonDisabled, setPreviewButtonDisabled] = useState(true); // State to control preview button disable

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/excelData', {
                method: 'POST',
            });

            ///use as a callback function
            const data = await response.json();
            setBase64Img(data.base64Img);
            setClientName(data.clientName);
            setProjName(data.projName);
            // console.log(data)

        } catch (error) {
            console.error('Error fetching image data:', error);
        }
    };

    // function for customised format of date and time
    function getFormattedDateTime(timeDifferenceInHours = 0) {
        let date = new Date();
        // console.log(date)
        date.setHours(date.getHours() - timeDifferenceInHours);

        return (
            date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2) + '.000'
        );
    }

    const { rptIdValue } = useSidebar() || {};
    const [filterType, setFilterType] = useState('Standard'); // Default filter type
    const [selectedStandardFilter, setSelectedStandardFilter] = useState(null)
    const [startDate, setStartDate] = useState(getFormattedDateTime(1));
    const [endDate, setEndDate] = useState(getFormattedDateTime(0));
    const [tableData, setTableData] = useState(rptIdValue ? rptIdValue.tableData : []);
    // State to control whether to display the Report Viewer
    const [showReportViewer, setShowReportViewer] = useState(false);

    useEffect(() => {
        setTableData([])
    }, [filterType])

    // Function to handle button click and toggle Report Viewer display
    const handleShowReportViewer = () => {
        setShowReportViewer(!showReportViewer);
    };



    const handleFilterTypeChange = (e) => {
        setFilterType(e.value);
    };


    let date = new Date()
    let dateForFile = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()


    //excel sheet function
    const handleClick = () => {
        const workbook = new ExcelJs.Workbook()
        const sheet = workbook.addWorksheet("Aerial View Testing");

        // header image
        const imageId1 = workbook.addImage({
            base64: base64Img,
            extension: 'png'
        })
        sheet.addImage(imageId1, "A1:A3")

        // cell headers
        const excelheaders = Object.keys(tableData[0])

        const headerlength = excelheaders.length
        const head = sheet.addRow(excelheaders)
        head.font = { bold: true }

        // Cell headers
        excelheaders.forEach((header, index) => {
            const cell = head.getCell(index + 1);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'ffffffcc' }
            };

            // Set borders for each cell
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };


        });


        function getColumnLetter(columnIndex) {
            let columnName = '';
            while (columnIndex > 0) {
                const remainder = (columnIndex - 1) % 26;
                columnName = String.fromCharCode(65 + remainder) + columnName;
                columnIndex = Math.floor((columnIndex - 1) / 26);
            }
            return columnName;
        }

        //header title
        const last = getColumnLetter(headerlength)
        // console.log(last)
        sheet.mergeCells(`B3:${last}3`)
        sheet.getCell("B3").value = content
        sheet.getCell("B3").alignment = { horizontal: "center", vertical: "middle" }
        sheet.getCell("B3").font = { bold: true, name: 'Arial' }
        sheet.getCell("B3").fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDDDDD' }
        }


        //client name
        sheet.mergeCells(`B1:${last}1`)
        sheet.getCell("B1").value = `Client: ${clientName}`
        sheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" }
        sheet.getCell("B1").font = { bold: true, name: 'Arial' }
        sheet.getCell("B1").fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDDDDD' }
        }

        //project name
        sheet.getCell("B2").value = `Project Name:  ${projName}`
        sheet.mergeCells(`B2:${last}2`)
        sheet.getCell("B2").alignment = { horizontal: "center", vertical: "middle" }
        sheet.getCell("B2").font = { bold: true, name: 'Arial' }

        // Add table data
        tableData.forEach((item) => {
            const datavalue = Object.values(item)
            sheet.addRow(datavalue);
            //date and time header
            let dateAndTimeCol = excelheaders[0]

            //date and time values
            let dateAndTimeVal = datavalue[0]

            if (dateAndTimeCol === 'DateAndTime') {
                const date = new Date(dateAndTimeVal)
                const formattedDateExcel = `${('00' + date.getDate()).slice(-2)}/${('00' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
                const formattedTime = date.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false })

                datavalue[0] = `${formattedDateExcel} ${formattedTime}`;

                let targetedCell = sheet.getCell(`A${sheet.lastRow.number}`);
                targetedCell.value = '';
                targetedCell.value = datavalue[0];

            } else {
                sheet.addRow(datavalue)
            }

        });

        //column auto-width
        sheet.columns.forEach((col) => {
            let maxlength = 0;
            col["eachCell"]({ includeEmpty: true }, function (cell) {
                var columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxlength) {
                    maxlength = columnLength;
                }
            })
            col.width = maxlength < 10 ? 10 : maxlength;
        })


        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${content}_${dateForFile}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }


    //pdf
    const onExporting = (e) => {
        const doc = new jsPDF();
        //x, y, width, height
        doc.addImage(base64Img, "png", 10, 10, 27, 15)
        // doc.getCell.forEach((col) => col.columnAutoWidth)


        exportDataGrid({
            orientation: e.component.columnCount() > 5 ? 'portrait' : 'landscape',
            jsPDFDocument: doc,
            component: e.component,
            // columnWidths: e.component.getVisibleColumns().map(column => column.width || 50), 
            // columnWidths: [30],
            // onRowExporting: (e) => {
            //     const isHeader = e.rowCells[0].text === 'Picture';
            //     if (!isHeader) {
            //       e.rowHeight = 40;
            //    e.rowCells = 4
            //       console.log(e)
            //     }
            //   },

            //   customDrawCell: (e) => {
            //     if (e.gridCell.rowType === 'data' && e.gridCell.column.dataField === 'Picture') {
            //       doc.addImage(e.gridCell.value, 'PNG', e.rect.x, e.rect.y, e.rect.w, e.rect.h);
            //       e.cancel = true;
            //     }
            //   },
            // indent: 20,
        }).then(() => {
            doc.save('Companies.pdf');
        });
    };



    const handleStandardFilterChange = (e) => {
        setSelectedStandardFilter(e.value)
        console.log(e, 'filter')
    }

    const handleStartDate = (e) => {
        if (e.value) {
            setStartDate(e.value);
        }
    }

    const handleEndDate = (e) => {
        if (e.value) {
            setEndDate(e.value);
        }
    }


    const handlePreviewButtonClick = async () => {
        const dataTableName = rptIdValue.connectionDetails.DataTableName;
        console.log("Data Table Name:", dataTableName)

        try {
            let filterOptions;
            if (filterType === 'Standard') {
                filterOptions = { standardFilter: selectedStandardFilter };
            } else if (filterType === 'Date') {
                filterOptions = { startDate, endDate }
                console.log(new Date(filterOptions.startDate).toLocaleString())
            }

            const response = await fetch('http://localhost:3000/applyFilters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rptIdValue, filterOptions, dataTableName }),
            })

            const responseData = await response.json();
            const filteredData = responseData.filteredData;

            // setTableData(filteredData);

            // Reset table data if a new menu item is selected
            if (filterType === 'Standard' || filterType === 'Date') {
                setTableData(filteredData);
            } else {
                setTableData([]);
            }

        } catch (error) {
            console.error("Error fetching filtered data:", error.message);
        }

        console.log('Preview button clicked!');
        console.log(tableData)
    };

    if (!rptIdValue || !rptIdValue.tableData) {
        return <div>Please select an item </div>;
    }

    var viewerStyle = { 'height': '700px', 'width': '100%' };

    return (
        <div className='dataGridView'>
            <div className='filterOptions'>
                <div className="dx-field-label"><i className="ri-filter-3-line filter-icon"></i> Filter : </div>
                <div className='radioOption'>
                    <RadioGroup items={['Standard', 'Date']} defaultValue={'Standard'} onValueChanged={handleFilterTypeChange} layout="horizontal" />
                </div>
                <div className="radioGroupContainer">

                    {filterType === 'Standard' && (
                        <SelectBox
                            className='standardFilter'
                            items={standardFilterOptions}
                            defaultValue={''}
                            onValueChanged={handleStandardFilterChange}
                        />

                    )}
                    {filterType === 'Date' && (
                        <div className='datePicker'>
                            <div className="dx-field fromDate">
                                <div className="dx-field-value">
                                    <DateBox className='dateBox'
                                        type="datetime"
                                        placeholder="Start date"
                                        showClearButton={true}
                                        inputAttr={dataTimeLabel}
                                        useMaskBehavior={true}
                                        onValueChanged={handleStartDate}
                                        defaultValue={startDate}
                                        displayFormat="dd/MM/yyyy HH:mm:ss"
                                    />
                                </div>
                            </div>

                            <div className="dx-field toDate">
                                <div className="dx-field-value">
                                    <DateBox className='dateBox'
                                        type="datetime"
                                        placeholder="End Date "
                                        showClearButton={true}
                                        inputAttr={dataTimeLabel}
                                        useMaskBehavior={true}
                                        onValueChanged={handleEndDate}
                                        defaultValue={endDate}
                                        displayFormat="dd/MM/yyyy HH:mm:ss"
                                    />
                                </div>
                            </div>
                        </div>

                    )}
                </div>

                <div>
                    <Button
                        className='previewBtn'
                        width={120}
                        text="Preview"
                        type="default"
                        stylingMode="contained"
                        onClick={handlePreviewButtonClick}
                        disabled={(filterType === 'Standard' && !selectedStandardFilter) || (filterType === 'Date' && (!startDate || !endDate))}
                    />


                </div>

                

                <button className='downloadExcelBtn' onClick={handleClick} title='Export all data to excel'>
                    <TbTableExport />
                </button>
            </div>



            <DataGrid
                id="dataGrid"
                dataSource={tableData}
                keyExpr={rptIdValue.connectionDetails.rptId}
                showBorders={true}
                columnMinWidth={100}
                columnAutoWidth={true}
                allowColumnResizing={true}
                width="100%"
                hoverStateEnabled={true}
                showColumnLines={true}
                showRowLines={true}
                onExporting={onExporting}

            >
                <Grouping contextMenuEnabled={true} />
                <GroupPanel visible={true} />
                <Scrolling rowRenderingMode="virtual"></Scrolling>
                <ColumnChooser enabled={true} />
                <ColumnFixing enabled={true} />
                <Editing confirmDelete={false} allowDeleting={true} />
                <Paging defaultPageSize={10} />

                <Export
                    enabled={true}
                    formats={exportFormats}
                    allowExportSelectedData={true}
                />

                <Pager
                    visible={true}
                    allowedPageSizes={allowedPageSizes}
                    displayMode={'full'}
                    showPageSizeSelector={true}
                    showInfo={true}
                    showNavigationButtons={true}
                />
                <FilterRow visible={true} />
                <Editing mode="popup" />
                {Object.keys(rptIdValue.tableData[0]).map((column, index) => (
                    <Column
                        allowReordering={true}
                        allowGrouping={column === "DateAndTime" ? false : true}
                        key={index}
                        dataField={column}
                        caption={column}

                        width={column === "DateAndTime" ? 200 : undefined}
                        // change the date display format
                        cellRender={(data) => {
                            if (column === "DateAndTime") {
                                const date = new Date(data.value);
                                const formattedDate = `${('00' + date.getDate()).slice(-2)}/${('00' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
                                const formattedTime = date.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false });
                                return `${formattedDate} ${formattedTime}`;
                            } else {
                                return data.value;
                            }
                        }}
                    />
                ))}

            </DataGrid>

            <Button
                    className='previewBtn'
                    width={120}
                    text={showReportViewer ? 'Hide Report Viewer' : 'Show Report Viewer'}
                    type="default"
                    stylingMode="contained"
                    onClick={handleShowReportViewer}
                />

                {/* Report Viewer component */}
                {showReportViewer && (
                    <div style={viewerStyle}>
                        <BoldReportViewerComponent
                            id="reportviewer-container"
                            reportServiceUrl={'https://demos.boldreports.com/services/api/ReportViewer'}
                            reportPath={'~/Resources/docs/sales-order-detail.rdl'} 
                            >
                        </BoldReportViewerComponent>
                    </div>
                )}
        </div>
    );
};

export default MyDataGrid;