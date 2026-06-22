import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './lib/auth'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { PublicLayout } from './components/PublicLayout'
import { AdminLayout } from './components/AdminLayout'
import { Landing } from './pages/public/Landing'
import { Login } from './pages/public/Login'
import { Register } from './pages/public/Register'
import { BookSlot } from './pages/public/BookSlot'
import { GuestInfo } from './pages/public/GuestInfo'
import { BookingConfirmation } from './pages/public/BookingConfirmation'
import { MyBookings } from './pages/public/MyBookings'
import { EditProfile } from './pages/public/EditProfile'
import { Dashboard } from './pages/admin/Dashboard'
import { Schedule } from './pages/admin/Schedule'
import { EventTypes } from './pages/admin/EventTypes'
import { AdminSettings } from './pages/admin/AdminSettings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/book/:eventTypeId', element: <BookSlot /> },
      { path: '/book/:eventTypeId/info', element: <GuestInfo /> },
      { path: '/booking/:bookingId', element: <BookingConfirmation /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/bookings', element: <MyBookings /> },
          { path: '/profile/:profileId', element: <EditProfile /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'schedule', element: <Schedule /> },
          { path: 'event-types', element: <EventTypes /> },
          { path: 'settings', element: <AdminSettings /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  )
}
