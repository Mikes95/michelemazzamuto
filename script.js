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
    console.log('Starting to load publications...');
    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) {
        console.error('Publications list element not found!');
        return;
    }
    
    // Add loading state
    publicationsList.classList.add('loading');
    console.log('Loading state added');
    
    try {
        // Using a different CORS proxy with proper headers
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const scholarUrl = encodeURIComponent('https://scholar.google.com/citations?user=Ds2Zhf8AAAAJ&hl=en');
        const fullUrl = proxyUrl + scholarUrl;
        
        console.log('Fetching from URL:', fullUrl);
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('HTML content length:', html.length);
        
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        console.log('HTML parsed successfully');
        
        // Find all publication entries
        const pubEntries = doc.querySelectorAll('tr.gsc_a_tr');
        console.log('Found publication entries:', pubEntries.length);
        
        if (pubEntries.length === 0) {
            // Try alternative selectors
            const altEntries = doc.querySelectorAll('.gsc_a_tr');
            console.log('Alternative selector found entries:', altEntries.length);
            
            if (altEntries.length === 0) {
                throw new Error('No publications found in the response');
            }
        }
        
        const publications = [];
        
        pubEntries.forEach((entry, index) => {
            const titleElem = entry.querySelector('a.gsc_a_t');
            const authorsElem = entry.querySelector('div.gs_gray');
            const yearElem = entry.querySelector('span.gsc_a_h');
            const citationsElem = entry.querySelector('a.gsc_a_ac');
            
            console.log(`Processing publication ${index + 1}:`, {
                hasTitle: !!titleElem,
                hasAuthors: !!authorsElem,
                hasYear: !!yearElem,
                hasCitations: !!citationsElem
            });
            
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
        
        console.log('Processed publications:', publications);
        
        // Sort publications by year (newest first)
        const sortedPubs = publications.sort((a, b) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            return yearB - yearA;
        });
        
        console.log('Sorted publications:', sortedPubs);
        
        // Clear loading state
        publicationsList.classList.remove('loading');
        publicationsList.innerHTML = '';
        
        if (sortedPubs.length === 0) {
            throw new Error('No publications found');
        }
        
        // Display publications
        sortedPubs.forEach((pub, index) => {
            console.log(`Rendering publication ${index + 1}:`, pub.title);
            const pubElement = document.createElement('div');
            pubElement.className = 'publication-item';
            pubElement.innerHTML = `
                <h3><a href="${pub.link}" target="_blank" rel="noopener noreferrer">${pub.title}</a></h3>
                <p class="authors">${pub.authors}</p>
                <p class="venue">Year: ${pub.year}</p>
                <p class="citations">Cited by: ${pub.citations}</p>
            `;
            publicationsList.appendChild(pubElement);
        });
        
        console.log('All publications rendered');
        
        // Add last updated timestamp
        const timestampElement = document.createElement('p');
        timestampElement.className = 'last-updated';
        timestampElement.textContent = `Last updated: ${new Date().toLocaleDateString()}`;
        publicationsList.parentElement.appendChild(timestampElement);
        
    } catch (error) {
        console.error('Error loading publications:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        publicationsList.classList.remove('loading');
        publicationsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load publications. Please try again later.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}

// Load publications when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting to load publications');
    loadPublications();
    // ... rest of your existing DOMContentLoaded code ...
}); 