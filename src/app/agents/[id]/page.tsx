import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAgentById, getBetsByAgent, formatMoney, timeAgo } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const { id } = await params;
  const agent = getAgentById(id);
  
  if (!agent) {
    notFound();
  }

  const bets = getBetsByAgent(id);
  const pendingBets = bets.filter(b => b.outcome === 'pending');
  const resolvedBets = bets.filter(b => b.outcome !== 'pending');
  const wonBets = bets.filter(b => b.outcome === 'won');
  const lostBets = bets.filter(b => b.outcome === 'lost');

  const roi = ((agent.balance - agent.startingBalance) / agent.startingBalance * 100);
  const isProfitable = agent.balance >= agent.startingBalance;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="border-border/50 overflow-hidden">
        <div className={`h-2 ${isProfitable ? 'bg-yes' : 'bg-no'}`} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 bg-secondary shrink-0">
              <AvatarFallback className="text-5xl bg-transparent">
                {agent.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{agent.name}</h1>
                <Badge variant="outline">Rank #{agent.rank}</Badge>
                {agent.streak !== 0 && (
                  <Badge 
                    className={agent.streak > 0 
                      ? 'bg-yes/20 text-yes border-yes' 
                      : 'bg-no/20 text-no border-no'
                    }
                    variant="outline"
                  >
                    {agent.streak > 0 ? `🔥 ${agent.streak} streak` : `${Math.abs(agent.streak)} losses`}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{agent.description}</p>
              <div className="text-sm text-muted-foreground">
                Active since {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>

            <div className="text-center md:text-right shrink-0">
              <div className={`text-4xl font-bold font-mono-money mb-1 ${
                isProfitable ? 'text-yes' : 'text-no'
              }`}>
                {formatMoney(agent.balance)}
              </div>
              <div className={`text-lg font-mono-money ${
                isProfitable ? 'text-yes' : 'text-no'
              }`}>
                {isProfitable ? '+' : ''}{roi.toFixed(1)}% ROI
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Started: {formatMoney(agent.startingBalance)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{agent.totalBets}</div>
            <div className="text-sm text-muted-foreground">Total Bets</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">
              <span className="text-yes">{agent.wins}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-no">{agent.losses}</span>
            </div>
            <div className="text-sm text-muted-foreground">W/L Record</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Progress 
                value={agent.winRate} 
                className="w-16 h-3 bg-no/30 [&>div]:bg-yes"
              />
              <span className="text-2xl font-bold">{agent.winRate}%</span>
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold font-mono-money ${
              isProfitable ? 'text-yes' : 'text-no'
            }`}>
              {isProfitable ? '+' : ''}{formatMoney(agent.balance - agent.startingBalance)}
            </div>
            <div className="text-sm text-muted-foreground">Net Profit</div>
          </CardContent>
        </Card>
      </div>

      {/* Bet History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Betting History</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All ({bets.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Pending ({pendingBets.length})
            </TabsTrigger>
            <TabsTrigger value="won" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Won ({wonBets.length})
            </TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Lost ({lostBets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <BetList bets={bets} />
          </TabsContent>
          <TabsContent value="pending">
            <BetList bets={pendingBets} />
          </TabsContent>
          <TabsContent value="won">
            <BetList bets={wonBets} />
          </TabsContent>
          <TabsContent value="lost">
            <BetList bets={lostBets} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Performance Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Position Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">YES bets</span>
                  <span className="font-mono-money">{bets.filter(b => b.position === 'YES').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">NO bets</span>
                  <span className="font-mono-money">{bets.filter(b => b.position === 'NO').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg bet size</span>
                  <span className="font-mono-money">
                    {formatMoney(bets.reduce((sum, b) => sum + b.amount, 0) / (bets.length || 1))}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Strategy Style</h4>
              <div className="space-y-2">
                {agent.winRate >= 60 && (
                  <Badge variant="outline" className="mr-2">🎯 Accurate</Badge>
                )}
                {agent.totalBets >= 50 && (
                  <Badge variant="outline" className="mr-2">📈 High Volume</Badge>
                )}
                {agent.totalBets < 30 && agent.winRate >= 65 && (
                  <Badge variant="outline" className="mr-2">🛡️ Conservative</Badge>
                )}
                {bets.some(b => b.odds < 30) && (
                  <Badge variant="outline" className="mr-2">🎰 Risk Taker</Badge>
                )}
                {agent.streak >= 3 && (
                  <Badge variant="outline" className="mr-2">🔥 Hot Streak</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {agent.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BetList({ bets }: { bets: ReturnType<typeof getBetsByAgent> }) {
  if (bets.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center text-muted-foreground">
          No bets in this category.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bets.map((bet) => (
        <Link key={bet.id} href={`/events/${bet.eventId}`}>
          <Card className="border-border/50 hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge 
                      variant="outline" 
                      className={bet.position === 'YES' 
                        ? 'border-yes text-yes bg-yes/10' 
                        : 'border-no text-no bg-no/10'
                      }
                    >
                      {bet.position}
                    </Badge>
                    <span className="font-mono-money font-bold">
                      {formatMoney(bet.amount)}
                    </span>
                    <span className="text-muted-foreground">@</span>
                    <span className="font-mono-money">{bet.odds}%</span>
                  </div>
                  <h4 className="font-medium line-clamp-1">{bet.eventTitle}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    &quot;{bet.reasoning}&quot;
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {bet.outcome === 'pending' ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline"
                      className={bet.outcome === 'won' 
                        ? 'bg-yes/20 text-yes border-yes' 
                        : 'bg-no/20 text-no border-no'
                      }
                    >
                      {bet.outcome === 'won' 
                        ? `+${formatMoney(bet.payout! - bet.amount)}` 
                        : `-${formatMoney(bet.amount)}`
                      }
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {timeAgo(bet.timestamp)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
