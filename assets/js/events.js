// Event filtering
const eventTypeSelect = document.getElementById('eventType');
const locationSelect = document.getElementById('location');
const eventCards = document.querySelectorAll('.event-card');

function filterEvents() {
    const selectedType = eventTypeSelect.value;
    const selectedLocation = locationSelect.value;

    eventCards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        const cardLocation = card.getAttribute('data-location');
        
        const typeMatch = selectedType === 'all' || cardType === selectedType;
        const locationMatch = selectedLocation === 'all' || cardLocation === selectedLocation;

        if (typeMatch && locationMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

eventTypeSelect.addEventListener('change', filterEvents);
locationSelect.addEventListener('change', filterEvents);

// View toggle
const viewButtons = document.querySelectorAll('.view-button');
const eventsGrid = document.querySelector('.events-grid');

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        viewButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');

        // Toggle view
        const view = button.getAttribute('data-view');
        if (view === 'calendar') {
            // TODO: Implement calendar view
            console.log('Calendar view not implemented yet');
        } else {
            eventsGrid.style.display = 'grid';
        }
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    eventCards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        const description = card.querySelector('.event-description').textContent.toLowerCase();
        const location = card.querySelector('.event-location').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

        const matches = title.includes(searchTerm) ||
                       description.includes(searchTerm) ||
                       location.includes(searchTerm) ||
                       tags.some(tag => tag.includes(searchTerm));

        card.style.display = matches ? 'block' : 'none';
    });
});

// Subscribe form
const subscribeForm = document.querySelector('.subscribe-form');

subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = subscribeForm.querySelector('input[type="email"]').value;
    
    // TODO: Implement email subscription
    console.log('Subscribing email:', email);
    
    // Show success message
    const successMessage = document.createElement('p');
    successMessage.textContent = 'Thanks for subscribing!';
    successMessage.style.color = '#66FCF1';
    subscribeForm.appendChild(successMessage);
    
    // Clear form
    subscribeForm.reset();
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}); 