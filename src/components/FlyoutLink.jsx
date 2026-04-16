import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link as ScrollSmooth } from "react-scroll";

function FlyoutLink({ children, href, FlyoutContent }) {
  const [open, setOpen] = useState(false);
  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit z-[1000] hover:cursor-pointer  "
    >
      <ScrollSmooth
        to={href}
        activeClass="active"
        spy={true}
        smooth={true}
        hashSpy={true}
        offset={50}
        duration={500}
        className="relative text-customGray"
      >
        {children}
      </ScrollSmooth>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 md:top-10 lg:top-12 text-black"
          >
            <div className="absolute -top-6 left-0 right-0 h-6  bg-transparent" />

            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FlyoutLink;
