import logo from '@/assets/logo.png';

const LandingFooter = () => {
  return (
    <footer className="border-t border-border/50 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <img src={logo} alt="Degen Tools" className="h-9 sm:h-10 w-auto opacity-60" />
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 text-center">
          © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
