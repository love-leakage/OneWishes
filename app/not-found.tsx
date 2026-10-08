import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
      <div className="inline-block text-xs font-bold tracking-widest text-amber-400 uppercase">
        ✦ 404 • WISH NOT FOUND
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">This letter never arrived.</h1>
      <p className="text-slate-400 text-sm leading-relaxed">
        The link may have expired, or the address was typed incorrectly.
      </p>
      <div>
        <Link href="/" className="inline-block px-8 py-3.5 rounded-2xl bg-amber-400 text-black font-bold text-xs uppercase tracking-wider">
          Go back home →
        </Link>
      </div>
    </div>
  );
}
