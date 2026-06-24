export default function AboutPage() {
  return (
    <div className="section-container py-12 md:py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-sans font-black text-ink mb-6 text-center">About Little Bunnies</h1>
      <div className="bg-white p-8 md:p-12 rounded-brand shadow-soft prose prose-lg text-ink-muted">
        <p className="mb-4">
          Welcome to Little Bunnies! We are passionate about providing the best quality baby essentials for your precious little ones.
        </p>
        <p className="mb-4">
          Our mission is to make parenting a little bit easier by handpicking safe, comfortable, and premium products. Every item in our store is chosen with the utmost care, ensuring it meets our high standards for your baby's comfort and your peace of mind.
        </p>
        <p>
          Thank you for trusting us to be part of your parenting journey!
        </p>
      </div>
    </div>
  );
}
