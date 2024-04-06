// Sidebar.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import '../stylesheets/style.css';
import 'remixicon/fonts/remixicon.css';
import Home from './home';

import ProfileDets from './profileDets';
import CompanyDetails from './companyDetails';


const SidebarContext = createContext();

function Sidebar({ mainMenu, itemIcons, subMenu, childSubMenu }) {

    const [rptIdValue, setRptIdValue] = useState()

    const [selectedExtraSubMenu, setSelectedExtraSubMenu] = useState(null);

    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getRptId = (rptId) => {
        // Send the RptId to the backend
        fetch('http://localhost:3000/updateConfig', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rptId }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setRptIdValue(data)
            })
            .catch(error => console.error('Error sending RptId to the backend:', error));
    };

    //to keep track of the selected menu item 
    const handleItemClick = useCallback((menu) => {
        setSelectedMenu(menu);

        // Call getRptId to send the rptId to the backend
        getRptId(menu.RptId);
    }, []);

    const handleSubMenuClick = (e) => {
        let arrowParent = e.currentTarget.parentElement.parentElement;
        arrowParent.classList.toggle("showMenu");
    };

    const handleSubMenuBtnClick = (e) => {
        let subMenuBtnParent = e.currentTarget.parentElement.parentElement;
        subMenuBtnParent.classList.toggle("showMenu");
    };

    const hasSubMenuItems = (subMenuCode, items) => items.some(item => item.SubMenuCode === subMenuCode);


    useEffect(() => {
        const arrow = document.querySelectorAll(".arrow");
        const subMenuBtn = document.querySelectorAll(".sub-menu-arrow");

        arrow.forEach((arrowItem) => arrowItem.addEventListener("click", handleSubMenuClick));
        subMenuBtn.forEach((subMenuBtnItem) => subMenuBtnItem.addEventListener("click", handleSubMenuBtnClick));

        return () => {
            arrow.forEach((arrowItem) => arrowItem.removeEventListener("click", handleSubMenuClick));
            subMenuBtn.forEach((subMenuBtnItem) => subMenuBtnItem.removeEventListener("click", handleSubMenuBtnClick));
        };
    }, []);

    return (
        <SidebarContext.Provider value={{ selectedMenu, rptIdValue }}>
            <div>
                <div className={`sidebar ${isSidebarOpen ? '' : 'close'}`}>

                    <CompanyDetails />

                    
                    <ul className="nav-links">
                        {mainMenu.map((menuItem) => {
                            const icon = itemIcons.find((icon) => icon.menuCode === menuItem.MenuCode);
                            const hasSubItems = hasSubMenuItems(menuItem.MenuCode, subMenu);

                            return (
                                // main menu with sub menu and child sub menu 
                                <li key={menuItem.MenuCode} onClick={handleSubMenuClick} >
                                    <div className={`icon-link ${hasSubItems ? 'showMenu' : ''}`}>
                                        <div className='listMenu' onClick={handleSubMenuClick} href='#'>
                                            {icon ? (
                                                <i className={icon.icon} />
                                            ) : (
                                                <i className="ri-list-indefinite"></i>
                                            )}
                                            <span className="link_name">{menuItem.MenuName}</span>
                                        </div>
                                        {hasSubItems && (
                                            <i onClick={handleSubMenuClick} className="ri-arrow-down-s-line arrow"></i>
                                        )}
                                    </div>
                                    {/* sub menu */}
                                    <ul className={`sub-menu ${hasSubItems ? 'showMenu' : ''}`}>
                                        {subMenu
                                            .filter((subItem) => subItem.MainMenuCode === menuItem.MenuCode)
                                            .map((subItem) => (
                                                <li key={subItem.SubMenuCode}>
                                                    <div className="icon-link">
                                                        <div className='listMenu' href="#">
                                                            <i className="ri-box-3-line"></i>
                                                            <span>{subItem.SubMenuName}</span>
                                                        </div>
                                                        {hasSubMenuItems(subItem.SubMenuCode, childSubMenu) && (
                                                            <i onClick={handleSubMenuBtnClick} className="ri-arrow-right-s-line sub-menu-arrow"></i>
                                                        )}
                                                    </div>
                                                    {/* extra sub menu */}
                                                    <ul className="extra-sub-menu" >
                                                        {
                                                            childSubMenu.filter((childItem) => childItem.SubMenuCode === subItem.SubMenuCode)
                                                                .map((childItem, i) => (
                                                                    <li className={`extraMenuItem ${selectedExtraSubMenu === childItem ? 'activeExtraMenu' : ''}`} key={i} onClick={() => {
                                                                        handleItemClick(childItem)
                                                                        getRptId(childItem.RptId)
                                                                        setSelectedExtraSubMenu(childItem);

                                                                    }} >

                                                                        <div className='icon-link' style={{ cursor: "pointer" }}>
                                                                            <div className='custom-link' >
                                                                                <i className="ri-bard-line"></i>
                                                                                <span>{childItem.SubChildName}</span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                        }
                                                    </ul>
                                                </li>
                                            ))}
                                    </ul>
                                </li>
                            );
                        })}
                        {/* profile details */}
                        <ProfileDets />
                    </ul>
                </div>
                {/* home section */}
                <Home isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} childSubMenu={childSubMenu} getRptId={getRptId} rptIdValue={rptIdValue} />

            </div>


        </SidebarContext.Provider>


    );

};

export const useSidebar = () => useContext(SidebarContext);

export default Sidebar;
