import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Home } from '../pages/public/Home';
import { Listings } from '../pages/public/Listings';
import { ListingDetail } from '../pages/public/ListingDetail';
import { About } from '../pages/public/About';
import { Team } from '../pages/public/Team';
import { Insights } from '../pages/public/Insights';
import { InsightDetail } from '../pages/public/InsightDetail';
import { Gallery } from '../pages/public/Gallery';
import { Contact } from '../pages/public/Contact';
import { Login } from '../pages/auth/Login';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { PropertiesPage } from '../pages/dashboard/PropertiesPage';
import { LeadsPage } from '../pages/dashboard/LeadsPage';
import { HelpdeskPage } from '../pages/dashboard/HelpdeskPage';
import { FinancialsPage } from '../pages/dashboard/FinancialsPage';
import { AnalyticsPage } from '../pages/dashboard/AnalyticsPage';
import { ThemeCustomizer } from '../pages/dashboard/ThemeCustomizer';
import { TeamPage } from '../pages/dashboard/TeamPage';
import { CmsBlogPage } from '../pages/dashboard/CmsBlogPage';
import { TestimonialsPage } from '../pages/dashboard/TestimonialsPage';
import { GalleryPage } from '../pages/dashboard/GalleryPage';
import { TourSchedulerPage } from '../pages/dashboard/TourSchedulerPage';
import { ClientsPage } from '../pages/dashboard/ClientsPage';
import { SettingsPage } from '../pages/dashboard/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'listings', element: <Listings /> },
      { path: 'listings/:id', element: <ListingDetail /> },
      { path: 'about', element: <About /> },
      { path: 'team', element: <Team /> },
      { path: 'insights', element: <Insights /> },
      { path: 'insights/:slug', element: <InsightDetail /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  { path: '/login', element: <Login /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'cms/blog', element: <CmsBlogPage /> },
      { path: 'cms/testimonials', element: <TestimonialsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'crm/leads', element: <LeadsPage /> },
      { path: 'crm/tours', element: <TourSchedulerPage /> },
      { path: 'crm/clients', element: <ClientsPage /> },
      { path: 'helpdesk', element: <HelpdeskPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'financials', element: <FinancialsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'theme', element: <ThemeCustomizer /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
