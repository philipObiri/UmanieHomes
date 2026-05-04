// ===================================
//  INSIGHTS PAGE FUNCTIONALITY
// ===================================

// Articles Data
const articlesData = [
    {
        id: 1,
        title: 'Accra Real Estate Market Report 2025: Record Growth in Luxury Segment',
        category: 'Market Analysis',
        author: { name: 'Sarah Osei', avatar: 'S' },
        date: '2025-02-10',
        readTime: 8,
        featured: true,
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        excerpt: 'The Accra luxury property market has seen unprecedented growth in Q1 2025, with prices in premium locations like East Legon and Cantonments rising by 18% year-over-year. We analyze the key drivers behind this surge and what it means for investors.'
    },
    {
        id: 2,
        title: 'Why Smart Investors Are Choosing African Real Estate in 2025',
        category: 'Investment',
        author: { name: 'Kwame Mensah', avatar: 'K' },
        date: '2025-02-08',
        readTime: 6,
        featured: false,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        excerpt: 'With global markets showing volatility, savvy investors are diversifying into African luxury real estate. Discover the compelling reasons why the continent is becoming a hotspot for high-net-worth individuals.'
    },
    {
        id: 3,
        title: 'The Rise of Sustainable Luxury: Green Features That Add Value',
        category: 'Lifestyle',
        author: { name: 'Amara Nwosu', avatar: 'A' },
        date: '2025-02-05',
        readTime: 5,
        featured: false,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Solar panels, rainwater harvesting, and smart home systems are no longer optional in luxury properties. We explore how eco-friendly features are reshaping the high-end market and boosting property values by up to 25%.'
    },
    {
        id: 4,
        title: 'Lagos vs Nairobi: Comparing Africa\'s Hottest Luxury Markets',
        category: 'Market Analysis',
        author: { name: 'Chidi Okafor', avatar: 'C' },
        date: '2025-02-03',
        readTime: 7,
        featured: false,
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Both cities are experiencing massive growth in the luxury segment, but which offers better returns for investors? Our comprehensive comparison looks at pricing trends, rental yields, and future outlook.'
    },
    {
        id: 5,
        title: 'Tax Benefits Every Property Investor in Ghana Should Know',
        category: 'Investment',
        author: { name: 'Sarah Osei', avatar: 'S' },
        date: '2025-01-30',
        readTime: 6,
        featured: false,
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Understanding Ghana\'s property tax landscape can save investors thousands. From capital gains exemptions to rental income incentives, we break down the key benefits available to real estate investors.'
    },
    {
        id: 6,
        title: 'How to Stage Your Luxury Property for Maximum Appeal',
        category: 'Lifestyle',
        author: { name: 'Amara Nwosu', avatar: 'A' },
        date: '2025-01-28',
        readTime: 5,
        featured: false,
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
        excerpt: 'Professional staging can reduce time on market by up to 40% and increase selling price by 5-10%. Learn the expert techniques that make luxury properties irresistible to discerning buyers.'
    }
];

let currentFilter = 'all';

// Load Featured Article
function loadFeaturedArticle() {
    const featured = articlesData.find(article => article.featured);
    if (!featured) return;

    const container = document.getElementById('featuredArticle');
    if (!container) return;

    container.innerHTML = `
        <div class="featured-article">
            <div class="featured-image" style="background-image: url('${featured.image}');"></div>
            <div class="featured-content">
                <span class="featured-badge">Featured Article</span>
                <h2>${featured.title}</h2>
                <div class="article-meta">
                    <span><i class="fas fa-user"></i> ${featured.author.name}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(featured.date)}</span>
                    <span><i class="fas fa-clock"></i> ${featured.readTime} min read</span>
                    <span><i class="fas fa-tag"></i> ${featured.category}</span>
                </div>
                <p class="excerpt">${featured.excerpt}</p>
                <a href="#" class="btn btn-primary">Read Full Article</a>
            </div>
        </div>
    `;
}

// Load Articles
function loadArticles(filter = 'all') {
    const filtered = filter === 'all'
        ? articlesData.filter(a => !a.featured)
        : articlesData.filter(a => !a.featured && a.category === filter);

    const container = document.getElementById('articlesGrid');
    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">No articles found in this category.</p>';
        return;
    }

    container.innerHTML = filtered.map(article => `
        <div class="article-card">
            <div class="article-image" style="background-image: url('${article.image}');">
                <span class="article-category">${article.category}</span>
            </div>
            <div class="article-content">
                <h3><a href="#">${article.title}</a></h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-footer">
                    <div class="article-author">
                        <div class="author-avatar">${article.author.avatar}</div>
                        <span>${article.author.name}</span>
                    </div>
                    <div class="read-time">
                        <i class="fas fa-clock"></i>
                        ${article.readTime} min
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Setup Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter articles
        currentFilter = btn.getAttribute('data-category');
        loadArticles(currentFilter);

        // Scroll to articles
        const articlesGrid = document.getElementById('articlesGrid');
        if (articlesGrid) {
            articlesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Initialize
loadFeaturedArticle();
loadArticles();
