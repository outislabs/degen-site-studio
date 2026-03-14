const LandingFooter = () => {
  return (
    <footer className="border-t border-border/50 px-6 py-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display text-[10px] text-primary/60 tracking-wider">DEGEN TOOLS</span>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
