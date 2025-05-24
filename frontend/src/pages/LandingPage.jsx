import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { FaRobot, FaCogs, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { useUser } from '@clerk/clerk-react';

const LandingPage = () => {
  const { isSignedIn } = useUser();
  if (isSignedIn) return <Navigate to="/chat" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-repeat w-full h-full [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Your Custom AI Assistant
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Build and customize your own AI assistant powered by advanced RAG technology. 
              Tailored to your specific needs, ready to transform your workflow.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/demo"
                className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 rounded-full font-semibold transition-all duration-300"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg">Everything you need to create your perfect AI assistant</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaRobot className="w-8 h-8" />,
                title: "Custom AI Models",
                description: "Train and fine-tune AI models specific to your domain and requirements"
              },
              {
                icon: <FaCogs className="w-8 h-8" />,
                title: "Easy Integration",
                description: "Seamlessly integrate with your existing systems and workflows"
              },
              {
                icon: <FaChartLine className="w-8 h-8" />,
                title: "Advanced Analytics",
                description: "Track performance and gain insights into your AI's effectiveness"
              },
              {
                icon: <FaShieldAlt className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Bank-grade security with end-to-end encryption and access controls"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-gray-700/50 backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300"
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to your custom AI assistant</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Customize",
                description: "Define your requirements and customize your AI assistant's capabilities"
              },
              {
                step: "02",
                title: "Train",
                description: "Upload your data and train your AI with our advanced RAG technology"
              },
              {
                step: "03",
                title: "Deploy",
                description: "Deploy your AI assistant and start transforming your workflow"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-xl bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 mt-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join the future of AI-powered productivity today
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 