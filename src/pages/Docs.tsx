import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Copy, Check, Book, Code2, Server, Wrench, Rocket, Menu, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const BASE_URL = 'https://degentools.co/api/v1';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { id: string; title: string }[];
}

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { id: 'what-is-degentools', title: 'What is DegenTools' },
      { id: 'quick-start', title: 'Quick Start' },
      { id: 'authentication', title: 'Authentication' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Book,
    items: [
      { id: 'base-url', title: 'Base URL' },
      { id: 'api-auth', title: 'Authentication' },
      { id: 'rate-limits', title: 'Rate Limits' },
    ],
  },
  {
    id: 'mcp-server',
    title: 'MCP Server',
    icon: Server,
    items: [
      { id: 'mcp-overview', title: 'Overview' },
      { id: 'generate-meme', title: 'generate_meme' },
      { id: 'generate-shill-copy', title: 'generate_shill_copy' },
      { id: 'get-token-data', title: 'get_token_data' },
      { id: 'launch-token', title: 'launch_token' },
    ],
  },
  {
    id: 'code-examples',
    title: 'Code Examples',
    icon: Code2,
    items: [
      { id: 'example-curl', title: 'cURL' },
      { id: 'example-js', title: 'JavaScript' },
      { id: 'example-python', title: 'Python' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: Wrench,
    items: [
      { id: 'tool-website-builder', title: 'Website Builder' },
      { id: 'tool-content-studio', title: 'Content Studio' },
      { id: 'tool-token-launch', title: 'Token Launch' },
      { id: 'tool-bags-wallet', title: 'Bags Wallet' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Code block                                                         */
/* ------------------------------------------------------------------ */

const CodeBlock = ({ code, language = '' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg border border-border bg-secondary/50 overflow-hidden my-4">
      {language && (
        <div className="px-4 py-1.5 border-b border-border text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {language}
        </div>
      )}
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-foreground/90 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const SidebarNav = ({
  active,
  onSelect,
  openSections,
  toggleSection,
}: {
  active: string;
  onSelect: (id: string) => void;
  openSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
}) => (
  <nav className="space-y-1">
    {sections.map((section) => {
      const Icon = section.icon;
      const isOpen = openSections[section.id] !== false;
      return (
        <div key={section.id}>
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            <span className="flex-1 text-left">{section.title}</span>
            {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </button>
          {isOpen && (
            <div className="ml-5 border-l border-border pl-3 space-y-0.5 mt-0.5 mb-2">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 text-[11px] rounded-md transition-colors',
                    active === item.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </nav>
);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const Heading = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-xl font-bold text-foreground mt-10 mb-4 scroll-mt-20 flex items-center gap-2">
    {children}
  </h2>
);

const SubHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h3 id={id} className="text-base font-semibold text-foreground mt-8 mb-3 scroll-mt-20">
    {children}
  </h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-primary/10 text-primary text-[10px] font-mono font-bold px-2 py-0.5 rounded">{children}</span>
);

const DocsContent = () => (
  <div className="max-w-3xl">
    {/* Getting Started */}
    <Heading id="what-is-degentools">🚀 What is DegenTools</Heading>
    <P>
      DegenTools is the all-in-one platform for meme coin creators and communities. Build professional token websites,
      generate viral meme content, launch tokens on Solana, and access everything programmatically via our MCP-compatible API.
    </P>
    <P>
      Whether you're a solo degen or running a full project, DegenTools gives you the tools to look professional without
      taking yourself too seriously.
    </P>

    <SubHeading id="quick-start">Quick Start</SubHeading>
    <P>Get up and running in 3 steps:</P>
    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 mb-4 ml-1">
      <li>Create an account at <span className="text-primary">degentools.co</span></li>
      <li>Generate an API key from the <span className="text-primary">API Dashboard</span></li>
      <li>Start making requests to the MCP server endpoint</li>
    </ol>
    <CodeBlock
      language="bash"
      code={`curl -X POST ${BASE_URL}/mcp \\
  -H "X-DegenTools-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'`}
    />

    <SubHeading id="authentication">Authentication</SubHeading>
    <P>
      All API requests require an API key passed in the <Badge>X-DegenTools-API-Key</Badge> header.
      You can generate and manage keys from the API Dashboard in your account.
    </P>
    <P>
      Keys are tied to your account and inherit your plan's rate limits. Keep your keys secret — if a key
      is compromised, revoke it immediately and generate a new one.
    </P>

    {/* API Reference */}
    <Heading id="base-url">📡 API Reference</Heading>
    <SubHeading id="base-url">Base URL</SubHeading>
    <P>All API requests should be made to:</P>
    <CodeBlock code={BASE_URL} />

    <SubHeading id="api-auth">Authentication</SubHeading>
    <P>Include your API key in every request:</P>
    <CodeBlock language="http" code={`POST /mcp HTTP/1.1
Host: degentools.co
Content-Type: application/json
X-DegenTools-API-Key: dgt_your_api_key_here`} />

    <SubHeading id="rate-limits">Rate Limits</SubHeading>
    <P>Rate limits depend on your plan:</P>
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-secondary/60">
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">Plan</th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">Requests/min</th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">Requests/day</th>
            <th className="text-left px-4 py-2.5 font-semibold text-foreground">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr className="hover:bg-muted/30"><td className="px-4 py-2.5 text-muted-foreground">Free</td><td className="px-4 py-2.5 text-muted-foreground">10</td><td className="px-4 py-2.5 text-muted-foreground">500</td><td className="px-4 py-2.5 text-muted-foreground">$0</td></tr>
          <tr className="hover:bg-muted/30"><td className="px-4 py-2.5 text-primary font-medium">Degen</td><td className="px-4 py-2.5 text-muted-foreground">30</td><td className="px-4 py-2.5 text-muted-foreground">2,000</td><td className="px-4 py-2.5 text-muted-foreground">$9/mo</td></tr>
          <tr className="hover:bg-muted/30"><td className="px-4 py-2.5 text-primary font-medium">Pro</td><td className="px-4 py-2.5 text-muted-foreground">60</td><td className="px-4 py-2.5 text-muted-foreground">5,000</td><td className="px-4 py-2.5 text-muted-foreground">$29/mo</td></tr>
          <tr className="hover:bg-muted/30"><td className="px-4 py-2.5 text-primary font-medium">Whale</td><td className="px-4 py-2.5 text-muted-foreground">120</td><td className="px-4 py-2.5 text-muted-foreground">20,000</td><td className="px-4 py-2.5 text-muted-foreground">$69/mo</td></tr>
        </tbody>
      </table>
    </div>
    <P>
      When you exceed your rate limit, the API returns <Badge>429 Too Many Requests</Badge>. Back off and retry after the cooldown window.
    </P>

    {/* MCP Server */}
    <Heading id="mcp-overview">🔌 MCP Server</Heading>
    <SubHeading id="mcp-overview">Overview</SubHeading>
    <P>
      The DegenTools API implements the <strong className="text-foreground">Model Context Protocol (MCP)</strong> specification
      (version 2024-11-05). This means you can connect it directly to any MCP-compatible AI client like Claude Desktop, Cursor, or custom agents.
    </P>
    <P>
      The server exposes tools via JSON-RPC 2.0. Use <Badge>tools/list</Badge> to discover all available tools, then call them with <Badge>tools/call</Badge>.
    </P>
    <CodeBlock language="json" code={`{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}`} />

    <SubHeading id="generate-meme">generate_meme</SubHeading>
    <P>Generate AI meme images for your token.</P>
    <CodeBlock language="json" code={`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "generate_meme",
    "arguments": {
      "prompt": "rocket going to the moon with a cat riding it",
      "token_name": "Moon Cat",
      "token_ticker": "MCAT",
      "type": "meme"
    }
  }
}`} />
    <P><strong className="text-foreground">Parameters:</strong></P>
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4 ml-1">
      <li><Badge>prompt</Badge> — Description of the meme image</li>
      <li><Badge>token_name</Badge> — Token name for branding</li>
      <li><Badge>token_ticker</Badge> — Token ticker symbol</li>
      <li><Badge>type</Badge> — One of: <code className="text-foreground">meme</code>, <code className="text-foreground">banner</code>, <code className="text-foreground">pfp</code>, <code className="text-foreground">sticker</code></li>
    </ul>

    <SubHeading id="generate-shill-copy">generate_shill_copy</SubHeading>
    <P>Generate viral marketing copy for your token.</P>
    <CodeBlock language="json" code={`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 2,
  "params": {
    "name": "generate_shill_copy",
    "arguments": {
      "token_name": "Moon Cat",
      "token_ticker": "MCAT",
      "copy_type": "shill_tweets",
      "count": 5
    }
  }
}`} />
    <P><strong className="text-foreground">Parameters:</strong></P>
    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4 ml-1">
      <li><Badge>token_name</Badge> — Token name</li>
      <li><Badge>token_ticker</Badge> — Ticker symbol</li>
      <li><Badge>copy_type</Badge> — One of: <code className="text-foreground">shill_tweets</code>, <code className="text-foreground">raid_messages</code>, <code className="text-foreground">announcements</code></li>
      <li><Badge>count</Badge> — Number of items to generate (1–10)</li>
    </ul>

    <SubHeading id="get-token-data">get_token_data</SubHeading>
    <P>Fetch live market data for a Solana token via its contract address or ticker.</P>
    <CodeBlock language="json" code={`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 3,
  "params": {
    "name": "get_token_data",
    "arguments": {
      "query": "MCAT"
    }
  }
}`} />

    <SubHeading id="launch-token">launch_token</SubHeading>
    <P>Register and launch a token on Bags.fm directly from the API.</P>
    <CodeBlock language="json" code={`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 4,
  "params": {
    "name": "launch_token",
    "arguments": {
      "name": "Moon Cat",
      "symbol": "MCAT",
      "description": "The most degenerate cat on Solana 🐱🚀",
      "image_url": "https://example.com/logo.png"
    }
  }
}`} />

    {/* Code Examples */}
    <Heading id="example-curl">💻 Code Examples</Heading>
    <SubHeading id="example-curl">cURL</SubHeading>
    <CodeBlock language="bash" code={`# Initialize handshake
curl -s -X POST ${BASE_URL}/mcp \\
  -H "X-DegenTools-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

# Generate meme
curl -s -X POST ${BASE_URL}/mcp \\
  -H "X-DegenTools-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0","method":"tools/call","id":2,
    "params":{
      "name":"generate_meme",
      "arguments":{
        "prompt":"ape riding a rocket",
        "token_name":"DegenApe","token_ticker":"DAPE",
        "type":"meme"
      }
    }
  }'`} />

    <SubHeading id="example-js">JavaScript</SubHeading>
    <CodeBlock language="javascript" code={`const API_KEY = "YOUR_API_KEY";
const MCP_URL = "${BASE_URL}/mcp";

async function callTool(name, args) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-DegenTools-API-Key": API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      id: Date.now(),
      params: { name, arguments: args },
    }),
  });
  const { result } = await res.json();
  if (result.isError) throw new Error(result.content[0].text);
  return result.content[0].text;
}

// Generate shill tweets
const tweets = await callTool("generate_shill_copy", {
  token_name: "Moon Cat",
  token_ticker: "MCAT",
  copy_type: "shill_tweets",
  count: 5,
});
console.log(tweets);`} />

    <SubHeading id="example-python">Python</SubHeading>
    <CodeBlock language="python" code={`import requests, json

API_KEY = "YOUR_API_KEY"
MCP_URL = "${BASE_URL}/mcp"

def call_tool(name: str, args: dict):
    resp = requests.post(
        MCP_URL,
        headers={
            "Content-Type": "application/json",
            "X-DegenTools-API-Key": API_KEY,
        },
        json={
            "jsonrpc": "2.0",
            "method": "tools/call",
            "id": 1,
            "params": {"name": name, "arguments": args},
        },
    )
    result = resp.json()["result"]
    if result.get("isError"):
        raise Exception(result["content"][0]["text"])
    return result["content"][0]["text"]

# Generate a meme
meme = call_tool("generate_meme", {
    "prompt": "dog wearing sunglasses on a lambo",
    "token_name": "Cool Dog",
    "token_ticker": "CDOG",
    "type": "meme",
})
print(json.loads(meme)["image_url"])`} />

    {/* Tools */}
    <Heading id="tool-website-builder">🛠 Tools</Heading>
    <SubHeading id="tool-website-builder">Website Builder</SubHeading>
    <P>
      Create professional meme coin landing pages in minutes. Choose from 7+ layouts including Classic, Cinematic,
      Bento, Mascot Hero, and more. Each layout is fully responsive and includes interactive elements like buy buttons,
      chart links, contract copy, and social links.
    </P>

    <SubHeading id="tool-content-studio">Content Studio</SubHeading>
    <P>
      Generate memes, banners, PFPs, stickers, and viral marketing copy using AI. Upload a reference image for
      consistent branding or let the AI create from scratch. Content can be organized into sticker packs for
      easy sharing and downloading.
    </P>

    <SubHeading id="tool-token-launch">Token Launch</SubHeading>
    <P>
      Launch tokens directly on Bags.fm from the DegenTools dashboard. Connect your Solana wallet, fill in token
      details, and deploy — no coding required. The API also supports programmatic token launching via the
      <Badge>launch_token</Badge> MCP tool.
    </P>

    <SubHeading id="tool-bags-wallet">Bags Wallet</SubHeading>
    <P>
      View your Solana wallet portfolio, track token holdings, and manage your bags. Connected via Reown (WalletConnect)
      for secure wallet interactions across all major Solana wallets.
    </P>

    <div className="mt-16 mb-8 pt-8 border-t border-border">
      <P>
        Need help? Reach out on <a href="https://x.com/degentoolshq" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a> or
        email <a href="mailto:support@degentools.co" className="text-primary hover:underline">support@degentools.co</a>
      </P>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const Docs = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('what-is-degentools');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.id, true]))
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollTo = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-foreground">DegenTools Docs</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/api')}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              API Dashboard →
            </button>
          </div>
        </div>
      </header>

      {/* Mobile accordion nav */}
      {mobileNavOpen && (
        <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 py-3">
          <SidebarNav active={active} onSelect={scrollTo} openSections={openSections} toggleSection={toggleSection} />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto py-6 px-4">
          <SidebarNav active={active} onSelect={scrollTo} openSections={openSections} toggleSection={toggleSection} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8">
          <DocsContent />
        </main>
      </div>
    </div>
  );
};

export default Docs;
