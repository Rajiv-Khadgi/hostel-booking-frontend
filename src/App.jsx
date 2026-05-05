import { Toaster } from 'react-hot-toast';
import AppRoutes from "./routes/AppRoutes"

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <AppRoutes />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}
