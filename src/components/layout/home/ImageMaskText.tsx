import React from 'react';

export default function ImageMaskText() {
  return (
    <section className="py-12 md:py-24 w-full bg-cream overflow-x-hidden">
      <div className="w-full flex flex-col justify-center items-center px-2">
        {/* On mobile, break into two lines to avoid overflow */}
        <h2
          className="font-sans font-black text-center leading-[0.88] tracking-tighter uppercase"
          style={{
            fontSize: 'clamp(3rem, 18vw, 14rem)',
            backgroundImage: "url('/images/opt/banner2.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          <span className="block sm:inline">LITTLE </span>
          <span className="block sm:inline">BUNNIES</span>
        </h2>
      </div>
    </section>
  );
}
