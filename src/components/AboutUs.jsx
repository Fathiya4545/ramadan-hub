export default function AboutUs() {
  return (
    <section id="about" className="scroll-mt-20 bg-emerald-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
      <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
        Medina App is a companion app built to support Muslims through the
        blessed month of Ramadan, bringing prayer times, Quran recitation,
        nearby mosques, and community events together in one place.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto text-left">
        <div className="bg-white rounded-xl p-5">
          <h3 className="font-semibold text-gray-800">Our Mission</h3>
          <p className="text-sm text-gray-500 mt-1">
            Make it easier to stay connected to prayer, Quran, and community
            during Ramadan, wherever you are.
          </p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <h3 className="font-semibold text-gray-800">What We Offer</h3>
          <p className="text-sm text-gray-500 mt-1">
            Accurate prayer times, daily verses with audio, a mosque finder,
            and local community events.
          </p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <h3 className="font-semibold text-gray-800">Get Involved</h3>
          <p className="text-sm text-gray-500 mt-1">
            Join community iftars, study circles, and charity drives near
            you.
          </p>
        </div>
      </div>
    </section>
  );
}
