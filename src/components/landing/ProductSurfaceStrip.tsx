import { Globe, Sparkles, Wrench, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const surfaces = [
  {
    icon: Globe,
    title: 'Sites & Builder',
    description: 'Launch a site in minutes with templates built for memecoins and NFT projects.',
    href: '/builder',
  },
  {
    icon: Sparkles,
    title: 'Content Studio',
    description: 'Generate logos, banners, stickers, and posts. Ship marketing without a designer.',
    href: '/studio',
  },
  {
    icon: Wrench,
    title: 'The Workshop',
    description: 'Utility apps for your community: launch tools, trade terminal, scanners.',
    href: '/plugins',
  },
  {
    icon: Bot,
    title: 'Agents & API',
    description: 'CLI, MCP server, and API keys so agents and pipelines can operate your project.',
    href: '/docs',
  },
];

const ProductSurfaceStrip = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {surfaces.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              to={href}
              className="group flex flex-col gap-4 p-6 rounded-xl bg-[#0F1318] border border-border/40 hover:border-primary/40 transition-colors"
            >
              <Icon className="w-7 h-7 text-primary" />
              <h3 className="font-display text-xl text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground flex-1">{description}</p>
              <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSurfaceStrip;