// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Animate elements when they come into view
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// Add hover effect to research items
document.querySelectorAll('.research-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Load and display publications
async function loadPublications() {
    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) return;
    
    // Add loading state
    publicationsList.classList.add('loading');
    
    try {
        // Using a CORS proxy to fetch Google Scholar data
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const scholarUrl = encodeURIComponent('https://scholar.google.com/citations?user=Ds2Zhf8AAAAJ&hl=en');
        
        const response = await fetch(proxyUrl + scholarUrl);
        const html = await response.text();
        
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find all publication entries
        const pubEntries = doc.querySelectorAll('tr.gsc_a_tr');
        const publications = [];
        
        pubEntries.forEach(entry => {
            const titleElem = entry.querySelector('a.gsc_a_t');
            const authorsElem = entry.querySelector('div.gs_gray');
            const yearElem = entry.querySelector('span.gsc_a_h');
            const citationsElem = entry.querySelector('a.gsc_a_ac');
            
            if (titleElem && authorsElem) {
                const title = titleElem.textContent.trim();
                const authors = authorsElem.textContent.trim();
                const year = yearElem ? yearElem.textContent.trim() : 'N/A';
                const citations = citationsElem ? citationsElem.textContent.trim() : '0';
                const link = titleElem.href ? titleElem.href : '';
                
                publications.push({
                    title,
                    authors,
                    year,
                    citations,
                    link
                });
            }
        });
        
        // Sort publications by year (newest first)
        const sortedPubs = publications.sort((a, b) => b.year - a.year);
        
        // Clear loading state
        publicationsList.classList.remove('loading');
        publicationsList.innerHTML = '';
        
        // Display publications
        sortedPubs.forEach(pub => {
            const pubElement = document.createElement('div');
            pubElement.className = 'publication-item';
            pubElement.innerHTML = `
                <h3><a href="${pub.link}" target="_blank">${pub.title}</a></h3>
                <p class="authors">${pub.authors}</p>
                <p class="venue">Year: ${pub.year}</p>
                <p class="citations">Cited by: ${pub.citations}</p>
            `;
            publicationsList.appendChild(pubElement);
        });
        
        // Add last updated timestamp
        const timestampElement = document.createElement('p');
        timestampElement.className = 'last-updated';
        timestampElement.textContent = `Last updated: ${new Date().toLocaleDateString()}`;
        publicationsList.parentElement.appendChild(timestampElement);
        
    } catch (error) {
        console.error('Error loading publications:', error);
        publicationsList.classList.remove('loading');
        publicationsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load publications. Please try again later.</p>
            </div>
        `;
    }
}

// Load publications when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPublications();
    // ... rest of your existing DOMContentLoaded code ...
}); 