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
  Title,
  Tooltip,
  TooltipItem,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import {t, Trans} from "@lingui/macro";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {formatDatetime, useIsMobile} from "../../common/utils";
import {useLazyGetPriceHistoryDataQuery, useGetStationsQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";
import {useGetCurrentPriceQuery} from "./priceApiSlice";
import NoGraphDataField from "../../common/components/NoGraphDataField";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  zoomPlugin
);

const CHART_CONTAINER_NAME = "line-chart";
const BTN_CHART_HISTORY_DATE_RANGE_ID = "btn-chart-history-date-range-id";

interface ChartDataProps {
  labels: string[];
  data: number[];
  stationsMap: number[][];
}

class ChartData {
  public labels: string[];
  public datasets: {
    label: string;
    borderColor: string;
    data: number[];
    stationsMap: number[][];
 }[];

  constructor(props?: ChartDataProps) {
    this.labels = [];
    this.datasets = [
      {
        label: t`Geringster Preis`,
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
    isInteractive: boolean,
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
        title: {
          display: isInteractive,
          text: t`Geringster Preis`
        },
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
            enabled: isInteractive,
            mode: "x",
         },
          zoom: {
            mode: "x",
            pinch: {
              enabled: isInteractive,
            },
            wheel: {
              enabled: isInteractive,
              modifierKey: "ctrl"
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
  isInteractive: boolean;
  setErrorMessage: (msg: string) => void;
}

export default function PriceHistoryChart(
  {location, isInteractive, setErrorMessage}: Props
) {
  const {data: currentPriceData, isSuccess} = useGetCurrentPriceQuery(location);
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
  ] = useLazyGetPriceHistoryDataQuery();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${CHART_CONTAINER_NAME}-${location.id}`;
  const [selectedDateRange, setSelectedDateRange] = useState(
    DateRange.OneMonth
  );
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    getPriceData({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .then((data) => {
        let finalData;
        if (isSuccess && currentPriceData) {
          finalData = {
            labels: [...data.labels, formatDatetime()],   // Add current timestamp
            data: [...data.data, currentPriceData.amount],
            // There is a small chance that one of the stations hasn't been seen
            //  yet, which would mean that it wouldn't be shown in the tooltip. We
            //  are going to live with this issue.
            stationsMap: [...data.stationsMap, currentPriceData.stations.map((item) => item.id)]
          }
        } else {
          finalData = data;
        }
        setChartData(new ChartData(finalData));
     })
      .catch((e) => {
        console.error(`Failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(
          t`Die Preise für diesen Ort konnten nicht abgerufen werden, bitte probier es nochmal.`
        );
     });
 }, [location, selectedDateRange, isSuccess]);

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
      stationNames.push(t`Tankstellen:`);
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
    const config = new ChartConfig(isMobile, isInteractive, chartData, getStation);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
 }, [chartData, isMobile]);

  let mainComponent;
  if (!isPriceFetching && chartData) {
    if (chartData.labels.length === 0) {
      mainComponent = <NoGraphDataField />;
   } else {
      mainComponent = (
        <div className="chart-container">
          <div className="content">
            <canvas id={chartId} ref={canvasRef}/>
          </div>
          {isInteractive && (
            <div className="is-inline-block" id={BTN_CHART_HISTORY_DATE_RANGE_ID}>
              <DateRangeButton
                items={[
                  DateRange.OneMonth,
                  DateRange.ThreeMonths,
                  DateRange.SixMonths,
                  DateRange.All
                ]}
                selectedValue={selectedDateRange}
                setSelectedValue={setSelectedDateRange}
              />
            </div>
          )}
        </div>
      );
   }
 } else {
    mainComponent = <Spinner />;
 }

  return mainComponent;
}

export {BTN_CHART_HISTORY_DATE_RANGE_ID};
