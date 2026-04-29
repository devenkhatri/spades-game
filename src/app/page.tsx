import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-neutral-100">
      <h1 className="text-4xl font-bold mb-6">Spades Card Game</h1>
      <p className="mb-8">Welcome to the Spades card game!</p>
      <Link href="/game" className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
        Start Playing
      </Link>
    </div>
  );
}