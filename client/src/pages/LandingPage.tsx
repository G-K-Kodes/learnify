import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";

function LandingComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col w-full">

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center bg-gradient-to-r from-indigo-600 to-purple-500 text-white py-20 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl w-full mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Empower Your Learning Journey
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8">
            Join thousands of learners and explore curated online courses in tech, design, and more.
          </p>
          <button 
          onClick={() => navigate("/auth")}
          className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 focus:outline-none">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-indigo-600 font-bold text-xl mb-2">Expert Instructors</h3>
              <p>Learn from industry professionals with hands-on experience.</p>
            </div>
            <div className="text-center p-6 border rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-indigo-600 font-bold text-xl mb-2">Flexible Learning</h3>
              <p>Access courses anytime, anywhere, and learn at your own pace.</p>
            </div>
            <div className="text-center p-6 border rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-indigo-600 font-bold text-xl mb-2">Certifications</h3>
              <p>Earn certificates to showcase your newly acquired skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-50 text-indigo-900 text-center py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Sign up today and unlock access to hundreds of online courses designed to boost your skills.
          </p>
          <button 
          onClick={() => navigate("/auth")}
          className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700">
            Join Now
          </button>
        </div>
      </section>
    </div>
  );
}

function LandingPage() {
  return(
    <Layout mainComponent={<LandingComponent />} />
  );
}

export default LandingPage;