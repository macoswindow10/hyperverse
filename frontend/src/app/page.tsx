export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-8 py-12 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-10 shadow-2xl shadow-cyan-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">HyperVerse Cloud</p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight">VPS management, built for operators.</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Phase 1 connects this Next.js shell to the backend API foundation for authentication, realtime events, and future compute orchestration.
        </p>
      </section>
    </main>
  );
}
