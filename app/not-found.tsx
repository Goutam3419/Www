import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-zinc-400 mb-4">Page Not Found</p>
      <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium">
        Return Home
      </Link>
    </div>
  );
}
