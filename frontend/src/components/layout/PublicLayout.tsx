import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackToTop } from '../ui/BackToTop';
import { WhatsAppBubble } from '../ui/WhatsAppBubble';
import { ScrollProgressBar } from '../ui/ScrollProgressBar';

export function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgressBar />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppBubble />
      <ScrollRestoration />
    </div>
  );
}
