// const search = document.querySelector('.top-nav');

// const personData = []; //declare an array to store the returned random user data

// function searchList(names) {
//   search.insertAdjacentHTML('afterbegin', `
//     <form action="#" method="get" class="search-bar">
//         <input type="search" id="search-input" class="search-input" placeholder="Search...">
//         <button type="submit" value="&#x1F50D;" id="search-submit" class="search-submit"><i class="fa fa-search"></i></button>
//     </form>
//   `);
//     const searchBtn = document.querySelector('.search-submit');
//     const searchBar = document.querySelector('.search-input');
//     //search using click handler on search button element
//     searchBtn.addEventListener('click', (e) => { //target the search button
//       filterNames(names);
//     });
//     //Live/active search using 'keyup' event handler
//     searchBar.addEventListener('keyup', (e) => { //target the search bar
//       filterNames(names);
//     });
// }

// function filterNames(names) { //call list parameter
//   const searchInputValue = document.querySelector('#search-input').value.toLowerCase(); //target input id of 'search-input' and convert its value to lower case
//   let filteredList = []; //Create a new array to hold the filtered results, below
//   for (let i = 0; i < personData.length; i++) {
//     //check to see if the full name matches any or all of the search input
//     if (personData[i].fullName.toLowerCase().includes(searchInputValue)) { //convert name to lowerCase and check against search input value
//       filteredList.push(names[i]); //if it's a "match" add it to filteredList array
//     }
//   }

//   if (filteredList.length === 0) { //Check to see if there are no matches
//     gallery.innerHTML = '<h1>No search results found.</h1>'; //let the user know
//   } else {
//     canToggle = false; //set to false to prevent generateModalHTML() from automatically opening the modal window
//     generateGalleryHTML(filteredList);
//   }
// }

// searchList(personData); //add a search bar

const copyright = document.querySelector('.copyright');

// Date code:
const date = new Date();
const thisYear = date.getFullYear();

copyright.innerHTML = `©Copyright ${thisYear}, MTA-Exclusions.net | Created by <a href="https://www.backyarddev.io/" target="_blank"> BackyardDev`;