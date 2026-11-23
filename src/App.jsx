import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import ContactModal from './components/ContactModal.jsx';
import BackToTop from './components/BackToTop.jsx';
import ActionBar from './components/ActionBar.jsx';
import Home from './pages/Home.jsx';
import Journal from './pages/Journal.jsx';
import Post from './pages/Post.jsx';
import Neighborhoods from './pages/Neighborhoods.jsx';
import Homes from './pages/Homes.jsx';
import Tools from './pages/Tools.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import Credits from './pages/Credits.jsx';

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash && pathname !== '/neighborhoods') {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <ScrollManager />
      <Nav />
      <main id="main" key={location.pathname} className="route">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<Post />} />
          <Route path="/neighborhoods" element={<Neighborhoods />} />
          <Route path="/homes" element={<Homes />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ContactModal />
      <BackToTop />
      <ActionBar />
    </>
  );
}
