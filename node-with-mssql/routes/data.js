//data.js
const sql = require('mssql');

let childReportId; // Keep track of the rptId globally
let connectionDetails;

const config = {
  user: 'sa',
  password: 'admin@123',
  server: 'localhost',
  database: 'AerialView',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.then(() => {
  console.log('Connected to SQL Server');
}).catch((err) => {
  console.error('Error connecting to SQL Server:', err);
});


// to get the connection details from rptId and dynamically creates a new connection pool
const fetchConnectionDetails = async (rptId) => {
  // console.log('fetchConnectionDetails - rptId:', rptId);
  childReportId = rptId
  // console.log(childReportId)
  try {
    // console.log('Fetching connection details for rptId:', rptId);

    const reportDataViewResult = await pool.query(`SELECT * FROM ReportDATA_View WHERE RptId = ${rptId}`);
    // console.log('SQL Query:', `SELECT * FROM ReportDATA_View WHERE RptId = ${rptId}`);
    connectionDetails = reportDataViewResult.recordset[0];

    if (connectionDetails) {
      // console.log('Connection Details:', connectionDetails);
      // extract the database name from the connection string
      const databaseNameMatch = connectionDetails.stringName.match(/Initial Catalog=(.*?)(?:;|$)/i);
      const initialCatalog = databaseNameMatch ? databaseNameMatch[1] : null;


      // extract user id
      const userIdMatch = connectionDetails.stringName.match(/User ID=([^;]+)/i);
      const userId = userIdMatch ? userIdMatch[1] : null;

      // extract password
      ///^[a-zA-Z0-9@#$%^&*()-_+=!]{8,}$/
      const passwordMatch = connectionDetails.stringName.match(/Password=([^;]+)/i);
      const password = passwordMatch ? passwordMatch[1] : null;


      if (initialCatalog) {
        const dynamicConfig = {
          user: userId || 'sa',
          password: password || 'admin@123',
          server: 'localhost',
          database: initialCatalog,
          options: {
            encrypt: false,
            trustServerCertificate: true,
            persistSecurityInfo: false,
          },
        };

        // Check if the connection string includes Persist Security Info
        if (connectionDetails.stringName.toLowerCase().includes('persist security info=true')) {
          dynamicConfig.options.persistSecurityInfo = true;
        }
        const newPool = new sql.ConnectionPool(dynamicConfig);
        await newPool.connect();

        return { connectionDetails, newPool };
      } else {
        console.error('Initial Catalog not found in the connection string');
        return null;
      }
    } else {
      console.error('Connection details not found for the specified RptId');
      return null;
    }
  } catch (error) {
    console.error('Error fetching connection details:', error.message);
    throw error;
  }
};


// to get the table data using the connection pool 
const fetchTableData = async (newPool, dataTableName) => {
  try {
    const tableResult = await newPool.query(`SELECT * FROM ${dataTableName}`);
    await newPool.close();
    if (tableResult.recordset.length > 0) {
      return tableResult.recordset;
    } else {
      console.error('No data found in the specified table:', dataTableName);
      return null;
    }
  } catch (error) {
    console.error('Error fetching table data:', error.message);
    throw error;
  }
}

//to fetch filtered data based on filter option
const fetchTableDataWithFilter = async (newPool, dataTableName, filterOptions) => {
  console.log("filter option:", filterOptions)

  try {
    let whereClause = '';

    if (filterOptions) {
      if (filterOptions.startDate && filterOptions.endDate) {
        whereClause = ` WHERE DateAndTime BETWEEN '${filterOptions.startDate}' AND '${filterOptions.endDate}'`;
      } else if (filterOptions.standardFilter) {
        whereClause = applyStandardFilter(filterOptions.standardFilter);
      }
    }

    // checking if datatable name exist or not
    if (!dataTableName) {
      console.error('Invalid data table name:', dataTableName);
      return null
    }

    // Apply whereClause only if it's not an empty string
    const whereClauseCondition = whereClause !== '' ? whereClause : '';
    console.log(whereClauseCondition)

    console.log(`SELECT * FROM ${dataTableName}${whereClauseCondition}`);
    const tableResult = await newPool.query(`SELECT * FROM ${dataTableName}${whereClause}`).catch(err => {
      console.error("Error executing query:", err);
    });
    // console.log('table result:', tableResult) 

    await newPool.close();

    if (tableResult.recordset.length > 0) {
      return tableResult.recordset;
    } else {
      console.error('No data found with the specified filter:', filterOptions);
      return null;
    }

  } catch (error) {
    // console.error('Error fetching table data with filter:', error.message);
    throw error;
  }


}

// Function to apply standard filter
const applyStandardFilter = (standardFilter) => {

  if (standardFilter === null) {
    return null
  }


  const currentDate = new Date();
  const filterDate = new Date();

  switch (standardFilter) {
    case 'Previous Day':
      filterDate.setDate(currentDate.getDate() - 1);
      break;

    case '1 Week':
      filterDate.setDate(currentDate.getDate() - 7);
      break;

    case '1 Month':
      filterDate.setMonth(currentDate.getMonth() - 1);
      break;


    case '3 Months':
      filterDate.setMonth(currentDate.getMonth() - 3);
      break;

    case '6 Months':
      filterDate.setMonth(currentDate.getMonth() - 6);
      break;

    case '1 Year':
      filterDate.setFullYear(currentDate.getFullYear() - 1);
      break;

    case 'All':
      return '';

    default:
      return 'select from one of the option to see the required data';
  }
  const formattedFilterDate = filterDate.toISOString();
  return ` WHERE DateAndTime >= '${formattedFilterDate}'`;
};


// const excelSheet = () =>{
//   let excelsheetImg =  pool.query('SELECT * FROM ProjectSettings');
//   return excelsheetImg
// }




module.exports = {
  sql,
  pool,
  fetchConnectionDetails,
  fetchTableData,
  fetchTableDataWithFilter,
  applyStandardFilter,
  // excelSheet,
};