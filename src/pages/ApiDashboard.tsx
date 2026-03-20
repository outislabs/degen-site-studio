import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Code2,
  Loader2,
  Activity,
  Calendar,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  requests_per_minute: number;
  requests_per_day: number;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const MCP_URL = 'https://rxrgenpyiydwurvrdyzz.supabase.co/functions/v1/mcp-server';

const ApiDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);

  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const [snippetTab, setSnippetTab] = useState<'curl' | 'js'>('curl');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchKeys();
    fetchUsageStats();
  }, [user]);

  const fetchKeys = async () => {
    setKeysLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys' as any)
        .select('id, name, key_prefix, is_active, requests_per_minute, requests_per_day, created_at, last_used_at, revoked_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setKeys((data as ApiKey[]) || []);
    } catch {
      setKeys([]);
    } finally {
      setKeysLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);

      const [{ count: today }, { count: month }] = await Promise.all([
        supabase
          .from('api_usage_logs' as any)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString()),
        supabase
          .from('api_usage_logs' as any)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString()),
      ]);
      setTodayCount(today ?? 0);
      setMonthCount(month ?? 0);
    } catch {
      // Table may not exist yet
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-keys', {
        body: { action: 'create', name: newKeyName.trim() },
      });
      if (error || !data?.success) throw new Error(data?.error || 'Failed to create key');
      setNewRawKey(data.key);
      setNewKeyName('');
      await fetchKeys();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create key');
      setShowNewKeyDialog(false);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    setRevoking(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-keys', {
        body: { action: 'revoke', id },
      });
      if (error || !data?.success) throw new Error(data?.error || 'Failed to revoke key');
      toast.success('API key revoked');
      setRevokeId(null);
      await fetchKeys();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to revoke key');
    } finally {
      setRevoking(false);
    }
  };

  const closeNewKeyDialog = () => {
    setShowNewKeyDialog(false);
    setNewRawKey(null);
    setNewKeyName('');
    setCopied(false);
  };

  const activeKeys = keys.filter((k) => k.is_active);

  const snippetKey = activeKeys[0]?.key_prefix
    ? `${activeKeys[0].key_prefix}${'x'.repeat(32)}`
    : 'YOUR_API_KEY';

  const curlSnippet = `# 1. Handshake
curl -s -X POST ${MCP_URL} \\
  -H "X-DegenTools-API-Key: ${snippetKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

# 2. List available tools
curl -s -X POST ${MCP_URL} \\
  -H "X-DegenTools-API-Key: ${snippetKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}'

# 3. Generate shill tweets
curl -s -X POST ${MCP_URL} \\
  -H "X-DegenTools-API-Key: ${snippetKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0","method":"tools/call","id":3,
    "params":{
      "name":"generate_shill_copy",
      "arguments":{
        "token_name":"Moon Cat","token_ticker":"MCAT",
        "copy_type":"shill_tweets","count":5
      }
    }
  }'`;

  const jsSnippet = `const MCP_URL = "${MCP_URL}";
const API_KEY = "${snippetKey}";

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

// Generate a meme image
const memeJson = await callTool("generate_meme", {
  prompt: "rocket to the moon",
  token_name: "Moon Cat",
  token_ticker: "MCAT",
  type: "meme",
});
console.log(JSON.parse(memeJson).image_url);

// Generate shill tweets
const tweets = await callTool("generate_shill_copy", {
  token_name: "Moon Cat",
  token_ticker: "MCAT",
  copy_type: "shill_tweets",
  count: 5,
});
console.log(tweets);

// Register a token on Bags.fm
const token = await callTool("launch_token", {
  name: "Moon Cat",
  symbol: "MCAT",
  description: "The most degenerate cat on Solana",
  image_url: "https://example.com/logo.png",
});
console.log(JSON.parse(token).token_mint);`;

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">API Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage keys and access the DegenTools MCP server
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowNewKeyDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            disabled={activeKeys.length >= 5}
          >
            <Plus className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            <span className="hidden sm:inline">Generate New Key</span>
            <span className="sm:hidden">New Key</span>
          </Button>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Requests Today', value: todayCount, icon: Activity },
            { label: 'This Month', value: monthCount, icon: Calendar },
            { label: 'Active Keys', value: activeKeys.length, icon: Key },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* API Keys Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">API Keys</span>
              <Badge variant="outline" className="text-[10px]">
                {activeKeys.length} / 5
              </Badge>
            </div>
          </div>

          {keysLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Key className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate a key to start using the DegenTools MCP server
              </p>
              <Button
                size="sm"
                onClick={() => setShowNewKeyDialog(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Generate First Key
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2">Key</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2 hidden sm:table-cell">Created</th>
                    <th className="px-4 py-2 hidden md:table-cell">Last Used</th>
                    <th className="px-4 py-2 hidden lg:table-cell">Limits</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-muted-foreground">
                          {key.key_prefix}…
                        </code>
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">{key.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {new Date(key.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {key.last_used_at ? (
                          new Date(key.last_used_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        ) : (
                          <span className="text-muted-foreground/50">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {key.requests_per_minute}rpm · {key.requests_per_day.toLocaleString()}/day
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={key.is_active ? 'default' : 'secondary'}
                          className={`text-[10px] ${key.is_active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive'}`}
                        >
                          {key.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {key.is_active && (
                          <button
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            onClick={() => setRevokeId(key.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Code Snippets */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Quick Start</span>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {(['curl', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSnippetTab(tab)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    snippetTab === tab
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : 'JavaScript'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(snippetTab === 'curl' ? curlSnippet : jsSnippet);
                toast.success('Copied to clipboard');
              }}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy snippet"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <pre className="p-4 overflow-x-auto text-xs text-muted-foreground font-mono leading-relaxed">
              {snippetTab === 'curl' ? curlSnippet : jsSnippet}
            </pre>
          </div>

          <div className="px-4 py-2.5 border-t border-border flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span>
              Endpoint: <code className="text-primary">{MCP_URL}</code>
            </span>
            <span>·</span>
            <span>Protocol: JSON-RPC 2.0 (MCP 2024-11-05)</span>
            <span>·</span>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MCP Docs ↗
            </a>
          </div>
        </div>
      </div>

      {/* Generate New Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={(open) => !open && closeNewKeyDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              {newRawKey ? 'Save Your API Key' : 'Generate New API Key'}
            </DialogTitle>
            <DialogDescription>
              {newRawKey
                ? 'This is the only time your full key will be shown. Copy it now.'
                : 'Give your key a name so you can identify it later.'}
            </DialogDescription>
          </DialogHeader>

          {newRawKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Save this key — it won't be shown again. If you lose it, revoke it and generate a new one.
                </p>
              </div>

              <div className="bg-secondary rounded-lg p-3 break-all">
                <code className="text-xs font-mono text-foreground">{newRawKey}</code>
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleCopyKey(newRawKey)}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy API Key
                  </>
                )}
              </Button>

              <Button variant="ghost" className="w-full" onClick={closeNewKeyDialog}>
                Done — I've saved it
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Key name</label>
                <Input
                  placeholder="e.g. My Bot, Production, Testing"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !creating && newKeyName.trim() && handleCreateKey()
                  }
                  autoFocus
                  maxLength={100}
                />
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateKey}
                disabled={creating || !newKeyName.trim()}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-1" /> Generate Key
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                Max 5 active keys · {5 - activeKeys.length} remaining
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm Dialog */}
      <Dialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Revoke API Key
            </DialogTitle>
            <DialogDescription>
              This will immediately invalidate the key. Any apps or bots using it will stop working.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRevokeId(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && handleRevoke(revokeId)}
              disabled={revoking}
            >
              {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke Key'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApiDashboard;
