import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Recycle, Brain, Gift } from 'lucide-react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import Game from './pages/Game';
import Minesweeper from './pages/Minesweeper';
import Tetris from './pages/Tetris';
import Redeem from './pages/Redeem';
import Analysis from './pages/Analysis';

const Section = ({ children, className = '', id = '', backgroundImage = '' }) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  const style = backgroundImage ? {
    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <section
      id={id}
      ref={ref}
      className={`parallax-section ${className}`}
      style={style}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="parallax-content"
      >
        {children}
      </motion.div>
    </section>
  );
};

const ScrollingImages = () => {
  const images = [
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80", // Recycling center
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80", // Sorted recyclables
    "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80", // Plastic recycling
    "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=800&q=80", // Cardboard recycling
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80", // People discussing sustainability
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"  // Metal recycling
  ];

  const [currentSet, setCurrentSet] = useState(0);
  const totalSets = Math.ceil(images.length / 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % totalSets);
    }, 3000);

    return () => clearInterval(timer);
  }, [totalSets]);

  return (
    <div className="w-full mt-12 overflow-hidden">
      <motion.div
        className="flex gap-4"
        animate={{
          x: [`0%`, `-${(currentSet * 100)}%`]
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut"
        }}
      >
        {images.map((image, index) => (
          <motion.div
            key={image}
            className="flex-shrink-0 w-1/3 aspect-video rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <img
              src={image}
              alt={`Impact ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index < 3 ? "eager" : "lazy"}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

function Home() {
  return (
    <div className="parallax-wrapper">
      {/* Intro Section */}
      <Section 
        className="bg-black"
        backgroundImage="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-7xl font-bold mb-6"
          >
            Smarbin
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-2xl text-emerald-400"
          >
            The future of waste management is intelligent
          </motion.p>
        </div>
      </Section>

      {/* About Section */}
      <Section 
        id="about" 
        className="bg-emerald-950"
        backgroundImage="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-8">Why Smarbin?</h2>
          <p className="text-xl leading-relaxed text-emerald-100">
            We believe in a world where waste sorting isn't just a choice—it's an effortless part of daily life. 
            Our AI-powered solution makes sustainable living simple and intuitive.
          </p>
          <ScrollingImages />
        </div>
      </Section>

      {/* Features Sections */}
      <Section 
        id="features" 
        className="bg-emerald-800"
        backgroundImage="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="flex flex-col items-center">
          <Brain size={64} className="mb-6 text-emerald-300" />
          <h3 className="text-4xl font-bold mb-4">Intelligent Sorting</h3>
          <p className="text-xl text-center max-w-2xl px-6">
            Our advanced AI system instantly identifies and categorizes waste items, continuously learning 
            and adapting to ensure perfect sorting every time.
          </p>
        </div>
      </Section>

      <Section 
        className="bg-emerald-700"
        backgroundImage="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="flex flex-col items-center">
          <Recycle size={64} className="mb-6 text-emerald-300" />
          <h3 className="text-4xl font-bold mb-4">Real-time Carbon Footprint Analyzer</h3>
          <p className="text-xl text-center max-w-2xl px-6">
            Get instant guidance on proper waste disposal and track your 
            environmental impact.
          </p>
        </div>
      </Section>

      <Section 
        className="bg-emerald-600"
        backgroundImage="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="flex flex-col items-center">
          <Gift size={64} className="mb-6 text-emerald-300" />
          <h3 className="text-4xl font-bold mb-4">Get Rewarded</h3>
          <p className="text-xl text-center max-w-2xl px-6">
            Make a difference with every item you recycle, and turn your eco-friendly actions 
            into exciting rewards and activities.
          </p>
        </div>
      </Section>

      {/* Contact Section */}
      <Section 
        id="contact" 
        className="bg-emerald-500"
        backgroundImage="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=2000&q=80"
      >
        <div className="max-w-xl mx-auto px-6 w-full">
          <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
          <form className="space-y-8">
            <div>
              <input 
                type="text" 
                placeholder="Name" 
                className="contact-input"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Email" 
                className="contact-input"
              />
            </div>
            <div>
              <textarea 
                placeholder="Message" 
                rows="4" 
                className="contact-input resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-950 hover:bg-emerald-900 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </Section>
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/game/snake" element={<Game />} />
        <Route path="/game/minesweeper" element={<Minesweeper />} />
        <Route path="/game/tetris" element={<Tetris />} />
        <Route path="/redeem" element={<Redeem />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </>
  );
}

export default App;