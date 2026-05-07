import { useEffect, useState } from "react";

import TopBar from "./components/TopBar.jsx";
import HeatmapArea from "./components/HeatmapArea.jsx";
import YearlyCalendar from "./components/YearlyCalendar.jsx";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    function loadData() {
      fetch(`/data.json?updated=${Date.now()}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("The data JSON file could not be loaded.");
          }

          return response.json();
        })
        .then((nextData) => {
          if (isMounted) {
            setData(nextData);
            setError("");
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
          }
        });
    }

    loadData();
    const intervalId = window.setInterval(loadData, 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="relative flex flex-col gap-4 min-h-screen bg-stone-900 px-[12vw] py-20 text-neutral-100 select-none">
      <TopBar data={data} />
      <HeatmapArea data={data} />
      <YearlyCalendar />
      {error && (
        <p className="mt-4 rounded-md border border-red-800 bg-red-950 px-4 py-3 text-red-100">
          {error}
        </p>
      )}
    </main>
  );
}


export default App;
