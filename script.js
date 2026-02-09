let applications = JSON.parse(localStorage.getItem("applications")) || [];

document.getElementById("applicationForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const application = {
        company: document.getElementById("company").value,
        role: document.getElementById("role").value,
        stage: document.getElementById("stage").value,
        result: document.getElementById("result").value,
        date: document.getElementById("date").value
    };

    applications.push(application);
    saveData();
    renderTable();
    updateSummary();

    this.reset();
});

function renderTable() {
    const tbody = document.querySelector("#applicationsTable tbody");
    tbody.innerHTML = "";

    applications.forEach((app, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${app.company}</td>
            <td>${app.role}</td>
            <td>${app.stage}</td>
            <td>${app.result}</td>
            <td>${app.date}</td>
            <td><button class="delete-btn" onclick="deleteApplication(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteApplication(index) {
    applications.splice(index, 1);
    saveData();
    renderTable();
    updateSummary();
}

function updateSummary() {
    document.getElementById("totalApps").innerText = applications.length;
    document.getElementById("interviews").innerText = applications.filter(a => a.stage === "Interview").length;
    document.getElementById("offers").innerText = applications.filter(a => a.stage === "Offer").length;
    document.getElementById("rejected").innerText = applications.filter(a => a.stage === "Rejected").length;
}

function saveData() {
    localStorage.setItem("applications", JSON.stringify(applications));
}

// Load UI on start
renderTable();
updateSummary();