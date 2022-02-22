import React, {useEffect, useRef, useState} from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartOptions,
  ChartType,
  LinearScale,
  Tooltip,
} from "chart.js";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {useLazyGetPriceDayOfWeekDataQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const BAR_CHART_CONTAINER_NAME = "bar-chart";
const BAR_COLORS = [
  "#fd7f6f",
  "#7eb0d5",
  "#b2e061",
  "#bd7ebe",
  "#ffb55a",
  "#ffee65",
  "#beb9db"
];
const BAR_LOWER_BOUND_FRACTION = 0.999;

interface ChartDataProps {
  labels: string[];
  data: number[];
}

class ChartData {
  public labels: string[];
  public datasets: {
    label: "Durchschnittlich geringster Preis";
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];

  constructor(props?: ChartDataProps) {
    this.labels = [];
    this.datasets = [
      {
        label: "Durchschnittlich geringster Preis",
        data: [],
        backgroundColor: BAR_COLORS,
        borderColor: BAR_COLORS
      },
    ];

    if (props) {
      this.labels = [...props.labels];
      this.datasets[0].data = [...props.data];
    }
  }
}

class ChartConfig implements ChartConfiguration {
  public type: ChartType = "bar";
  public options: ChartOptions<"bar">;
  public data: ChartData;

  constructor(isMobile: boolean, data: ChartData) {
    // As the difference between the weekdays isn't really all too significant
    //  we set the minimum so that the lowest bar is BAR_LOWER_BOUND_FRACTION of
    //  the scale.
    const minValue = Math.min(...data.datasets[0].data);
    this.options = {
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      maintainAspectRatio: !isMobile,
      aspectRatio: isMobile ? 1 : 2,
      normalized: true,
      scales: {
        y: {
          min: BAR_LOWER_BOUND_FRACTION * minValue
        }
      }
    };

    this.data = data;
  }
}

interface Props {
  location: Location;
  setErrorMessage: (msg: string) => void;
}

export default function PriceDayOfWeekChart({location, setErrorMessage}: Props) {
  const [getPriceData, {isFetching}] = useLazyGetPriceDayOfWeekDataQuery();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${BAR_CHART_CONTAINER_NAME}-${location.id}`;
  const [selectedDateRange, setSelectedDateRange] = useState(
    DateRange.OneMonth
  );
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    getPriceData({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .then((data) => {
        setChartData(new ChartData(data));
      })
      .catch((e) => {
        console.error(`Failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(
          "Die Preise für diesen Ort konnten nicht abgerufen werden, bitte " +
          "probier es nochmal."
        );
      });
  }, [location, selectedDateRange]);

  useEffect(() => {
    if (isFetching || !chartData) {
      return;
    }

    const chartCanvas = canvasRef.current?.getContext("2d");
    if (!chartCanvas) {
      return;
    }

    chartRef.current?.destroy();
    const config = new ChartConfig(isMobile, chartData);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
  }, [chartData, isMobile]);

  let mainComponent;
  if (!isFetching && chartData) {
    if (chartData.datasets[0].data.length === 0) {
      mainComponent = (
        <span>
          Die Aufzeichnung hat gerade erst begonnen, daher sind noch keine Daten
          vorhanden. In ein paar Stunden gibt es aber schon etwas zu sehen!
        </span>
      );
    } else {
      mainComponent = (
        <div className="chart-container">
          <div className="content">
            <canvas id={chartId} ref={canvasRef}/>
          </div>
          <DateRangeButton
            items={[
              {name: "1M", value: DateRange.OneMonth},
              {name: "3M", value: DateRange.ThreeMonths},
              {name: "6M", value: DateRange.SixMonths},
              {name: "Alles", value: DateRange.All},
            ]}
            selectedValue={selectedDateRange}
            setSelectedValue={setSelectedDateRange}
          />
        </div>
      );
    }
  } else {
    mainComponent = <Spinner/>;
  }

  return mainComponent;
}

export type {Props as PriceHistoryChartProps};

export {DateRange as PriceHistoryChartDateRange};
