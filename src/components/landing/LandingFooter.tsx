const LandingFooter = () => {
  return (
    <footer className="border-t border-border px-6 py-6 text-center">
      <p className="text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
      </p>
    </footer>
  );
};

export default LandingFooter;
