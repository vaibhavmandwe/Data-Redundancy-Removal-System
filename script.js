// Initialize Supabase client
const SUPABASE_URL = 'https://kqxjwkkyenwyyiquvyao.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeGp3a2t5ZW53eXlpcXV2eWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMTEzNTYsImV4cCI6MjA3ODg4NzM1Nn0.HFY26wA8snGdkJPMc8fyEyZSpvCgxDzQMNu8CT_l9qE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Toast notification function
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Check for duplicate contacts
async function checkDuplicate(email, phone) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (error) {
    console.error('Error checking duplicates:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

// Fetch and display contacts
async function fetchContacts() {
  const loadingMessage = document.getElementById('loadingMessage');
  const emptyMessage = document.getElementById('emptyMessage');
  const contactsTable = document.getElementById('contactsTable');
  const contactsBody = document.getElementById('contactsBody');
  const contactCount = document.getElementById('contactCount');

  loadingMessage.style.display = 'block';
  emptyMessage.style.display = 'none';
  contactsTable.style.display = 'none';

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  loadingMessage.style.display = 'none';

  if (error) {
    console.error('Error fetching contacts:', error);
    showToast('Error loading contacts', 'error');
    return;
  }

  if (!data || data.length === 0) {
    emptyMessage.style.display = 'block';
    contactCount.textContent = '0 entries';
    return;
  }

  contactCount.textContent = `${data.length} entries`;
  contactsBody.innerHTML = '';

  data.forEach(contact => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight: 500;">${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td style="color: hsl(var(--muted-foreground));">
        ${new Date(contact.created_at).toLocaleDateString()}
      </td>
    `;
    contactsBody.appendChild(row);
  });

  contactsTable.style.display = 'block';
}

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking...';

  // Check for duplicates
  const duplicate = await checkDuplicate(email, phone);

  if (duplicate) {
    showToast(
      `Duplicate detected! A contact with this ${
        duplicate.email === email ? 'email' : 'phone number'
      } already exists.`,
      'error'
    );
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Contact';
    return;
  }

  // Insert new contact
  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, phone }]);

  if (error) {
    console.error('Error inserting contact:', error);
    showToast('Failed to add contact', 'error');
  } else {
    showToast('Contact added successfully!', 'success');
    // Clear form
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    // Refresh contacts list
    fetchContacts();
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Add Contact';
});

// Load contacts on page load
fetchContacts();
