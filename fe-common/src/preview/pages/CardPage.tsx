import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ContentCard,
} from "../../components/ui/card";
import { Settings, MoreHorizontal, TrendingUp } from "lucide-react";

export function CardPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Card</h1>
        <p className="text-sm text-(--text-secondary)">Surface container with header, content, and footer slots.</p>
      </div>

      {/* Basic Card */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Basic Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-(--text-secondary)">Accuracy improved by 3.2% over the previous cycle with the latest fine-tuning run.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">View Report</Button>
          </CardFooter>
        </Card>
      </section>

      {/* ContentCard — composite */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">ContentCard (Composite)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <ContentCard header="Training Jobs" subHeader="Active pipeline">
            <p className="text-sm text-(--text-secondary)">3 jobs running, 12 queued.</p>
          </ContentCard>

          <ContentCard
            header="Dataset Registry"
            subHeader="Version 2.1.0"
            action={<Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>}
          >
            <p className="text-sm text-(--text-secondary)">42 datasets indexed across 6 projects.</p>
          </ContentCard>

          <ContentCard
            header={
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-(--primary-main)" />
                <CardTitle>Metrics</CardTitle>
              </div>
            }
          >
            <p className="text-sm text-(--text-secondary)">Custom header slot with icon.</p>
          </ContentCard>

          <ContentCard
            header="Configuration"
            action={<Button variant="ghost" size="icon"><Settings size={16} /></Button>}
            contentClassName="pt-0"
          >
            <ul className="text-sm text-(--text-secondary) space-y-1">
              <li className="flex justify-between"><span>Batch size</span><span className="font-mono">32</span></li>
              <li className="flex justify-between"><span>Epochs</span><span className="font-mono">50</span></li>
              <li className="flex justify-between"><span>LR</span><span className="font-mono">0.001</span></li>
            </ul>
          </ContentCard>
        </div>
      </section>

      {/* Card without header */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Without Header</h2>
        <ContentCard className="max-w-sm">
          <p className="text-sm text-(--text-secondary)">Cards can render without a header for simple content panels.</p>
        </ContentCard>
      </section>
    </div>
  );
}
