// Application State
let applications = JSON.parse(localStorage.getItem("applications")) || [];
let currentFilter = 'all';

// DOM Elements
const form = document.getElementById("applicationForm");
const tableBody = document.getElementById("tableBody");
const searchBox = document.getElementById("searchBox");
const filterChips = document.querySelectorAll(".filter-chip");
const exportBtn = document.getElementById("exportBtn");

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    updateSummary();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    form.addEventListener("submit", handleFormSubmit);
    searchBox.addEventListener("input", handleSearch);
    filterChips.forEach(chip => {
        chip.addEventListener("click", handleFilterChange);
    });
    exportBtn.addEventListener("click", exportData);
}

// Form Submit Handler
function handleFormSubmit(e) {
    e.preventDefault();

    const application = {
        id: Date.now(),
        company: document.getElementById("company").value.trim(),
        role: document.getElementById("role").value.trim(),
        stage: document.getElementById("stage").value,
        result: document.getElementById("result").value,
        date: document.getElementById("date").value,
        notes: document.getElementById("notes").value.trim() || "—"
    };

    applications.push(application);
    saveData();
    renderTable();
    updateSummary();
    form.reset();

    // Success feedback
    showNotification("Application added successfully! 🎉");
}

// Render Table
function renderTable() {
    let filteredApps = [...applications];

    // Apply stage filter
    if (currentFilter !== 'all') {
        filteredApps = filteredApps.filter(app => app.stage === currentFilter);
    }

    // Apply search filter
    const searchTerm = searchBox.value.toLowerCase();
    if (searchTerm) {
        filteredApps = filteredApps.filter(app =>
            app.company.toLowerCase().includes(searchTerm) ||
            app.role.toLowerCase().includes(searchTerm)
        );
    }

    // Clear table
    tableBody.innerHTML = "";

    // Show empty state if no applications
    if (filteredApps.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "empty-state";
        emptyRow.innerHTML = `
            <td colspan="8">
                <div class="empty-message">
                    <div class="empty-icon">📭</div>
                    <p>${applications.length === 0 ? 'No applications yet. Add your first one above!' : 'No matching applications found.'}</p>
                </div>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }

    // Render applications
    filteredApps.forEach(app => {
        const row = document.createElement("tr");

        const stageClass = app.stage.replace(/\s+/g, '-').replace(/[()]/g, '');
        const daysAgo = calculateDaysAgo(app.date);

        row.innerHTML = `
            <td><strong>${escapeHtml(app.company)}</strong></td>
            <td>${escapeHtml(app.role)}</td>
            <td><span class="stage-badge stage-${stageClass}">${app.stage}</span></td>
            <td><span class="result-badge result-${app.result}">${app.result}</span></td>
            <td>${formatDate(app.date)}</td>
            <td>${daysAgo}</td>
            <td>${escapeHtml(app.notes)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editApplication(${app.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteApplication(${app.id})">Delete</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Delete Application
function deleteApplication(id) {
    if (confirm("Are you sure you want to delete this application?")) {
        applications = applications.filter(app => app.id !== id);
        saveData();
        renderTable();
        updateSummary();
        showNotification("Application deleted successfully!");
    }
}

// Edit Application
function editApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    document.getElementById("company").value = app.company;
    document.getElementById("role").value = app.role;
    document.getElementById("stage").value = app.stage;
    document.getElementById("result").value = app.result;
    document.getElementById("date").value = app.date;
    document.getElementById("notes").value = app.notes === "—" ? "" : app.notes;

    // Delete the old entry
    applications = applications.filter(a => a.id !== id);
    saveData();
    renderTable();
    updateSummary();

    // Scroll to form
    document.querySelector(".form-section").scrollIntoView({ behavior: 'smooth' });
    showNotification("Edit the details and click 'Add Application' to save");
}

// Update Summary Cards
function updateSummary() {
    const total = applications.length;
    const interviews = applications.filter(a => a.stage === "Interview").length;
    const offers = applications.filter(a => a.stage === "Offer").length;
    const rejected = applications.filter(a => a.stage === "Rejected").length;

    document.getElementById("totalApps").textContent = total;
    document.getElementById("interviews").textContent = interviews;
    document.getElementById("offers").textContent = offers;
    document.getElementById("rejected").textContent = rejected;

    // Calculate success rate
    const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;
    document.getElementById("successRate").textContent = successRate + "%";
}

// Handle Filter Change
function handleFilterChange(e) {
    filterChips.forEach(chip => chip.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTable();
}

// Handle Search
function handleSearch() {
    renderTable();
}

// Export Data as JSON
function exportData() {
    if (applications.length === 0) {
        alert("No data to export!");
        return;
    }

    const dataStr = JSON.stringify(applications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placement-tracker-${formatDate(new Date().toISOString().split('T')[0])}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Data exported successfully! 📥");
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem("applications", JSON.stringify(applications));
}

// Helper Functions
function calculateDaysAgo(dateString) {
    const appDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - appDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
