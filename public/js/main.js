const operationForm = document.getElementById("operation-form");
const adminForm = document.getElementById("admin-form");
const adminLink = document.getElementById("admin-open");
const accumulator = document.getElementById("accumulator");
const historyTop = document.getElementById("history-list");

// returns a string representation of the number, capped at 8 digits of precision
// in order to avoid floating point nonsense
const formatNumber = function(num) {
  return ((num.toString().length < 9 || Math.abs(num) > 1) ? num.toString() : num.toFixed(8));
}

const update = async function (rawData) {
  console.log( 'data:', rawData )
  let parsedData = JSON.parse(rawData)
  // update the number using the final accumulator value of the last history entry
  accumulator.innerText = formatNumber(parsedData.at(-1).acc);

  // update the history
  // first, clear the existing history entries
  Array.from(document.getElementsByClassName("history-entry")).forEach(entry => entry.remove())
  for (const operation of parsedData) {
    let opElement = "<li class='history-entry'>&".concat(operation.operator).concat("; ").concat(formatNumber(operation.value)).concat(" = ").concat(formatNumber(operation.acc)).concat("</li>");
    historyTop.insertAdjacentHTML("afterbegin", opElement);
  }
}

const submitOperation = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  // I pulled this way of handling data from 
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio
  const data = new FormData(operationForm);
  const json = { operator: data.get("operator"), value: Number.parseFloat(data.get("value")) };
  const body = JSON.stringify( json )

  const response = await fetch( '/submit', {
    method:'POST',
    body 
  })

  const text = await response.text()
  update(text);
}

const submitAdmin = function ( event ) {
  event.preventDefault()
  const password = new FormData(adminForm).get("password");
  document.cookie="password=".concat(password);
  // redirect to the admin page
  window.location.href = "/admin";
} 

operationForm.addEventListener("submit", submitOperation);
adminForm.addEventListener("submit", submitAdmin);
adminLink.addEventListener("click", () => adminForm.hidden = false);

// from https://stackoverflow.com/questions/73519865/is-there-a-way-to-execute-asynchronous-code-inline-within-a-synchronous-function
(async () => {
  let initialData = await (await fetch("/data")).text();
  update(initialData);
})()