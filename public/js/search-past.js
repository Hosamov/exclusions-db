/* Code for new-exclusion.pug and edit-exclusion.pug
 ** Check for person of the same name (first & last) and display all previous
 ** exclusion information.
 */
const firstName = document.getElementById('first_name');
const lastName = document.getElementById('last_name');
const descriptionData = document.querySelector('.description-data');

function showData(list1, list2) {
  descriptionData.innerHTML = ''; //Set descriptionData to empty string to remove any data previously displayed

  //Loop over the list parameter
  for (let i = 0; i < list1.length; i++) {
    //List all students from data.js
    if (i >= startIndex && i < endIndex) {
      //Using insertAdjacentHTML() method, dynamically add student info to index.html
      descriptionData.insertAdjacentHTML(
        'beforeend',
        `<h1>HELLO: ${list1}</h1>
        `
      );
    }
  }
}

function searchPage(list1, list2) {

  firstName.addEventListener('keyup', (e) => {
    //target firstName field
    filterData(list1);
  });

  lastName.addEventListener('keyup', (e) => {
    //target lastName field
    filterData(list2);
  });
}

/*
Filter Search input
*/
function filterData(list) {
  //call list parameter
  const searchInputValueFName = firstName.value.toLowerCase();
  const searchInputValueLName = lastName.value.toLowerCase();
  let filteredFirstNameList = []; //Create a new array to hold the filtered results, below
  let filteredLastNameList = [];

  for (let i = 0; i < list.length; i++) {
    const firstNameValue = `${list[i].first_name}`.toLowerCase(); //concatenate first and last name of students on the list and convert names to lower case
    const lastNameValue = `${list[i].last_name}`.toLowerCase();
    //check to see if the full name matches any or all of the search input
    if (firstNameValue.includes(searchInputValueFName)) {
      filteredFirstNameList.push(list[i]);
    }

    if (lastNameValue.includes(searchInputValueLName)) {
      filteredLastNameList.push(list[i]);
    }
  }

  if (!filteredFirstNameList.length) {
    //Check to see if there are no matches
    descriptionData.innerHTML = '<h1>No results found.</h1>'; //let the user know
  } else {
    showData(filteredFirstnameList, filteredLastNameList); //otherwise, send filteredList array to the showPage function
  }
}

showData('', '');
searchPage('', '');
