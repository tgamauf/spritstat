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
  Title,
  Tooltip,
} from "chart.js";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {useGetStationsQuery, useLazyGetPriceStationFrequencyQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

const BAR_CHART_CONTAINER_NAME = "bar-chart";
const BAR_COLOR = "#88B04B";
const BAR_LOWER_BOUND_FRACTION = 0.999;

interface ChartDataProps {
  labels: string[];
  data: number[];
}

class ChartData {
  public labels: string[];
  public datasets: {
    label: "Häufigkeit günstigste Tankstelle";
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];

  constructor(props?: ChartDataProps) {
    this.labels = [];
    this.datasets = [
      {
        label: "Häufigkeit günstigste Tankstelle",
        data: [],
        backgroundColor: BAR_COLOR,
        borderColor: BAR_COLOR
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
    //  the scale. We ignore 0 as this isn't a valid value, but is added if no
    //  value is available for a day.
    const minValue = Math.min(...data.datasets[0].data.filter(
      (value) => value > 0)
    );
    this.options = {
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      maintainAspectRatio: !isMobile,
      aspectRatio: isMobile ? 1 : 2,
      normalized: true,
      plugins: {
        title: {
          display: true,
          text: "Häufigkeit niedrigster Preis pro Tankstelle"
        }
      },
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

export default function PriceStationFrequencyChart({location, setErrorMessage}: Props) {
  const {
    data: stations,
    error: stationsError,
    isError: isStationsError,
    isFetching: isStationsFetching,
    isSuccess: isStationsSuccess
 } = useGetStationsQuery();
  const [
    getPriceStationFrequency,
    {
      data: stationFrequencyData,
      isFetching: isStationFrequencyFetching,
      isSuccess: isStationFrequencySuccess
    }
  ] = useLazyGetPriceStationFrequencyQuery();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${BAR_CHART_CONTAINER_NAME}-${location.id}`;
  const [selectedDateRange, setSelectedDateRange] = useState(
    DateRange.OneMonth
  );
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    getPriceStationFrequency({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .catch((e) => {
        console.error(`[${name}] failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(
          "Die Preise für diesen Ort konnten nicht abgerufen werden, bitte " +
          "probier es nochmal."
        );
      });
  }, [location, selectedDateRange, isStationsSuccess]);

  useEffect(() => {
    if (isStationsError) {
      console.error(`Failed to get stations: ${
        JSON.stringify(stationsError, null, 2)}`);
   }
 }, [isStationsError]);

  useEffect(() => {
    if (
      !isStationsFetching && isStationsSuccess && stations &&
      !isStationFrequencyFetching && isStationFrequencySuccess && stationFrequencyData
    ) {
      const labels = stationFrequencyData.stationIds.map((id) => {
        let stationName = stations[id].name;
        if (typeof stationName === "undefined") {
          console.error(`Station id ${id} not found in stations ${JSON.stringify(stations, null, 2)}`);
          stationName = String(id);
        }

        return stationName;
      });

      setChartData(new ChartData({labels, data: stationFrequencyData.data}));
    }
  }, [isStationsFetching, isStationFrequencyFetching]);

  useEffect(() => {
    if (isStationsFetching || isStationFrequencyFetching || !chartData) {
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
  if (!isStationsFetching && !isStationFrequencyFetching && chartData) {
    if (chartData.datasets[0].data.length === 0) {
      mainComponent = (
        <span>
          Die Aufzeichnung hat gerade erst begonnen, daher sind noch keine Daten
          vorhanden.
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
