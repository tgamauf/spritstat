import React, {useCallback, useEffect, useRef, useState} from "react";
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
  Tooltip,
  TooltipItem,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {useLazyGetPriceChartDataQuery, useGetStationsQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  zoomPlugin
);

const LINE_CHART_CONTAINER_NAME = "line-chart";

interface ChartDataProps {
  labels: string[];
  data: number[];
  stationsMap: number[][];
}

class ChartData {
  labels: string[];
  datasets: {
    label: "Geringster Preis";
    borderColor: string;
    data: number[];
    stationsMap: number[][];
 }[];

  constructor(props?: ChartDataProps) {
    this.labels = [];
    this.datasets = [
      {
        label: "Geringster Preis",
        borderColor: "#88B04B",
        data: [],
        stationsMap: []
     },
    ];

    if (props) {
      this.labels = [...props.labels];
      this.datasets[0].data = [...props.data];
      this.datasets[0].stationsMap = [...props.stationsMap];
   }
 }
}

type TooltipFooterCallback = (items: TooltipItem<"line">[]) => string | string[];

class ChartConfig implements ChartConfiguration {
  // If only a few data points exist in the dataset show the points itself and
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
         },
          footerFont: {
            weight: "normal"
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
  location: Location;
  setErrorMessage: (msg: string) => void;
}

export default function LocationPriceLineChart({location, setErrorMessage}: Props) {
  const {
    data: stations,
    error: stationsError,
    isError: isStationsError,
    isFetching: isStationsFetching,
    isSuccess: isStationsSuccess
 } = useGetStationsQuery();
  const [
    getPriceData,
    {isFetching: isPriceFetching}
  ] = useLazyGetPriceChartDataQuery();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${LINE_CHART_CONTAINER_NAME}-${location.id}`;
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
    if (isStationsError) {
      console.error(`Failed to get stations: ${
        JSON.stringify(stationsError, null, 2)}`);
   }
 }, [isStationsError]);

  const getStation = useCallback((items: TooltipItem<"line">[]): string[] => {
    if (isStationsFetching || !isStationsSuccess || !stations) {
      return [];
   }

    // We should always only get a single item as we only have a single graph
    if (!items || (items.length > 1)) {
      console.error(`Invalid tooltip items received, length=${items.length}`);
   }

    const dataIndex = items[0].dataIndex;
    const dataset = items[0].dataset as unknown as {stationsMap: number[][]}
    const stationIds = dataset.stationsMap[dataIndex];

    const stationNames = [];
    if (stationIds.length > 0) {
      // Only show the header if there is at least one station
      stationNames.push("Tankstellen:");
      for (const id of stationIds) {
        const station = stations[id];
        if (typeof station === "undefined") {
          continue;
       }

        stationNames.push(`\t- ${station.name}`);
     }
   }

    return stationNames;
 }, [isStationsFetching])

  useEffect(() => {
    if (isPriceFetching || !chartData) {
      return;
   }

    const chartCanvas = canvasRef.current?.getContext("2d");
    if (!chartCanvas) {
      return;
   }

    chartRef.current?.destroy();
    const config = new ChartConfig(isMobile, chartData, getStation);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
 }, [chartData, isMobile]);

  let mainComponent;
  if (chartData) {
    if (chartData.labels.length === 0) {
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
            <canvas id={chartId} ref={canvasRef}/>
          </div>
          <DateRangeButton
            items={[
              {name: "1M", value: DateRange.OneMonth},
              {name: "6M", value: DateRange.SixMonths},
              {name: "Alles", value: DateRange.All},
            ]}
            setSelectedValue={setSelectedDateRange}
          />
        </div>
      );
   }
 } else {
    mainComponent = <Spinner />;
 }

  return mainComponent;
}

export type {Props as LocationPriceLineChartProps};

export {DateRange as LocationPriceLineChartDateRange};
