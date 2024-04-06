// index.js
var express = require('express');
var router = express.Router();
var fs = require('fs')
const { pool, fetchConnectionDetails, fetchTableData, applyStandardFilter, fetchTableDataWithFilter } = require('./data');

router.get('/', async function (req, res) {


  // icons for menu list
  const itemIcons = [
    { menuCode: 1, icon: 'ri-menu-2-line' },
    { menuCode: 2, icon: 'ri-file-chart-2-line' },
    { menuCode: 3, icon: 'ri-tools-line' },
    { menuCode: 4, icon: 'ri-settings-4-fill' },
    { menuCode: 5, icon: 'ri-dashboard-line' },
    { menuCode: 6, icon: 'ri-account-pin-box-line' },
    { menuCode: 7, icon: 'ri-terminal-window-line' },
  ]

  try {
    const mainMenuResult = await pool.query('SELECT * FROM Menu_Parent');
    const subMenuResult = await pool.query('SELECT * FROM Menu_Child_New');
    const childSubMenuResult = await pool.query('SELECT * from Menu_Child_2_New');
    const reportDataViewResult = await pool.query('Select * FROM ReportDATA_View');

    // const result = await pool.query(childSubMenuResult);

    const mainMenu = mainMenuResult.recordset;
    const subMenu = subMenuResult.recordset;
    const childSubMenu = childSubMenuResult.recordset;
    const reportDataView = reportDataViewResult.recordset;



    // res.render('index', { mainMenu, subMenu, childSubMenu, itemIcons });
    res.json({ mainMenu, subMenu, childSubMenu, itemIcons, reportDataView })
    console.log('Request received!');



  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }

})


router.post('/updateConfig', async (req, res) => {
  try {
    const { rptId } = req.body;
    // Call the updateDynamicConfig function with the rptId
    const { connectionDetails, newPool } = await fetchConnectionDetails(rptId);
    if (connectionDetails) {
      let tableData = await fetchTableData(newPool, connectionDetails.DataTableName);
      // console.log(tableData)

      res.json({
        message: 'RptId received and processed successfully',
        connectionDetails,
        tableData,
      });
    } else {
      res.status(404).json({ error: 'Connection details not found for the specified RptId' });
    }
  } catch (error) {
    console.error('Error updating config:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

//use where clause for filter
router.post('/applyFilters', async (req, res) => {

  try {
    const { rptIdValue, filterOptions, dataTableName } = req.body;
    console.log('index data table name:', dataTableName)

    if (!rptIdValue || !filterOptions) {
      return res.status(400).json({ error: 'index Invalid request' });
    }

    const { connectionDetails, newPool } = await fetchConnectionDetails(rptIdValue.connectionDetails.RptId);

    //checking if connectionDetails is valid 
    if (!newPool) {
      return res.status(500).json({ error: 'index Failed to connect to the database' });
    }

    let filteredData;

    // Construct the SQL query based on the filterOptions
    if (filterOptions.standardFilter) {
      // Handle standard filter
      const whereClause = applyStandardFilter(filterOptions.standardFilter);
      filteredData = await fetchTableDataWithFilter(newPool, rptIdValue.connectionDetails.TableName, whereClause);

    } else if (filterOptions.startDate && filterOptions.endDate) {
      // Handle date filter
      const whereClause = `WHERE DateAndTime >= '${filterOptions.startDate}' AND DateAndTime <= '${filterOptions.endDate}'`;
      filteredData = await fetchTableDataWithFilter(newPool, rptIdValue.connectionDetails.TableName, whereClause);
    } else {
      filteredData = []
    }

    filteredData = await fetchTableDataWithFilter(newPool, connectionDetails.DataTableName, filterOptions);

    res.json({ success: true, message: 'index Filter applied successfully', filteredData, connectionDetails });

  } catch (error) {
    console.error('index Error applying filters:', error.message);
    res.status(500).json({ error: 'index Internal Server Error' });
  }
});

router.post('/excelData', async function (req, res) {
  try {
    const excelImg = await pool.query('Select * from ProjectSettings');
    const excelImgRecord = excelImg.recordset;
    let bufferImg = excelImgRecord[0].Logo
    let clientName = excelImgRecord[0].ClientName
    let projName = excelImgRecord[0].ProjectName

    let base64Img = bufferImg.toString('base64')

    // console.log(excelImgRecord[0].ClientName)

    res.json({ clientName, projName, base64Img })
  } catch (error) {
    console.error('Error fetching image data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

})

module.exports = router;




