# Umanie Homes - Luxury African Real Estate Website

A modern, responsive luxury real estate website showcasing premium properties across Africa's most prestigious locations.

## 🚀 Quick Start

### Option 1: Using Python (Recommended)

Open terminal in the project folder and run:

```bash
# Python 3
python -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Using Node.js

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: Using VS Code

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 4: Direct File Opening

You can also simply open `index.html` directly in your browser, but note:
- Images from JSON data may not load due to CORS restrictions
- Some features work best with a local server

## ✨ Features

### Implemented ✅
- **Full Light/Dark Theme** - Toggle between themes with localStorage persistence
- **Responsive Design** - Mobile-first (375px → 768px → 1440px breakpoints)
- **Enhanced Home Page**:
  - Hero section with search bar
  - Services showcase (Buy, Sell, Invest, Manage)
  - Featured properties (dynamically loaded)
  - Animated statistics counter
  - Testimonials carousel
  - Newsletter signup
- **Professional Footer** - 4 columns with social links
- **Back-to-Top Button** - Smooth scroll, appears on scroll
- **WhatsApp Chat Bubble** - Direct messaging with pulse animation
- **Toast Notifications** - Success/error messages
- **Scroll Reveal Animations** - Smooth fade-in effects

### Core Components
- Navigation (with mobile hamburger menu)
- Carousel/Slider (with autoplay, swipe support)
- Lightbox Gallery (zoom, keyboard navigation)
- Modal (focus trap, accessibility)
- Accordion (FAQs, expandable content)
- Form Validation (real-time with toast notifications)

### Mock Data
- **20 luxury properties** across 10 African cities
- **10 team members** with profiles
- **18 market insights** articles
- **12 client testimonials**
- **18 FAQs**

## 📁 Project Structure

```
UmaineHomes/
├── index.html              # Main homepage
├── css/
│   ├── global.css         # Design system, variables
│   ├── utilities.css      # Animations, helpers
│   └── components/        # All component styles (13 files)
├── js/
│   ├── app.js            # Standalone combined script
│   ├── main.js           # Core functionality (modular)
│   ├── components/       # Carousel, lightbox, modal, accordion, toast
│   ├── features/         # Lazy loading, form validation, scroll controls
│   └── utils/            # Data loader
├── data/                  # JSON mock data (5 files)
│   ├── properties.json
│   ├── team.json
│   ├── insights.json
│   ├── testimonials.json
│   └── faqs.json
├── images/               # Image assets (organized by category)
└── pages/                # Additional pages (to be built)
```

## 🎨 Design System

### Colors
- **Primary Navy**: #004274, #0A1F44
- **Accent Gold**: #C9A974
- **Success Green**: #81d742
- **Full grayscale** for light/dark modes

### Typography
- **Font**: Inter (300-800 weights)
- **Responsive sizes** using clamp()

### Components
All components are modular, reusable, and accessible (WCAG AA compliant)

## 🌟 Key Features Explained

### Theme Toggle
- Persists across sessions (localStorage)
- Smooth transitions between light/dark modes
- Icon changes automatically

### WhatsApp Integration
- Click bubble to open WhatsApp chat
- Pre-filled message for quick contact
- Customizable phone number in `js/app.js`

### Back-to-Top Button
- Appears after scrolling 300px
- Smooth scroll to top
- Accessible (keyboard operable)

### Form Validation
- Real-time email validation
- Toast notifications on success/error
- Accessible error messages

## 🔧 Customization

### Change WhatsApp Number
Edit `js/app.js` line ~117:
```javascript
const phoneNumber = '233245550101'; // Change this
```

### Modify Colors
Edit `css/global.css` CSS variables:
```css
:root {
  --accent-gold: #C9A974;  /* Your color */
  --brand-deep: #0A1F44;   /* Your color */
}
```

### Add More Properties
Edit `data/properties.json` and add new property objects

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

## 🎯 Next Steps (Pending Pages)

1. Listings Page (with advanced filters)
2. Listing Detail Page (individual property)
3. About Page
4. Team Page
5. Insights/Blog Page
6. Gallery Page
7. Contact Page

## 💡 Tips

- **Best viewed with a local server** for full functionality
- **Mobile menu** works at <768px width
- **All interactions** are keyboard accessible
- **Images** load from Unsplash (requires internet connection)

## 📞 Support

For questions or issues, refer to the code comments or check the browser console for debugging information.

---

**Built with vanilla HTML, CSS, and JavaScript** - No frameworks, no build process! 🚀
