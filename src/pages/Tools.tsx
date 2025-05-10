
import { SEO } from "@/components/SEO";
import { ToolsIntro } from "@/components/tools/ToolsIntro";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { ToolsFAQ } from "@/components/tools/ToolsFAQ";
import { createToolsSchema } from "@/components/tools/ToolsSchema";
import { toolsData } from "@/data/toolsData";

export default function Tools() {
  // Get schema data
  const schemaData = createToolsSchema(toolsData);

  return (
    <>
      <SEO 
        title="Medication Interaction Tools & Resources | MedSafe Project"
        description="Compare and find the best drug interaction checkers and medication safety tools to help prevent adverse drug reactions and medication errors."
        keywords={["drug interaction checkers", "medication tools", "pill identifier", "medication reminder", "medication safety apps"]}
        schemaData={schemaData}
      />
      
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container-custom">
          <ToolsIntro />
          <ToolsGrid tools={toolsData} />
          <ToolsFAQ />
        </div>
      </div>
    </>
  );
}
