export function SiteFooter() {
  return (
    <footer className="pb-8 pt-4 sm:pb-10 sm:pt-6">
      <div className="container flex justify-center">
        <p className="text-center text-xs sm:text-sm font-extrabold tracking-[0.22em] text-zinc-400 uppercase">
          POWERED BY{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent font-black tracking-[0.28em]">
            APEXNET
          </span>
        </p>
      </div>
    </footer>
  );
}
