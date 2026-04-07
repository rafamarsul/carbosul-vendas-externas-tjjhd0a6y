import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Team from './Team'
import Zones from './Zones'

export default function Management() {
  return (
    <div className="p-4 md:p-6 space-y-6 flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          Gerenciamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Administração de equipe de vendas e zonas de atuação.
        </p>
      </div>

      <Tabs defaultValue="salespeople" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
          <TabsTrigger
            value="salespeople"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 md:px-6 py-3"
          >
            Vendedores
          </TabsTrigger>
          <TabsTrigger
            value="zones"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 md:px-6 py-3"
          >
            Zonas de Atuação
          </TabsTrigger>
        </TabsList>
        <TabsContent value="salespeople" className="flex-1 overflow-auto mt-6 pb-20 md:pb-0">
          <Team />
        </TabsContent>
        <TabsContent value="zones" className="flex-1 overflow-auto mt-6 pb-20 md:pb-0">
          <Zones />
        </TabsContent>
      </Tabs>
    </div>
  )
}
