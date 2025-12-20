import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, Calendar, User, MessageSquare, Loader2, ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
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
    };

    checkAdminAccess();
  }, [navigate]);

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

  const updateStatus = async (id: string, newStatus: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Kontaktanfragen
              </h1>
              <Badge variant="outline" className="ml-2">
                {messages.length} Nachrichten
              </Badge>
            </div>

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
                            onValueChange={(value) => updateStatus(msg.id, value)}
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
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
