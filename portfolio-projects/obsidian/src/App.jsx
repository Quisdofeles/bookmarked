import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Specs from "./components/Specs.jsx";
import ShotOn from "./components/ShotOn.jsx";
import WhyObsidian from "./components/WhyObsidian.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Specs />
        <ShotOn />
        <WhyObsidian />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
