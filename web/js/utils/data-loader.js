/* ===================================
   DATA LOADER UTILITY
   Fetch and cache JSON data
   =================================== */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.baseUrl = '/data/';
    }

    async load(filename) {
        // Check cache first
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        try {
            const response = await fetch(`${this.baseUrl}${filename}`);

            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the data
            this.cache.set(filename, data);

            return data;
        } catch (error) {
            console.error('Data loading error:', error);
            throw error;
        }
    }

    async loadProperties() {
        return this.load('properties.json');
    }

    async loadTeam() {
        return this.load('team.json');
    }

    async loadInsights() {
        return this.load('insights.json');
    }

    async loadTestimonials() {
        return this.load('testimonials.json');
    }

    async loadFAQs() {
        return this.load('faqs.json');
    }

    // Get property by ID
    async getPropertyById(id) {
        const properties = await this.loadProperties();
        return properties.find(prop => prop.id === id);
    }

    // Filter properties
    async filterProperties(filters = {}) {
        const properties = await this.loadProperties();

        return properties.filter(property => {
            // Status filter
            if (filters.status && property.status !== filters.status) {
                return false;
            }

            // Featured filter
            if (filters.featured !== undefined && property.featured !== filters.featured) {
                return false;
            }

            // City filter
            if (filters.city && property.location.city !== filters.city) {
                return false;
            }

            // Type filter
            if (filters.type && property.type !== filters.type) {
                return false;
            }

            // Price range
            if (filters.minPrice && property.price < filters.minPrice) {
                return false;
            }

            if (filters.maxPrice && property.price > filters.maxPrice) {
                return false;
            }

            // Bedrooms
            if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
                return false;
            }

            // Features
            if (filters.features && filters.features.length > 0) {
                const hasAllFeatures = filters.features.every(feature =>
                    property.features.includes(feature)
                );

                if (!hasAllFeatures) {
                    return false;
                }
            }

            return true;
        });
    }

    // Get featured properties
    async getFeaturedProperties(limit = 6) {
        const properties = await this.loadProperties();
        return properties
            .filter(prop => prop.featured && prop.status === 'available')
            .slice(0, limit);
    }

    // Get similar properties
    async getSimilarProperties(propertyId, limit = 3) {
        const properties = await this.loadProperties();
        const currentProperty = await this.getPropertyById(propertyId);

        if (!currentProperty) return [];

        return properties
            .filter(prop =>
                prop.id !== propertyId &&
                prop.status === 'available' &&
                (prop.location.city === currentProperty.location.city ||
                 prop.type === currentProperty.type)
            )
            .slice(0, limit);
    }

    // Get team member by ID
    async getTeamMemberById(id) {
        const team = await this.loadTeam();
        return team.find(member => member.id === id);
    }

    // Get featured articles
    async getFeaturedInsights(limit = 3) {
        const insights = await this.loadInsights();
        return insights
            .filter(article => article.featured)
            .slice(0, limit);
    }

    // Filter insights by category
    async filterInsights(category) {
        const insights = await this.loadInsights();

        if (!category || category === 'all') {
            return insights;
        }

        return insights.filter(article => article.category === category);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Clear specific cache entry
    clearCacheEntry(filename) {
        this.cache.delete(filename);
    }
}

// Create singleton instance
const dataLoader = new DataLoader();

export default dataLoader;
