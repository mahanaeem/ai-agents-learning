function calculator(expression) {
  `"use strict"`;
  return Function(`return (${expression})`)();
}

function getCurrentTime(){
  return new Date().toLocaleString();
}

function webSearch(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.open(url, '_blank');
}






const { runAgent } =
require("./agent");

console.log(
  runAgent("45 * 8")
);

console.log(
  runAgent("what is the time?")
);

console.log(
  runAgent("search AI agents")
);




module.exports = {
  calculator, getCurrentTime, webSearch
};
