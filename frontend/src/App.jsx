import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VehicleList from './pages/VehicleList'
import VehicleDetail from './pages/VehicleDetail'
import CustomerDashboard from './pages/CustomerDashboard'
import CustomerApplicationDetails from './pages/CustomerApplicationDetails'
import AdminDashboard from './pages/AdminDashboard'
import AdminVehicles from './pages/AdminVehicles'
import AdminApplications from './pages/AdminApplications'
import MyApplications from './pages/MyApplications'
import ApplicationDetail from './pages/ApplicationDetail'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerRoute from './components/CustomerRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/vehicles" element={<Layout><VehicleList /></Layout>} />
      <Route path="/vehicles/:id" element={<Layout><VehicleDetail /></Layout>} />
      
      {/* Customer Dashboard Routes (no Layout wrapper - has own sidebar) */}
      <Route path="/dashboard" element={
        <CustomerRoute>
          <CustomerDashboard />
        </CustomerRoute>
      } />
      <Route path="/dashboard/applications/:id" element={
        <CustomerRoute>
          <CustomerApplicationDetails />
        </CustomerRoute>
      } />
      
      {/* Legacy customer routes with Layout */}
      <Route path="/my-applications" element={
        <Layout>
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        </Layout>
      } />
      <Route path="/applications/:id" element={
        <Layout>
          <ProtectedRoute>
            <ApplicationDetail />
          </ProtectedRoute>
        </Layout>
      } />
      
      {/* Admin Routes (no Layout wrapper - has own sidebar) */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/vehicles" element={
        <AdminRoute>
          <AdminVehicles />
        </AdminRoute>
      } />
      <Route path="/admin/applications" element={
        <AdminRoute>
          <AdminApplications />
        </AdminRoute>
      } />
    </Routes>
  )
}

export default App
