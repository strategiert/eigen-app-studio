import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Mail, Calendar, User, MessageSquare, Loader2, ShieldAlert, 
  Users, Crown, BookOpen, Settings, Globe, Trash2, Eye, Edit, AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface UserWithDetails {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: string;
  plan: string;
  world_limit: number;
  world_count: number;
}

interface LearningWorld {
  id: string;
  title: string;
  creator_id: string;
  creator_name: string | null;
  subject: string;
  status: string;
  is_public: boolean;
  created_at: string;
  view_count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [worlds, setWorlds] = useState<LearningWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [worldsLoading, setWorldsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [worldToDelete, setWorldToDelete] = useState<LearningWorld | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: hasAdminRole } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (!hasAdminRole) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      setIsAdmin(true);
      setCheckingAuth(false);
      fetchMessages();
      fetchUsers();
      fetchWorlds();
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchWorlds = async () => {
    setWorldsLoading(true);
    try {
      // Fetch all worlds
      const { data: worldsData, error: worldsError } = await supabase
        .from("learning_worlds")
        .select("id, title, creator_id, subject, status, is_public, created_at, view_count")
        .order("created_at", { ascending: false });

      if (worldsError) throw worldsError;

      // Fetch profiles to get creator names
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name");

      if (profilesError) throw profilesError;

      const profileMap = (profiles || []).reduce((acc: Record<string, string>, p) => {
        acc[p.id] = p.display_name || "Unbekannt";
        return acc;
      }, {});

      const worldsWithCreators: LearningWorld[] = (worldsData || []).map(world => ({
        ...world,
        creator_name: profileMap[world.creator_id] || "Unbekannt",
      }));

      setWorlds(worldsWithCreators);
    } catch (error) {
      console.error("Error fetching worlds:", error);
      toast({
        title: "Fehler",
        description: "Lernwelten konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
    setWorldsLoading(false);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Fehler",
        description: "Kontaktanfragen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, display_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan, world_limit");

      if (subsError) throw subsError;

      // Fetch world counts per user
      const { data: worldCounts, error: worldsError } = await supabase
        .from("learning_worlds")
        .select("creator_id");

      if (worldsError) throw worldsError;

      // Count worlds per user
      const worldCountMap = (worldCounts || []).reduce((acc: Record<string, number>, w) => {
        acc[w.creator_id] = (acc[w.creator_id] || 0) + 1;
        return acc;
      }, {});

      // Combine data
      const usersWithDetails: UserWithDetails[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userSub = subscriptions?.find(s => s.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email || "",
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: userRole?.role || "student",
          plan: userSub?.plan || "free",
          world_limit: userSub?.world_limit || 3,
          world_count: worldCountMap[profile.id] || 0,
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Fehler",
        description: "Nutzer konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
    setUsersLoading(false);
  };

  const updateMessageStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
      toast({
        title: "Status aktualisiert",
        description: `Status wurde auf "${newStatus}" geändert.`,
      });
    }
  };

  const updateUserPlan = async (userId: string, newPlan: "free" | "pro" | "school") => {
    const worldLimit = newPlan === "free" ? 3 : newPlan === "pro" ? 999 : 999;
    
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ plan: newPlan, world_limit: worldLimit } as any)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Fehler",
        description: "Plan konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan, world_limit: worldLimit } : u))
      );
      toast({
        title: "Plan aktualisiert",
        description: `Plan wurde auf "${newPlan}" geändert.`,
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: "student" | "creator" | "admin") => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole } as any)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Fehler",
        description: "Rolle konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast({
        title: "Rolle aktualisiert",
        description: `Rolle wurde auf "${newRole}" geändert.`,
      });
    }
  };

  const deleteWorld = async (world: LearningWorld) => {
    // First delete all sections
    const { error: sectionsError } = await supabase
      .from("learning_sections")
      .delete()
      .eq("world_id", world.id);

    if (sectionsError) {
      console.error("Error deleting sections:", sectionsError);
      toast({
        title: "Fehler",
        description: "Sektionen konnten nicht gelöscht werden.",
        variant: "destructive",
      });
      return;
    }

    // Then delete the world
    const { error } = await supabase
      .from("learning_worlds")
      .delete()
      .eq("id", world.id);

    if (error) {
      console.error("Error deleting world:", error);
      toast({
        title: "Fehler",
        description: "Lernwelt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } else {
      setWorlds((prev) => prev.filter((w) => w.id !== world.id));
      toast({
        title: "Lernwelt gelöscht",
        description: `"${world.title}" wurde erfolgreich gelöscht.`,
      });
    }
    setWorldToDelete(null);
  };

  const getWorldStatusBadge = (status: string, isPublic: boolean) => {
    if (status === "published" && isPublic) {
      return <Badge className="bg-green-500 text-white">Öffentlich</Badge>;
    }
    if (status === "published") {
      return <Badge variant="secondary">Veröffentlicht</Badge>;
    }
    if (status === "generating") {
      return <Badge className="bg-amber-500 text-white">Generiert...</Badge>;
    }
    return <Badge variant="outline">Entwurf</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">Neu</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Bearbeitung</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-600 border-green-600">Erledigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case "creator":
        return <Badge className="bg-blue-500 text-white">Creator</Badge>;
      default:
        return <Badge variant="outline">Student</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Pro</Badge>;
      case "school":
        return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">Schule</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    totalUsers: users.length,
    creators: users.filter(u => u.role === "creator" || u.role === "admin").length,
    proUsers: users.filter(u => u.plan === "pro" || u.plan === "school").length,
    totalWorlds: users.reduce((acc, u) => acc + u.world_count, 0),
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Zugriff verweigert
              </h1>
              <p className="text-muted-foreground">
                Du hast keine Berechtigung, diese Seite zu sehen.
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Admin-Dashboard
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Nutzer gesamt</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-muted-foreground" />
                    {stats.totalUsers}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Creators</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-500" />
                    {stats.creators}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pro-Nutzer</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Crown className="h-6 w-6 text-amber-500" />
                    {stats.proUsers}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Lernwelten</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-green-500" />
                    {stats.totalWorlds}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Nutzer
                </TabsTrigger>
                <TabsTrigger value="worlds" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Lernwelten
                  <Badge variant="secondary" className="ml-1">
                    {worlds.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Nachrichten
                  {messages.filter(m => m.status === "new").length > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {messages.filter(m => m.status === "new").length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-20">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Keine Nutzer vorhanden.</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nutzer</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Registriert</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Welten</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {user.display_name || "Unbekannt"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${user.email}`}
                                className="text-primary hover:underline"
                              >
                                {user.email}
                              </a>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(user.created_at)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value) => updateUserRole(user.id, value as "student" | "creator" | "admin")}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue>{getRoleBadge(user.role)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="creator">Creator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.plan}
                                onValueChange={(value) => updateUserPlan(user.id, value as "free" | "pro" | "school")}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue>{getPlanBadge(user.plan)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="pro">Pro</SelectItem>
                                  <SelectItem value="school">Schule</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {user.world_count}
                                  {user.plan === "free" && (
                                    <span className="text-muted-foreground">/{user.world_limit}</span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="worlds">
                {worldsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : worlds.length === 0 ? (
                  <div className="text-center py-20">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Keine Lernwelten vorhanden.</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titel</TableHead>
                          <TableHead>Creator</TableHead>
                          <TableHead>Fach</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Erstellt</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {worlds.map((world) => (
                          <TableRow key={world.id}>
                            <TableCell>
                              <span className="font-medium">{world.title}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {world.creator_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {world.subject}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getWorldStatusBadge(world.status, world.is_public)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {world.view_count}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(world.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/w/${world.id}`)}
                                  title="Ansehen"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/world/${world.id}/edit`)}
                                  title="Bearbeiten"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setWorldToDelete(world)}
                                  title="Löschen"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="messages">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Noch keine Kontaktanfragen vorhanden.
                    </p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Betreff</TableHead>
                          <TableHead className="max-w-xs">Nachricht</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((msg) => (
                          <TableRow key={msg.id}>
                            <TableCell>
                              <Select
                                value={msg.status}
                                onValueChange={(value) => updateMessageStatus(msg.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue>{getStatusBadge(msg.status)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Neu</SelectItem>
                                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                                  <SelectItem value="resolved">Erledigt</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(msg.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {msg.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-primary hover:underline"
                              >
                                {msg.email}
                              </a>
                            </TableCell>
                            <TableCell className="font-medium">{msg.subject}</TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate text-sm text-muted-foreground">
                                {msg.message}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />

      <AlertDialog open={!!worldToDelete} onOpenChange={(open) => !open && setWorldToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Lernwelt löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du "{worldToDelete?.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden. Alle Sektionen und Inhalte werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => worldToDelete && deleteWorld(worldToDelete)}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
