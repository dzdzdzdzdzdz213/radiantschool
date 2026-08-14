import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FaqManager from './FaqManager';
import TeamManager from './TeamManager';
import SiteManager from './SiteManager';

export default function CmsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>
        <TabsContent value="faq"><FaqManager /></TabsContent>
        <TabsContent value="team"><TeamManager /></TabsContent>
        <TabsContent value="site"><SiteManager /></TabsContent>
      </Tabs>
    </div>
  );
}