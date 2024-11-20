/* Code for new-exclusion.pug and edit-exclusion.pug
 ** Check for person of the same name (first & last) and display all previous
 ** exclusion information.
 */
const exclList = document.querySelector('.list');
const mainContainer = document.querySelector('.main-container');

function showData(list) {
  exclList.innerHTML = ''; //Set descriptionData to empty string to remove any data previously displayed

  //Loop over the list parameter
  for (let i = 0; i < list.length; i++) {
    //List all students from data.js
    if (i >= startIndex && i < endIndex) {
      //Using insertAdjacentHTML() method, dynamically add student info to index.html
      exclList.insertAdjacentHTML(
        'beforeend',
        `<h1>${list}</h1>
        `
      );
    }
  }
}

function searchPage(list) {
  mainContainer.insertAdjacentHTML(
    'afterbegin',
    `
      <div class="form-search-section">
        <label for="search" class="exclusion-search">
          <input id="search" placeholder="Search by name..." value="">
          <button type="button" class="submit-button"><i class="fa-solid fa-magnifying-glass"></i></button>
        </label>
      </div>
    `
  );

  //initialize variables for event listener
  const searchBar = mainContainer.querySelector('#search');
  const searchBtn = mainContainer.querySelector('.submit-button');

  searchBtn.addEventListener('click', (e) => { //target the search button
    filterData(list);
  });

  searchBar.addEventListener('keyup', (e) => {
    //target firstName field
    filterData(list);
  });

}

/*
Filter Search input
*/
function filterData(list) {
  //call list parameter
  const searchInputValue = mainContainer.querySelector('#search').value.toLowerCase(); //Target input id of 'search' and convert its value to lower case
  let filteredList = []; //Create a new array to hold the filtered results, below

  for (let i = 0; i < list.length; i++) {
    const fullName = `${list[i].name.first} ${list[i].name.last}`.toLowerCase(); //concatenate first and last name of students on the list and convert names to lower case
    //check to see if the full name matches any or all of the search input
    if (fullName.includes(searchInputValue)) {
      filteredList.push(list[i]); //add it to filteredList array
    }
  }

  if (!filteredList.length) {
    //Check to see if there are no matches
    exclList.innerHTML =
      '<p><strong>No results found for your search query.</strong></p>'; //let the user know
    console.log('no exclusion results found.');
  } else {
    showData(filteredList); //otherwise, send filteredList array to the showPage function
  }
}

// showData('', '');
// searchPage();
