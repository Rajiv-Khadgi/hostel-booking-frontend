import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"

import Home from "../pages/Home"
import Login from "../pages/Login"
import StudentRegister from "./pages/StudentRegister";
import OwnerRegister from "./pages/OwnerRegister";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/owner" element={<OwnerRegister />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
