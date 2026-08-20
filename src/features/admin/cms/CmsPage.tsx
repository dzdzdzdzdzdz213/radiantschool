import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FaqManager from './FaqManager';
import TeamManager from './TeamManager';
import SiteManager from './SiteManager';
import SubjectManager from './SubjectManager';

export default function CmsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="subjects">
        <TabsList>
          <TabsTrigger value="subjects">Matières</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="site">Site</TabsTrigger>
        </TabsList>
        <TabsContent value="subjects"><SubjectManager /></TabsContent>
        <TabsContent value="faq"><FaqManager /></TabsContent>
        <TabsContent value="team"><TeamManager /></TabsContent>
        <TabsContent value="site"><SiteManager /></TabsContent>
      </Tabs>
    </div>
  );
}