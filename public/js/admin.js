
const historyFileElement = document.getElementById("history-file");
const statusElement = document.getElementById("status");

const processResponse = async function(response) {
    if (response.ok) {
        statusElement.textContent = "Success!";
    } else {
        statusElement.textContent = "ERROR: ".concat(await response.text());
    }

    statusElement.hidden = false;
}

const restoreHistory = async function () {
    if (this.files.length === 0) return;
    const response = await fetch('/restore', {
        method: 'POST',
        body: await this.files[0].text()
    })
    processResponse(response);
}

const deleteHistory = async function () {
    const response = await fetch('/reset', {
        method: 'POST',
        body: ""
    })
    processResponse(response);
}

historyFileElement.addEventListener("change", restoreHistory);