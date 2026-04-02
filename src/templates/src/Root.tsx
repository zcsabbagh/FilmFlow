import { Composition } from "remotion";
import { useEffect } from "react";
import { tokens } from "./tokens";
import { loadFonts } from "./fonts";
import { HorizontalTimeline } from "./components/HorizontalTimeline";
import { DataTable } from "./components/DataTable";
import { RankingList } from "./components/RankingList";
import { ScatterPlot } from "./components/ScatterPlot";
import { PieChart } from "./components/PieChart";
import { NumberTicker } from "./components/NumberTicker";
import { SplitScreen } from "./components/SplitScreen";
import { FlowDiagram } from "./components/FlowDiagram";

const Placeholder: React.FC = () => {
  useEffect(() => { loadFonts(); }, []);

  return (
    <div
      style={{
        width: tokens.layout.width,
        height: tokens.layout.height,
        backgroundColor: tokens.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: tokens.colors.text,
        fontFamily: tokens.fonts.heading,
        fontSize: 48,
      }}
    >
      FilmFlow — No scenes added yet
    </div>
  );
};

const TestHorizontalTimeline: React.FC = () => {
  useEffect(() => { loadFonts(); }, []);
  return (
    <HorizontalTimeline
      title="Key Milestones in U.S. Housing Policy"
      events={[
        { date: "1934", title: "FHA Created", description: "Federal Housing Administration", highlight: true },
        { date: "1968", title: "Fair Housing Act" },
        { date: "1977", title: "CRA Enacted", description: "Community Reinvestment Act" },
        { date: "2008", title: "Housing Crisis", highlight: true },
        { date: "2010", title: "Dodd-Frank", description: "Financial reform" },
      ]}
      source="Congressional Research Service"
    />
  );
};

const TestDataTable: React.FC = () => {
  useEffect(() => { loadFonts(); }, []);
  return (
    <DataTable
      title="Median Home Prices by Metro Area"
      headers={["Metro Area", "2020", "2023", "Change"]}
      rows={[
        ["San Francisco", 1250000, 1180000, "-5.6%"],
        ["New York", 680000, 750000, "+10.3%"],
        ["Austin", 385000, 440000, "+14.3%"],
        ["Chicago", 275000, 310000, "+12.7%"],
        ["Miami", 350000, 520000, "+48.6%"],
        ["Denver", 450000, 530000, "+17.8%"],
        ["Seattle", 620000, 680000, "+9.7%"],
      ]}
      highlightRows={[0, 4]}
      source="National Association of Realtors"
    />
  );
};

const TestNumberTicker: React.FC = () => (
  <NumberTicker
    value={1284500}
    label="Average home price in San Francisco, 2024"
    title="The Bay Area Housing Market"
    source="Zillow Research"
    prefix="$"
    digitDelay={8}
  />
);

const TestSplitScreen: React.FC = () => (
  <SplitScreen
    left={{
      title: "Renters",
      content: "44%",
      subtitle: "of households rent their home",
      color: "#2c3e50",
    }}
    right={{
      title: "Owners",
      content: "56%",
      subtitle: "of households own their home",
      color: tokens.colors.background,
    }}
    title="U.S. Housing Tenure, 2023"
    source="U.S. Census Bureau"
  />
);

const TestFlowDiagram: React.FC = () => (
  <FlowDiagram
    title="How a Mortgage Gets Approved"
    steps={[
      { label: "Apply", description: "Submit documents", icon: "📋" },
      { label: "Underwrite", description: "Risk assessment", icon: "🔍" },
      { label: "Appraise", description: "Value the home", icon: "🏠" },
      { label: "Close", description: "Sign & fund", icon: "✅" },
    ]}
    source="Consumer Financial Protection Bureau"
    direction="horizontal"
  />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Root"
        component={Placeholder}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestHorizontalTimeline"
        component={TestHorizontalTimeline}
        durationInFrames={120}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestDataTable"
        component={TestDataTable}
        durationInFrames={120}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestRankingList"
        component={TestRankingList}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestScatterPlot"
        component={TestScatterPlot}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestPieChart"
        component={TestPieChart}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestNumberTicker"
        component={TestNumberTicker}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestSplitScreen"
        component={TestSplitScreen}
        durationInFrames={120}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
      <Composition
        id="TestFlowDiagram"
        component={TestFlowDiagram}
        durationInFrames={150}
        fps={30}
        width={tokens.layout.width}
        height={tokens.layout.height}
      />
    </>
  );
};
