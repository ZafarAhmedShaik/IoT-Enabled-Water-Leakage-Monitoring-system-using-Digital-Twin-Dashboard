import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PipelineProvider } from './context/PipelineContext';
import { SearchProvider } from './context/SearchContext';
import { SettingsProvider } from './context/SettingsContext';
import AnalyticsPage from './pages/AnalyticsPage';
import Dashboard from './pages/Dashboard';
import EventDetailPage from './pages/EventDetailPage';
import HistoryPage from './pages/HistoryPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <PipelineProvider>
        <SettingsProvider>
          <SearchProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="event/:alertId" element={<EventDetailPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SearchProvider>
        </SettingsProvider>
      </PipelineProvider>
    </BrowserRouter>
  );
}
