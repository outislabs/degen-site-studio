const LandingFooter = () => {
  return (
    <footer className="border-t border-border/50 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-display text-[9px] sm:text-[10px] text-primary/60 tracking-wider">DEGEN TOOLS</span>
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 text-center">
          © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
