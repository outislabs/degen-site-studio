import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Shield, Users, Globe, CreditCard, Image, BarChart3,
  Trash2, Search, Crown, RefreshCw, AlertTriangle, Eye,
  ChevronLeft, ChevronRight, UserX, ShieldCheck, ShieldOff, Wallet,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  subscription: { plan: string; status: string } | null;
  site_count: number;
  roles: string[];
}

interface Stats {
  totalUsers: number;
  totalSites: number;
  totalContent: number;
  activePaid: number;
  recentSignups: number;
  planBreakdown: Record<string, number>;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; label: string }>({ open: false, type: '', id: '', label: '' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    if (!adminLoading && !isAdmin && !authLoading && user) navigate('/');
  }, [authLoading, adminLoading, user, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchUsers();
      fetchSites();
      fetchContent();
    }
  }, [isAdmin]);

  const invokeAdmin = async (action: string, body?: any) => {
    const params: any = { action };
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`);
    url.searchParams.set('action', action);
    
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(url.toString(), {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  };

  const fetchStats = async () => {
    try {
      const data = await invokeAdmin('stats');
      setStats(data);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const data = await invokeAdmin('list');
      setUsers(data.users || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
    if (data) setSites(data);
  };

  const fetchContent = async () => {
    const { data } = await supabase.from('generated_content').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setContent(data);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await invokeAdmin('delete_user', { user_id: userId });
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (e: any) {
      toast.error(e.message);
    }
    setDeleteDialog({ open: false, type: '', id: '', label: '' });
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      await invokeAdmin('update_plan', { user_id: userId, plan });
      toast.success('Plan updated');
      fetchUsers();
      fetchStats();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    try {
      await invokeAdmin('set_role', { user_id: userId, role: 'admin', remove: currentlyAdmin });
      toast.success(currentlyAdmin ? 'Admin role removed' : 'Admin role granted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    const { error } = await supabase.from('sites').delete().eq('id', siteId);
    if (error) toast.error(error.message);
    else { toast.success('Site deleted'); fetchSites(); fetchStats(); }
    setDeleteDialog({ open: false, type: '', id: '', label: '' });
  };

  const handleDeleteContent = async (contentId: string) => {
    const { error } = await supabase.from('generated_content').delete().eq('id', contentId);
    if (error) toast.error(error.message);
    else { toast.success('Content deleted'); fetchContent(); fetchStats(); }
    setDeleteDialog({ open: false, type: '', id: '', label: '' });
  };

  const getUserIdentifier = (user: AdminUser) => {
    if (user.email) return { label: user.email, isWallet: false };
    const web3Identity = (user as any).identities?.find((i: any) => i.provider === 'web3' || i.provider === 'solana');
    if (web3Identity?.identity_data?.address) {
      const addr = web3Identity.identity_data.address;
      return { label: `${addr.slice(0, 8)}...${addr.slice(-6)}`, isWallet: true };
    }
    return { label: `${user.id.slice(0, 8)}...`, isWallet: true };
  };

  const filteredUsers = users.filter(u => {
    const identifier = getUserIdentifier(u);
    return identifier.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.includes(searchQuery);
  });

  const filteredSites = sites.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const planColors: Record<string, string> = {
    starter: 'bg-muted text-muted-foreground',
    degen: 'bg-primary/20 text-primary',
    creator: 'bg-accent/20 text-accent',
    pro: 'bg-[hsl(var(--neon-blue))/0.2] text-[hsl(var(--neon-blue))]',
    whale: 'bg-[hsl(var(--neon-pink))/0.2] text-[hsl(var(--neon-pink))]',
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users, sites, subscriptions & content</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Users</TabsTrigger>
            <TabsTrigger value="sites" className="gap-1.5 text-xs"><Globe className="w-3.5 h-3.5" />Sites</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><CreditCard className="w-3.5 h-3.5" />Plans</TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs"><Image className="w-3.5 h-3.5" />Content</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-primary' },
                { label: 'Total Sites', value: stats?.totalSites ?? '—', icon: Globe, color: 'text-accent' },
                { label: 'Content Items', value: stats?.totalContent ?? '—', icon: Image, color: 'text-[hsl(var(--neon-blue))]' },
                { label: 'Paid Users', value: stats?.activePaid ?? '—', icon: Crown, color: 'text-[hsl(var(--neon-pink))]' },
                { label: 'New (7d)', value: stats?.recentSignups ?? '—', icon: BarChart3, color: 'text-primary' },
              ].map((s) => (
                <Card key={s.label} className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className={cn('w-4 h-4', s.color)} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Plan breakdown */}
            {stats?.planBreakdown && (
              <Card className="bg-card/50 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(stats.planBreakdown).map(([plan, count]) => (
                      <div key={plan} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                        <Crown className="w-3.5 h-3.5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-foreground capitalize">{plan}</p>
                          <p className="text-xs text-muted-foreground">{count} users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, wallet, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>

            <Card className="bg-card/50 border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Plan</TableHead>
                      <TableHead className="text-xs">Sites</TableHead>
                      <TableHead className="text-xs">Roles</TableHead>
                      <TableHead className="text-xs">Joined</TableHead>
                      <TableHead className="text-xs">Last Login</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="border-border">
                        <TableCell className="text-xs font-medium text-foreground">
                          {(() => {
                            const id = getUserIdentifier(u);
                            return (
                              <span className="inline-flex items-center gap-1.5">
                                {id.isWallet && <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />}
                                {id.label}
                              </span>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] capitalize', planColors[u.subscription?.plan || 'starter'])}>
                            {u.subscription?.plan || 'starter'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.site_count}</TableCell>
                        <TableCell>
                          {u.roles.includes('admin') ? (
                            <Badge className="bg-destructive/20 text-destructive text-[10px]">Admin</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">User</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Select
                              value={u.subscription?.plan || 'starter'}
                              onValueChange={(val) => handleUpdatePlan(u.id, val)}
                            >
                              <SelectTrigger className="h-7 w-24 text-[10px] bg-card border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['starter', 'degen', 'creator', 'pro', 'whale'].map(p => (
                                  <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleToggleAdmin(u.id, u.roles.includes('admin'))}
                              title={u.roles.includes('admin') ? 'Remove admin' : 'Make admin'}
                            >
                              {u.roles.includes('admin') ? (
                                <ShieldOff className="w-3.5 h-3.5 text-destructive" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'user', id: u.id, label: getUserIdentifier(u).label })}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          {loadingData ? 'Loading...' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* SITES TAB */}
          <TabsContent value="sites" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sites by name or ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchSites} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>

            <Card className="bg-card/50 border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Ticker</TableHead>
                      <TableHead className="text-xs">Owner</TableHead>
                      <TableHead className="text-xs">Domain</TableHead>
                      <TableHead className="text-xs">Created</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map((s) => (
                      <TableRow key={s.id} className="border-border">
                        <TableCell className="text-xs font-medium text-foreground">{s.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">${s.ticker || '—'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{s.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.custom_domain || s.slug || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(s.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => navigate(`/site/${s.id}`)}
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: 'site', id: s.id, label: s.name || s.ticker })}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSites.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No sites found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* SUBSCRIPTIONS TAB */}
          <TabsContent value="subscriptions" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats?.planBreakdown && Object.entries(stats.planBreakdown).map(([plan, count]) => {
                const total = stats.totalUsers || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <Card key={plan} className="bg-card/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground capitalize">{plan}</p>
                        <Badge variant="outline" className="text-[10px]">{count} users</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pct}% of total</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">All Subscriptions</CardTitle>
                <CardDescription className="text-xs">Change plans directly from the Users tab</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Plan</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Downloads Used</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.subscription).map((u) => (
                        <TableRow key={u.id} className="border-border">
                          <TableCell className="text-xs text-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px] capitalize', planColors[u.subscription?.plan || 'free'])}>
                              {u.subscription?.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-[10px]', u.subscription?.status === 'active' ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30')}>
                              {u.subscription?.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">—</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchContent} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <p className="text-xs text-muted-foreground">{content.length} items loaded</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {content.map((c) => (
                <Card key={c.id} className="bg-card/50 border-border overflow-hidden group">
                  {c.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{c.title || 'Untitled'}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{c.type}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">by {c.user_id?.slice(0, 8)}...</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteDialog({ open: true, type: 'content', id: c.id, label: c.title || 'this content' })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {content.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                  No generated content found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog(prev => ({ ...prev, open: o }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deleteDialog.label}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.type === 'user') handleDeleteUser(deleteDialog.id);
                else if (deleteDialog.type === 'site') handleDeleteSite(deleteDialog.id);
                else if (deleteDialog.type === 'content') handleDeleteContent(deleteDialog.id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Admin;
