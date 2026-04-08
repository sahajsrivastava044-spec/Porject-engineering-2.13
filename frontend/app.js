// Change this URL carefully when deploying your frontend!
// Example: const BACKEND_URL = 'https://my-backend-app.onrender.com';
const BACKEND_URL = 'http://localhost:3000';

const setForm = document.getElementById('setForm');
const setIdInput = document.getElementById('setId');
const exerciseInput = document.getElementById('exercise');
const weightInput = document.getElementById('weight');
const repsInput = document.getElementById('reps');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const emptyStateEl = document.getElementById('emptyState');
const setsTable = document.getElementById('setsTable');
const setsBody = document.getElementById('setsBody');

// State
let isEditing = false;
let setsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  dateInput.valueAsDate = new Date();
  fetchSets();
});

// Fetch all records - READ
async function fetchSets() {
  showLoading();
  try {
    const response = await fetch(`${BACKEND_URL}/sets`);
    if (!response.ok) throw new Error('Failed to fetch data');
    setsData = await response.json();
    renderTable();
  } catch (error) {
    console.error(error);
    showError();
  }
}

// Form submission handler - CREATE / UPDATE
setForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const setRecord = {
    exercise: exerciseInput.value.trim(),
    weight: parseFloat(weightInput.value),
    reps: parseInt(repsInput.value, 10),
    date: dateInput.value
  };

  const id = setIdInput.value;

  try {
    if (isEditing && id) {
      // UPDATE
      submitBtn.textContent = 'Updating...';
      const response = await fetch(`${BACKEND_URL}/sets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setRecord)
      });
      if (!response.ok) throw new Error('Failed to update');
    } else {
      // CREATE
      submitBtn.textContent = 'Saving...';
      const response = await fetch(`${BACKEND_URL}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setRecord)
      });
      if (!response.ok) throw new Error('Failed to create');
    }
    
    resetForm();
    await fetchSets();
  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    submitBtn.textContent = isEditing ? 'Update Set' : 'Log Set';
  }
});

// DELETE a record
async function deleteSet(id) {
  if (!confirm('Are you sure you want to delete this set?')) return;
  
  try {
    const response = await fetch(`${BACKEND_URL}/sets/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete');
    await fetchSets();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Prepare edit form
window.editSet = function(id) {
  const setRecord = setsData.find(s => s.id === parseInt(id, 10));
  if (!setRecord) return;

  isEditing = true;
  setIdInput.value = setRecord.id;
  exerciseInput.value = setRecord.exercise;
  weightInput.value = setRecord.weight;
  repsInput.value = setRecord.reps;
  dateInput.value = setRecord.date;

  formTitle.textContent = 'Edit Set';
  submitBtn.textContent = 'Update Set';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete wrapper for global scope
window.deleteSet = deleteSet;

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  isEditing = false;
  setIdInput.value = '';
  setForm.reset();
  dateInput.valueAsDate = new Date();
  
  formTitle.textContent = 'Log a New Set';
  submitBtn.textContent = 'Log Set';
  cancelEditBtn.classList.add('hidden');
}

// UI Helpers
function showLoading() {
  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  setsTable.classList.add('hidden');
  emptyStateEl.classList.add('hidden');
}

function showError() {
  loadingEl.classList.add('hidden');
  errorEl.classList.remove('hidden');
  setsTable.classList.add('hidden');
  emptyStateEl.classList.add('hidden');
}

function renderTable() {
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  if (setsData.length === 0) {
    emptyStateEl.classList.remove('hidden');
    setsTable.classList.add('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  setsTable.classList.remove('hidden');
  setsBody.innerHTML = '';

  setsData.forEach(setRecord => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${setRecord.date}</td>
      <td><strong>${setRecord.exercise}</strong></td>
      <td>${setRecord.weight}</td>
      <td>${setRecord.reps}</td>
      <td class="action-btns">
        <button class="edit-btn" onclick="editSet('${setRecord.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteSet('${setRecord.id}')">Delete</button>
      </td>
    `;
    setsBody.appendChild(tr);
  });
}
