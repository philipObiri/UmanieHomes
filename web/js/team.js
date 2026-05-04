// ===================================
//  TEAM PAGE FUNCTIONALITY
// ===================================

// Load Team Members
let allTeamMembers = [];
let currentFilter = 'all';

async function loadTeamMembers() {
    try {
        const response = await fetch('../data/team.json');
        allTeamMembers = await response.json();
        renderTeamMembers(allTeamMembers);
    } catch (error) {
        console.error('Error loading team members:', error);
        const teamGrid = document.getElementById('teamGrid');
        if (teamGrid) {
            teamGrid.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
                    Unable to load team members. Please refresh the page.
                </p>
            `;
        }
    }
}

function renderTeamMembers(members) {
    const grid = document.getElementById('teamGrid');
    if (!grid) return;

    if (members.length === 0) {
        grid.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">
                No team members found for this filter.
            </p>
        `;
        return;
    }

    grid.innerHTML = members.map(member => `
        <div class="team-member-card" data-location="${member.location}">
            <div class="member-photo" style="background-image: url('${member.photo}');">
                <div class="member-social">
                    ${member.social && member.social.linkedin ? `<a href="${member.social.linkedin}" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
                    ${member.social && member.social.twitter ? `<a href="${member.social.twitter}" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
                    ${member.email ? `<a href="mailto:${member.email}" aria-label="Email"><i class="fas fa-envelope"></i></a>` : ''}
                </div>
            </div>
            <div class="member-info">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-title">${member.title}${member.credentials ? `<br><small>${member.credentials}</small>` : ''}</p>
                <p class="member-bio">${member.bio}</p>
                <span class="member-location">
                    <i class="fas fa-map-marker-alt"></i> ${member.location}
                </span>
                ${member.specialties && member.specialties.length > 0 ? `
                    <div class="member-specialties">
                        ${member.specialties.slice(0, 3).map(s => `<span class="specialty-tag">${s}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Filter Functionality
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Get filter value
        const location = button.getAttribute('data-location');
        currentFilter = location;

        // Filter team members
        if (location === 'all') {
            renderTeamMembers(allTeamMembers);
        } else {
            const filtered = allTeamMembers.filter(member =>
                member.location.toLowerCase().includes(location.toLowerCase())
            );
            renderTeamMembers(filtered);
        }
    });
});

// Initialize
loadTeamMembers();
