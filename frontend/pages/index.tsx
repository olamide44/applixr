import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')
  }, [router])

  return (
    <>
      <Head>
        <title>Job Application Platform</title>
        <meta name="description" content="Manage your job applications with AI-powered tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </main>
    </>
  )
}
