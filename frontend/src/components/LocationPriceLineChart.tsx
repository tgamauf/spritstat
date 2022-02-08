import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartOptions,
  ChartType,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip, TooltipItem,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

import {DateRange, Location, Price, Station, StationMap} from "../utils/types";
import {apiGetPrices} from "../services/api";
import Spinner from "./Spinner";
import moment from "moment-timezone";
import { useIsMobile } from "../utils/reponsiveness";
import {INVALID_STATION} from "../utils/constants";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  zoomPlugin
);

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const LINE_CHART_CONTAINER_NAME = "line-chart";

interface ChartDataProps {
  labels: string[];
  data: number[];
}

class ChartData {
  labels: string[];
  datasets: {
    label: "Günstister Preis";
    borderColor: string;
    hidden: boolean;
    data: number[];
  }[];

  constructor(props?: ChartDataProps) {
    this.labels = [];
    this.datasets = [
      {
        label: "Günstister Preis",
        borderColor: "#88B04B",
        hidden: false,
        data: [],
      },
    ];

    if (props) {
      this.labels = [...props.labels];
      this.datasets[0].data = [...props.data];
    }
  }
}

type TooltipFooterCallback = (items: TooltipItem<"line">[]) => string | string[];

class ChartConfig implements ChartConfiguration {
  // If only a few datapoints exist in the dataset show the points itself and
  //  not only the line
  private static readonly POINT_SHOW_LIMIT = 20;

  public type: ChartType = "line";
  public options: ChartOptions<"line">;
  public data: ChartData;

  constructor(
    isMobile: boolean,
    data: ChartData,
    tooltipFooterCallback: TooltipFooterCallback
  ) {
    let pointRadius = 0;
    if (data.labels.length < ChartConfig.POINT_SHOW_LIMIT) {
      pointRadius = 3;
    }

    this.options = {
      elements: {
        point: {
          radius: pointRadius,
        },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      maintainAspectRatio: !isMobile,
      aspectRatio: isMobile ? 1 : 2,
      normalized: true,
      plugins: {
        tooltip: {
          callbacks: {
            footer: tooltipFooterCallback,
          }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
          },
          zoom: {
            mode: "x",
            pinch: {
              enabled: true,
            },
            wheel: {
              enabled: true,
            },
          },
        },
      },
      spanGaps: true,
    };

    this.data = data;
  }
}

interface Props {
  id: string;
  location: Location;
  stations: StationMap;
  setErrorMessage: (msg: string) => void;
}

export default function LocationPriceLineChart({
  id,
  location,
  stations,
  setErrorMessage,
}: Props) {
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const dateRangeButton1m =
    useRef() as React.MutableRefObject<HTMLButtonElement>;
  const dateRangeButton6m =
    useRef() as React.MutableRefObject<HTMLButtonElement>;
  const dateRangeButtonAll =
    useRef() as React.MutableRefObject<HTMLButtonElement>;
  const isMobile = useIsMobile();
  const chartId = `${LINE_CHART_CONTAINER_NAME}-${id}`;
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState(
    DateRange.OneMonth
  );
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    setLoading(true);

    apiGetPrices(location.id, selectedDateRange)
      .then((prices) => {
        const labels = [];
        const data = [];
        for (const i in prices) {
          const entry = prices[i];
          labels.push(
            moment.tz(entry.datetime, TIMEZONE).format("DD.MM.YY HH:mm")
          );
          data.push(entry.min_amount);
        }
        const chartData_ = new ChartData({ labels, data });

        setChartData(chartData_);
      })
      .catch((e) => {
        console.error(`Failed to get price data: ${e}`);
        setErrorMessage(
          "Die Preise für diesen Ort konnten nicht abgerufen werden, bitte " +
            "probier es nochmal."
        );
      })
      .finally(() => {
        setLoading(false);
      });


  }, [selectedDateRange]);

  const getStation = useCallback((items: TooltipItem<"line">[]): string[] => {
    // TODO doesn't work yet -> no tooltip shown

    // We should always only get a single item as we only have a single graph
    const stationIds = (items[0].raw as Price).stations;
    const stationNames = [];
    for (const id of stationIds) {
      const station = stations[id];
      if (typeof station === "undefined") {
        continue;
      }

      stationNames.push(station.name);
    }

    return stationNames;
  }, [stations])

  const createChart = useCallback(() => {
    if (!chartData) {
      return;
    }

    const chartCanvas = canvasRef.current?.getContext("2d");
    if (!chartCanvas) {
      return;
    }

    const config = new ChartConfig(isMobile, chartData, getStation);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
  }, [loading, isMobile]);

  useEffect(() => {
    chartRef.current?.destroy();
    createChart();
  }, [loading, isMobile]);

  useLayoutEffect(() => {
    if (
      !dateRangeButton1m.current ||
      !dateRangeButton6m.current ||
      !dateRangeButtonAll.current
    ) {
      return;
    }

    const tokens = ["is-selected", "is-primary"];
    if (selectedDateRange == DateRange.OneMonth) {
      dateRangeButton1m.current.classList.add(...tokens);
      dateRangeButton6m.current.classList.remove(...tokens);
      dateRangeButtonAll.current.classList.remove(...tokens);
    } else if (selectedDateRange == DateRange.SixMonths) {
      dateRangeButton6m.current.classList.add(...tokens);
      dateRangeButton1m.current.classList.remove(...tokens);
      dateRangeButtonAll.current.classList.remove(...tokens);
    } else {
      dateRangeButtonAll.current.classList.add(...tokens);
      dateRangeButton1m.current.classList.remove(...tokens);
      dateRangeButton6m.current.classList.remove(...tokens);
    }
  }, [selectedDateRange, loading]);

  let mainComponent;
  if (loading || !chartData) {
    mainComponent = <Spinner />;
  } else if (chartData.labels.length === 0) {
    mainComponent = (
      <span>
        Die Aufzeichnung hat gerade erst begonnen, daher sind noch keine Daten
        vorhanden. In ein paar Stunden gibt es aber schon etwas zu sehen!
      </span>
    );
  } else {
    mainComponent = (
      <div>
        <div className="content">
          <canvas id={chartId} ref={canvasRef} />
        </div>
        <div className="buttons has-addons">
          <button
            className="button is-small is-selected is-primary"
            ref={dateRangeButton1m}
            onClick={() => setSelectedDateRange(DateRange.OneMonth)}
          >
            1M
          </button>
          <button
            className="button is-small"
            ref={dateRangeButton6m}
            onClick={() => setSelectedDateRange(DateRange.SixMonths)}
          >
            6M
          </button>
          <button
            className="button is-small"
            ref={dateRangeButtonAll}
            onClick={() => setSelectedDateRange(DateRange.All)}
          >
            Alles
          </button>
        </div>
      </div>
    );
  }

  return mainComponent;
}

export type { Props as LocationPriceLineChartProps };

export { DateRange as LocationPriceLineChartDateRange };
