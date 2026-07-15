"use client";

import { motion } from "framer-motion";

export default function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/918976077070"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-4 md:bottom-8 md:right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-soft-lg flex items-center justify-center"
    >
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 rounded-full bg-[#25D366]"
      />
      {/* Official WhatsApp logo SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 175.216 175.552"
        className="w-7 h-7 relative z-10"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wa-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163"/>
            <stop offset="1" stopColor="#23b33a"/>
          </linearGradient>
        </defs>
        <path
          fill="#fff"
          d="M87.184 25.227c-33.733 0-61.166 27.4-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.513 31.208 8.513h.023c33.71 0 61.146-27.4 61.157-61.13a60.75 60.75 0 0 0-17.904-43.251 60.75 60.75 0 0 0-43.312-17.923z"
        />
        <path
          fill="url(#wa-grad)"
          d="M87.184 32.227c-29.945 0-54.178 24.2-54.178 54.13a53.98 53.98 0 0 0 8.349 28.768l1.455 2.312-5.179 18.896 19.479-5.108 2.235 1.324c8.387 4.98 18.15 7.788 28.208 7.788h.023c29.934 0 54.146-24.2 54.157-54.13a53.75 53.75 0 0 0-15.904-38.251 53.75 53.75 0 0 0-38.645-15.729z"
        />
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.218 0-3.203.457-4.882 2.281-1.678 1.825-6.41 6.256-6.41 15.258s6.566 17.697 7.48 18.93c.913 1.233 12.7 20.381 31.309 27.75 15.472 6.117 18.628 4.902 21.995 4.597 3.368-.305 10.858-4.44 12.386-8.727 1.528-4.289 1.528-7.965 1.07-8.727-.457-.762-1.675-1.219-3.505-2.135-1.83-.914-10.857-5.345-12.537-5.954-1.678-.61-2.897-.914-4.117.915-1.218 1.828-4.722 5.954-5.788 7.172-1.067 1.219-2.133 1.371-3.963.457-1.83-.915-7.712-2.839-14.705-9.065-5.434-4.841-9.112-10.82-10.178-12.649-1.066-1.828-.114-2.818.8-3.73.82-.82 1.83-2.134 2.743-3.202.914-1.066 1.218-1.828 1.828-3.047.61-1.219.305-2.287-.152-3.202-.458-.913-4.107-9.932-5.714-13.603z"
        />
      </svg>
    </motion.a>
  );
}
