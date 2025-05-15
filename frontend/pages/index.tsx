import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Job Application Platform</title>
        <meta name="description" content="Manage your job applications with AI-powered tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Job Application Platform
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Manage your job applications with AI-powered tools for resume analysis and cover letter generation.
            </p>
          </div>
        </div>
      </main>
    </>
  )
} 