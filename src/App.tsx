import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { Dashboard } from './pages/Dashboard';
import { Swap } from './pages/Swap';
import { LendBorrow } from './pages/LendBorrow';
import { Payments } from './pages/Payments';
import { RiskEngine } from './pages/RiskEngine';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="flex flex-col md:flex-row bg-[#141414] min-h-screen text-white font-sans selection:bg-white selection:text-black">
          <MobileHeader />
          <Sidebar />
          <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden selection:bg-white selection:text-black">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/lend-borrow" element={<LendBorrow />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/risk" element={<RiskEngine />} />
            </Routes>
          </main>
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
}
