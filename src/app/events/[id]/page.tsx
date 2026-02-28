import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getEventById, getBetsByEvent, formatMoney, timeAgo } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = getEventById(id);
  
  if (!event) {
    notFound();
  }

  const bets = getBetsByEvent(id);
  const yesBets = bets.filter(b => b.position === 'YES');
  const noBets = bets.filter(b => b.position === 'NO');
  const daysLeft = Math.ceil((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary">{event.category}</Badge>
          {event.status === 'resolved' ? (
            <Badge 
              className={event.outcome === 'YES' 
                ? 'bg-yes/20 text-yes border-yes' 
                : 'bg-no/20 text-no border-no'
              }
              variant="outline"
            >
              Resolved: {event.outcome}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-primary text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1.5" />
              Open
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
        <p className="text-lg text-muted-foreground">{event.description}</p>
      </div>

      {/* Odds Card */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-6">
          {/* Big odds display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-6 rounded-xl bg-yes/10 border-2 ${event.outcome === 'YES' ? 'border-yes glow-yes' : 'border-yes/20'}`}>
              <div className="text-sm text-muted-foreground mb-1">YES</div>
              <div className="text-4xl font-bold font-mono-money text-yes">{event.yesOdds}%</div>
              <div className="text-sm text-muted-foreground mt-2">
                {event.yesBets} bets · {formatMoney(event.totalVolume * event.yesOdds / 100)}
              </div>
            </div>
            <div className={`p-6 rounded-xl bg-no/10 border-2 ${event.outcome === 'NO' ? 'border-no glow-no' : 'border-no/20'}`}>
              <div className="text-sm text-muted-foreground mb-1">NO</div>
              <div className="text-4xl font-bold font-mono-money text-no">{event.noOdds}%</div>
              <div className="text-sm text-muted-foreground mt-2">
                {event.noBets} bets · {formatMoney(event.totalVolume * event.noOdds / 100)}
              </div>
            </div>
          </div>

          {/* Probability bar */}
          <div className="relative h-4 rounded-full overflow-hidden bg-no/30 mb-4">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yes to-yes/80 rounded-full transition-all"
              style={{ width: `${event.yesOdds}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-mono-money">{formatMoney(event.totalVolume)}</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{event.yesBets + event.noBets}</div>
              <div className="text-sm text-muted-foreground">Total Bets</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {event.status === 'resolved' ? 'Closed' : daysLeft > 0 ? `${daysLeft}d` : '<1d'}
              </div>
              <div className="text-sm text-muted-foreground">
                {event.status === 'resolved' ? 'Status' : 'Time Left'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Bets */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Agent Bets & Reasoning</h2>
        
        {bets.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              No bets placed yet on this market.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <Card key={bet.id} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Link href={`/agents/${bet.agentId}`}>
                      <Avatar className="h-12 w-12 bg-secondary hover:ring-2 hover:ring-primary transition-all">
                        <AvatarFallback className="text-xl bg-transparent">
                          {bet.agentAvatar}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Link 
                          href={`/agents/${bet.agentId}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {bet.agentName}
                        </Link>
                        <Badge 
                          variant="outline" 
                          className={`${
                            bet.position === 'YES' 
                              ? 'border-yes text-yes bg-yes/10' 
                              : 'border-no text-no bg-no/10'
                          }`}
                        >
                          {bet.position} @ {bet.odds}%
                        </Badge>
                        <span className="font-mono-money font-bold">
                          {formatMoney(bet.amount)}
                        </span>
                        {bet.outcome && bet.outcome !== 'pending' && (
                          <Badge 
                            className={`${
                              bet.outcome === 'won' 
                                ? 'bg-yes/20 text-yes border-yes' 
                                : 'bg-no/20 text-no border-no'
                            }`}
                            variant="outline"
                          >
                            {bet.outcome === 'won' 
                              ? `Won +${formatMoney(bet.payout! - bet.amount)}` 
                              : `Lost -${formatMoney(bet.amount)}`
                            }
                          </Badge>
                        )}
                      </div>
                      
                      {/* Reasoning */}
                      <div className="bg-secondary/50 rounded-lg p-4 mt-3">
                        <div className="text-sm text-muted-foreground mb-2">Reasoning:</div>
                        <p className="text-sm leading-relaxed">{bet.reasoning}</p>
                      </div>

                      <div className="text-xs text-muted-foreground mt-3">
                        {timeAgo(bet.timestamp)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Position breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-yes/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yes" />
              YES Positions ({yesBets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yesBets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No YES bets yet</p>
            ) : (
              <div className="space-y-3">
                {yesBets.map((bet) => (
                  <Link key={bet.id} href={`/agents/${bet.agentId}`} className="flex items-center justify-between hover:bg-secondary/50 -mx-2 px-2 py-1 rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bet.agentAvatar}</span>
                      <span className="font-medium">{bet.agentName}</span>
                    </div>
                    <span className="font-mono-money text-yes">{formatMoney(bet.amount)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-no/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-no" />
              NO Positions ({noBets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noBets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No NO bets yet</p>
            ) : (
              <div className="space-y-3">
                {noBets.map((bet) => (
                  <Link key={bet.id} href={`/agents/${bet.agentId}`} className="flex items-center justify-between hover:bg-secondary/50 -mx-2 px-2 py-1 rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{bet.agentAvatar}</span>
                      <span className="font-medium">{bet.agentName}</span>
                    </div>
                    <span className="font-mono-money text-no">{formatMoney(bet.amount)}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
