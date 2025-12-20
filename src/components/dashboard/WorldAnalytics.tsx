import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface WorldAnalyticsProps {
  worldId: string;
}

interface AnalyticsData {
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  averageStars: number;
  completionRate: number;
  sectionStats: {
    sectionId: string;
    title: string;
    attempts: number;
    avgScore: number;
  }[];
}

export function WorldAnalytics({ worldId }: WorldAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [worldId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch progress data for this world
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('world_id', worldId);

      if (progressError) throw progressError;

      // Fetch sections for this world
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('learning_sections')
        .select('id, title')
        .eq('world_id', worldId);

      if (sectionsError) throw sectionsError;

      // Calculate analytics
      const uniqueUsers = new Set(progressData?.map(p => p.user_id) || []);
      const totalAttempts = progressData?.reduce((sum, p) => sum + p.attempts, 0) || 0;
      const completedSessions = progressData?.filter(p => p.completed) || [];
      const avgScore = completedSessions.length > 0
        ? completedSessions.reduce((sum, p) => sum + (p.score || 0), 0) / completedSessions.length
        : 0;
      const avgStars = progressData?.length 
        ? progressData.reduce((sum, p) => sum + p.stars_collected, 0) / progressData.length
        : 0;

      // Section stats
      const sectionStats = (sectionsData || []).map(section => {
        const sectionProgress = progressData?.filter(p => p.section_id === section.id) || [];
        const sectionAttempts = sectionProgress.reduce((sum, p) => sum + p.attempts, 0);
        const completed = sectionProgress.filter(p => p.completed);
        const sectionAvgScore = completed.length > 0
          ? completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length
          : 0;

        return {
          sectionId: section.id,
          title: section.title,
          attempts: sectionAttempts,
          avgScore: Math.round(sectionAvgScore * 10) / 10,
        };
      });

      const totalSections = sectionsData?.length || 0;
      const completionRate = totalSections > 0 && uniqueUsers.size > 0
        ? (completedSessions.length / (totalSections * uniqueUsers.size)) * 100
        : 0;

      setAnalytics({
        totalStudents: uniqueUsers.size,
        totalAttempts,
        averageScore: Math.round(avgScore * 10) / 10,
        averageStars: Math.round(avgStars * 10) / 10,
        completionRate: Math.round(completionRate),
        sectionStats,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const statCards = [
    {
      title: 'Schüler',
      value: analytics.totalStudents,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Versuche',
      value: analytics.totalAttempts,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Ø Score',
      value: analytics.averageScore,
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Ø Sterne',
      value: analytics.averageStars.toFixed(1),
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Rate */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-moon" />
            Abschlussrate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fortschritt</span>
              <span className="font-medium">{analytics.completionRate}%</span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Section Stats */}
      {analytics.sectionStats.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Abschnitte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.sectionStats.map((section, index) => (
                <div
                  key={section.sectionId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium truncate">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {section.attempts} Versuche
                    </span>
                    <span className="font-medium">
                      Ø {section.avgScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.totalStudents === 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Noch keine Schüler haben diese Lernwelt besucht.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Teile den Link, um Schüler einzuladen!
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
