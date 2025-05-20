import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Job Application Platform</title>
        <meta name="description" content="Manage your job applications with AI-powered tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center">
              <h1 className="text-5xl font-bold text-center mb-8">
                Streamline Your Job Search Journey
              </h1>
              <p className="text-xl text-center mb-12 max-w-2xl">
                Track applications, get AI-powered insights, and land your dream job with our comprehensive platform.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Get Started
                </Link>
                <Link href="/auth/login" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
                <p className="text-gray-600">Get personalized recommendations and insights to improve your job applications.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Application Tracking</h3>
                <p className="text-gray-600">Keep track of all your job applications in one place with detailed status updates.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Generate Cover Letters</h3>
                <p className="text-gray-600">Generate tailored cover letters using your uploaded CVs and job descriptions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Job Search?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of job seekers who have streamlined their application process with our platform.
            </p>
            <Link href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Your Journey Today
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
