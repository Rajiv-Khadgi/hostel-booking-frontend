import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Explore from '../pages/Explore';
import About from '../pages/About';
import Contact from '../pages/Contact';
import HostelDetails from '../pages/HostelDetails';
import Login from '../pages/Login';
import StudentRegister from '../pages/StudentRegister';
import OwnerRegister from '../pages/OwnerRegister';
import Unauthorized from '../pages/Unauthorized';

// Dashboard Pages
import Overview from '../pages/dashboard/Overview';
import Profile from '../pages/dashboard/Profile';
import Bookings from '../pages/dashboard/Bookings';
import Chat from '../pages/dashboard/Chat';
import Hostels from '../pages/dashboard/Hostels';
import Payments from '../pages/dashboard/Payments';
import HostelForm from '../pages/dashboard/HostelForm';
import Rooms from '../pages/dashboard/Rooms';
import RoomForm from '../pages/dashboard/RoomForm';
import SavedHostels from '../pages/dashboard/SavedHostels';
import Visits from '../pages/dashboard/Visits';
import HostelReviews from '../pages/dashboard/HostelReviews';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import PaymentCallback from '../pages/payment/PaymentCallback';
import AdminUsers from '../pages/dashboard/AdminUsers';
import AdminHostels from '../pages/dashboard/AdminHostels';
import AdminReviews from '../pages/dashboard/AdminReviews';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Main Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hostels/:id" element={<HostelDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/owner" element={<OwnerRegister />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Add a generic unauthorized page later if needed */}
        </Route>

        {/* Protected Dashboard Routes with Sidebar */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="saved" element={<SavedHostels />} />
            <Route path="visits" element={<Visits />} />

            <Route element={<ProtectedRoute allowedRoles={['student', 'owner']} />}>
              <Route path="chat" element={<Chat />} />
            </Route>

            {/* Owner Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="hostels" element={<Hostels />} />
              <Route path="hostels/new" element={<HostelForm />} />
              <Route path="hostels/:id/edit" element={<HostelForm />} />
              <Route path="hostel-reviews" element={<HostelReviews />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="rooms/new" element={<RoomForm />} />
              <Route path="rooms/:id/edit" element={<RoomForm />} />
            </Route>
            
            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/hostels" element={<AdminHostels />} />
              <Route path="admin/reviews" element={<AdminReviews />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<div className="p-10 text-center text-2xl">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
