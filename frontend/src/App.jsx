import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  )
}

export default App
