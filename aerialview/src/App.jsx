// app.jsx

/* eslint-disable */
import React, { useEffect, useState } from 'react';



import Sidebar from './components/sidebar';


const App = () => {
  const [menuData, setMenuData] = useState({
    mainMenu: [],
    subMenu: [],
    childSubMenu: [],
    itemIcons: [],
  });

  useEffect(() => {
    const apiUrl = 'http://localhost:3000/';



    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setMenuData({
          mainMenu: data.mainMenu,
          subMenu: data.subMenu,
          childSubMenu: data.childSubMenu,
          itemIcons: data.itemIcons,
        });
      })
      .catch((error) => {
        console.error('Error during fetch:', error.message);
      });
  }, []);



  return (
    <>
      <Sidebar {...menuData} />

    </>

  )
};

export default App;