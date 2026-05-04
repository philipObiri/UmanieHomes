/* ===================================
   LISTINGS PAGE FUNCTIONALITY
   =================================== */

let allProperties = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 9;
let currentView = 'grid';

// Filters state
const filters = {
    locations: [],
    types: [],
    bedrooms: [],
    amenities: [],
    minPrice: 0,
    maxPrice: 5000000
};

// Load properties
async function loadProperties() {
    try {
        const response = await fetch('../data/properties.json');
        allProperties = await response.json();
        filteredProperties = allProperties.filter(p => p.status === 'available');
        applyFilters();
    } catch (error) {
        console.error('Error loading properties:', error);
        document.getElementById('propertiesContainer').innerHTML =
            '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Unable to load properties. Please try again later.</p>';
    }
}

// Apply filters
function applyFilters() {
    filteredProperties = allProperties.filter(property => {
        if (property.status !== 'available') return false;

        // Location filter
        if (filters.locations.length > 0) {
            if (!filters.locations.includes(property.location.city)) return false;
        }

        // Type filter
        if (filters.types.length > 0) {
            if (!filters.types.includes(property.type)) return false;
        }

        // Price filter
        if (property.price < filters.minPrice || property.price > filters.maxPrice) {
            return false;
        }

        // Bedrooms filter
        if (filters.bedrooms.length > 0) {
            const maxBedFilter = Math.max(...filters.bedrooms);
            if (property.bedrooms < maxBedFilter) return false;
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
            const hasAllAmenities = filters.amenities.every(amenity =>
                property.features.some(feature => feature.includes(amenity))
            );
            if (!hasAllAmenities) return false;
        }

        return true;
    });

    currentPage = 1;
    updateActiveFilters();
    displayProperties();
}

// Sort properties
function sortProperties(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'bedrooms':
            filteredProperties.sort((a, b) => b.bedrooms - a.bedrooms);
            break;
        case 'newest':
            filteredProperties.sort((a, b) => b.yearBuilt - a.yearBuilt);
            break;
        case 'featured':
        default:
            filteredProperties.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            });
    }
    displayProperties();
}

// Display properties
function displayProperties() {
    const container = document.getElementById('propertiesContainer');
    const start = (currentPage - 1) * propertiesPerPage;
    const end = start + propertiesPerPage;
    const propertiesToShow = filteredProperties.slice(start, end);

    // Update results count
    document.getElementById('resultsCount').textContent = filteredProperties.length;

    if (propertiesToShow.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
                <h3>No properties found</h3>
                <p style="color: var(--text-secondary);">Try adjusting your filters to see more results</p>
                <button class="btn btn-primary mt-lg" onclick="clearAllFilters()">Clear All Filters</button>
            </div>
        `;
        return;
    }

    if (currentView === 'grid') {
        container.className = 'properties-grid';
        container.innerHTML = propertiesToShow.map(property => `
            <a href="listing-detail.html?id=${property.id}" class="card property-card" style="text-decoration: none; color: inherit;">
                <div class="card-img" style="background-image: url('${property.images[0]}');">
                    ${property.featured ? '<span class="badge badge-featured">FEATURED</span>' : ''}
                </div>
                <div class="card-content">
                    <div class="card-price">$${property.price.toLocaleString()}</div>
                    <h3 class="card-title">${property.title}</h3>
                    <p class="card-subtitle">${property.location.area}, ${property.location.city}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                        <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
            </a>
        `).join('');
    } else {
        container.className = 'properties-list';
        container.innerHTML = propertiesToShow.map(property => `
            <a href="listing-detail.html?id=${property.id}" class="property-card-list" style="text-decoration: none; color: inherit;">
                <div class="card-img" style="background-image: url('${property.images[0]}');">
                    ${property.featured ? '<span class="badge badge-featured">FEATURED</span>' : ''}
                </div>
                <div class="card-content">
                    <div class="card-price">$${property.price.toLocaleString()}</div>
                    <h3 class="card-title">${property.title}</h3>
                    <p class="card-subtitle"><i class="fas fa-map-marker-alt"></i> ${property.location.area}, ${property.location.city}</p>
                    <p style="color: var(--text-secondary); margin: 15px 0;">${property.description.substring(0, 150)}...</p>
                    <div class="card-meta">
                        <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
                        <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.sqft.toLocaleString()} sqft</span>
                    </div>
                    <span class="btn btn-primary mt-md" style="display: inline-block;">View Details</span>
                </div>
            </a>
        `).join('');
    }

    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span>...</span>';
        }
    }

    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update active filters display
function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    const activeTags = [];

    filters.locations.forEach(loc => {
        activeTags.push({ type: 'location', value: loc, label: loc });
    });

    filters.types.forEach(type => {
        activeTags.push({ type: 'type', value: type, label: type });
    });

    filters.bedrooms.forEach(bed => {
        activeTags.push({ type: 'bedrooms', value: bed, label: `${bed}+ Beds` });
    });

    filters.amenities.forEach(amenity => {
        activeTags.push({ type: 'amenity', value: amenity, label: amenity });
    });

    if (filters.minPrice > 0 || filters.maxPrice < 5000000) {
        activeTags.push({
            type: 'price',
            label: `$${(filters.minPrice / 1000).toFixed(0)}k - $${(filters.maxPrice / 1000).toFixed(0)}k`
        });
    }

    if (activeTags.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = activeTags.map(tag => `
        <div class="filter-tag">
            ${tag.label}
            <button onclick="removeFilter('${tag.type}', '${tag.value}')" aria-label="Remove filter">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove filter
function removeFilter(type, value) {
    switch (type) {
        case 'location':
            filters.locations = filters.locations.filter(l => l !== value);
            document.getElementById(value.toLowerCase().replace(' ', '-')).checked = false;
            break;
        case 'type':
            filters.types = filters.types.filter(t => t !== value);
            document.getElementById(value.toLowerCase()).checked = false;
            break;
        case 'bedrooms':
            filters.bedrooms = filters.bedrooms.filter(b => b !== parseInt(value));
            document.getElementById(`bed${value}`).checked = false;
            break;
        case 'amenity':
            filters.amenities = filters.amenities.filter(a => a !== value);
            const amenityId = value.toLowerCase().replace(' ', '');
            document.getElementById(amenityId).checked = false;
            break;
        case 'price':
            filters.minPrice = 0;
            filters.maxPrice = 5000000;
            updatePriceSliders();
            break;
    }
    applyFilters();
}

// Clear all filters
function clearAllFilters() {
    filters.locations = [];
    filters.types = [];
    filters.bedrooms = [];
    filters.amenities = [];
    filters.minPrice = 0;
    filters.maxPrice = 5000000;

    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    updatePriceSliders();
    applyFilters();
}

// Price slider functionality
function initPriceSliders() {
    const minSlider = document.getElementById('minPriceSlider');
    const maxSlider = document.getElementById('maxPriceSlider');
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');
    const range = document.getElementById('priceRange');

    function updateSliders() {
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);

        if (minVal >= maxVal) {
            if (this === minSlider) {
                maxSlider.value = minVal + 100000;
            } else {
                minSlider.value = maxVal - 100000;
            }
        }

        const minPercent = (minSlider.value / minSlider.max) * 100;
        const maxPercent = (maxSlider.value / maxSlider.max) * 100;

        range.style.left = minPercent + '%';
        range.style.width = (maxPercent - minPercent) + '%';

        filters.minPrice = parseInt(minSlider.value);
        filters.maxPrice = parseInt(maxSlider.value);

        // Format display values
        const formatPrice = (price) => {
            if (price >= 1000000) {
                return '$' + (price / 1000000).toFixed(1) + 'M';
            } else if (price >= 1000) {
                return '$' + (price / 1000).toFixed(0) + 'k';
            } else {
                return '$' + price;
            }
        };

        minInput.value = formatPrice(filters.minPrice);
        maxInput.value = formatPrice(filters.maxPrice);
    }

    function applyPriceFilter() {
        applyFilters();
    }

    minSlider.addEventListener('input', updateSliders);
    maxSlider.addEventListener('input', updateSliders);
    minSlider.addEventListener('change', applyPriceFilter);
    maxSlider.addEventListener('change', applyPriceFilter);

    updateSliders();
}

function updatePriceSliders() {
    document.getElementById('minPriceSlider').value = filters.minPrice;
    document.getElementById('maxPriceSlider').value = filters.maxPrice;
    document.getElementById('minPriceSlider').dispatchEvent(new Event('input'));
}

// Initialize filters
function initFilters() {
    // Location checkboxes
    document.querySelectorAll('input[type="checkbox"][value]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const value = this.value;
            const isLocation = ['Accra', 'Lagos', 'Nairobi', 'Cape Town', 'Kigali'].includes(value);
            const isType = ['Villa', 'Penthouse', 'Mansion', 'Townhouse', 'Apartment'].includes(value);
            const isBedroom = ['2', '3', '4', '5'].includes(value);

            if (isLocation) {
                if (this.checked) {
                    filters.locations.push(value);
                } else {
                    filters.locations = filters.locations.filter(l => l !== value);
                }
            } else if (isType) {
                if (this.checked) {
                    filters.types.push(value);
                } else {
                    filters.types = filters.types.filter(t => t !== value);
                }
            } else if (isBedroom) {
                if (this.checked) {
                    filters.bedrooms.push(parseInt(value));
                } else {
                    filters.bedrooms = filters.bedrooms.filter(b => b !== parseInt(value));
                }
            } else {
                // Amenities
                if (this.checked) {
                    filters.amenities.push(value);
                } else {
                    filters.amenities = filters.amenities.filter(a => a !== value);
                }
            }

            applyFilters();
        });
    });

    // Sort select
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortProperties(this.value);
    });

    // View toggle
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            displayProperties();
        });
    });

    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // Apply filters button
    document.querySelector('.filters-sidebar .btn-block').addEventListener('click', applyFilters);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    initFilters();
    initPriceSliders();
});
