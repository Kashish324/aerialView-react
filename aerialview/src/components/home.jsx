// home.js
import React from 'react';
import MyDataGrid from './datagrid';
import { useSidebar } from './sidebar';

function Home({ isSidebarOpen, setIsSidebarOpen, rptIdValue }) {

    //check every value and if any value is null or  undefined , the enire expression will evaluate to an empty string
    const connectionString = rptIdValue?.connectionDetails?.stringName || '';

    // search for initial catalog value and get its value
    const initialCatalogMatch = connectionString.match(/Initial Catalog=([^;]*)/);
    const initialCatalog = initialCatalogMatch ? initialCatalogMatch[1] : '';


    const { selectedMenu } = useSidebar() || {};

    const content = selectedMenu ? `${selectedMenu.SubChildName}` : 'Home Page';

    const headerContent = initialCatalog ? `${initialCatalog}` : 'AerialView Reporting Software'

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };



    return (
        <>
            <section className="home-section">
                <div className="home-content">
                    <div className='headerContent'>
                        {isSidebarOpen ? (
                            <i className="ri-arrow-left-double-fill bx bx-menu" onClick={handleSidebarToggle} title=" Close Sidebar "></i>
                        ) : (
                            <i className="ri-arrow-right-double-line bx bx-menu" onClick={handleSidebarToggle} title=" Open Sidebar "></i>
                        )}
                        <span className="text">{headerContent}</span>
                    </div>
                    <div className='tableContent'>
                        <h1 className='tableHeading'> {content} </h1>
                    </div>
                    <MyDataGrid content={content} />
                </div>
            </section>
        </>
    );
};

export default Home;