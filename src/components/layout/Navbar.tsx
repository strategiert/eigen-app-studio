import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoonLogo } from "@/components/icons/MoonLogo";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <MoonLogo size="sm" animate={false} />
            <span className="text-xl font-bold">
              <span className={isScrolled ? "text-foreground" : "text-white"}>Meo</span>
              <span className="text-moon">luna</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/explore" 
              className={`text-sm font-medium transition-colors ${
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              Lernwelten
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              Über uns
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Button asChild variant={isScrolled ? "outline" : "ghost"} size="sm" className={!isScrolled ? "text-white border-white/20" : ""}>
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm"
                  className={!isScrolled ? "text-white/70 hover:text-white" : ""}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-moon text-night-sky hover:bg-moon-glow">
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Anmelden
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-white"}`} />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border"
          >
            <div className="container px-4 py-4 flex flex-col gap-4">
              <Link 
                to="/explore" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Lernwelten
              </Link>
              <Link 
                to="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Über uns
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full bg-moon text-night-sky hover:bg-moon-glow">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Anmelden
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
