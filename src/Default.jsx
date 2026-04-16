import { Outlet } from "react-router-dom";
import Reveal from "./components/Reveal";
import HelpSection from "./LandingPage/Layout/Helpsection";
import Footer from "./LandingPage/Layout/Footer";
import Navigation from "./LandingPage/Layout/Navbar/Navigation";

function Default() {
    return (
        <div>
            {/* <Navigation />  */}
            <Outlet />
            {/* <HelpSection />
            <Reveal>
                <Footer />
            </Reveal> */}
        </div>
    );
}

export default Default;
