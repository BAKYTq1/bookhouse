import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer, AdminPageLayout } from './components/layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { BookDetails } from './pages/BookDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login, Register, ForgotPassword, ResetPassword, ConfirmEmail } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Favorites } from './pages/Favorites';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BooksProvider } from './contexts/BooksContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BooksProvider>
            <FavoritesProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminPageLayout>
                          <Routes>
                            <Route path="/" element={<Admin />} />
                            <Route path=":section" element={<Admin />} />
                          </Routes>
                        </AdminPageLayout>
                      }
                    />

                    {/* Regular Routes */}
                    <Route
                      path="/*"
                      element={
                        <div className="app">
                          <Navbar />
                          <main className="main-content">
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/catalog" element={<Catalog />} />
                              <Route path="/book/:id" element={<BookDetails />} />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/favorites" element={<Favorites />} />
                              <Route path="/checkout" element={<Checkout />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password" element={<ResetPassword />} />
                              <Route path="/profile" element={<Profile />} />
                            </Routes>
                          </main>
                          <Footer />
                        </div>
                      }
                    />
                  </Routes>
                </Router>
              </CartProvider>
            </FavoritesProvider>
          </BooksProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
