export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
        <p>© {new Date().getFullYear()} HomeSpace. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-indigo-600">Facebook</a>
          <a href="#" className="hover:text-indigo-600">Twitter</a>
          <a href="#" className="hover:text-indigo-600">Instagram</a>
        </div>
      </div>
    </footer>
  )
}
