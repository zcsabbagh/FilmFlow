import { Audio, staticFile } from "remotion";
import { StatCard } from "../components/StatCard";

export const Scene: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("audio/scene01-hook.mp3")} />
      <StatCard
        value={180000}
        label="homes eliminated in a single vote — September 18, 1978"
        caption="One-third of San Francisco's growth potential, erased overnight"
        source="SF Planning EIR"
      />
    </>
  );
};
