// Target copyright
const copyright = document.querySelector('.copyright');

// Date code:
const date = new Date();
const thisYear = date.getFullYear();

// Adjust copyright year in footer
copyright.innerHTML = `©Copyright ${thisYear}, MTA-Exclusions.net | Created by <a href="https://www.backyarddev.io/" target="_blank"> BackyardDev`;