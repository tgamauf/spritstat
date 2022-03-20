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
import {IntlShape, useIntl} from "react-intl";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {useGetStationsQuery, useLazyGetPriceHistoryDataQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";
import {useGetCurrentPriceQuery} from "./priceApiSlice";
import NoGraphDataField from "../../common/components/NoGraphDataField";
import moment from "moment-timezone";
import {TIMEZONE} from "../../common/constants";

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
  intl: IntlShape;
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

  constructor({intl, labels, data, stationsMap}: ChartDataProps) {
    this.labels = labels;
    this.datasets = [
      {
        label: intl.formatMessage({
          description: "PriceHistoryChart tooltip label",
          defaultMessage: "Geringster Preis"
        }),
        borderColor: "#88B04B",
        data,
        stationsMap
      },
    ];
  }
}

type TooltipFooterCallback = (items: TooltipItem<"line">[]) => string | string[];

class ChartConfig implements ChartConfiguration {
  // If only a few data points exist in the dataset show the points itself and
  //  not only the line
  private static readonly POINT_SHOW_LIMIT = 20;
  private intl: IntlShape;

  public type: ChartType = "line";
  public options: ChartOptions<"line">;
  public data: ChartData;

  constructor(
    isMobile: boolean,
    isInteractive: boolean,
    intl: IntlShape,
    tooltipFooterCallback: TooltipFooterCallback,
    data: ChartData
  ) {
    let pointRadius = 0;
    if (data.labels.length < ChartConfig.POINT_SHOW_LIMIT) {
      pointRadius = 3;
    }

    this.intl = intl;
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
          text: intl.formatMessage({
            description: "PriceHistoryChart title",
            defaultMessage: "Geringster Preis"
          })
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const date = this.intl.formatDate(items[0].label);
              const time = this.intl.formatTime(items[0].label);
              return `${date} ${time}`;
            },
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
      scales: {
        x: {
          ticks: {
            callback: (_, index) => {
              const label = this.data.labels[index];
              const date = this.intl.formatDate(label);
              const time = this.intl.formatTime(label);
              return `${date} ${time}`;
            }
          }
        }
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
  const intl = useIntl();

  useEffect(() => {
    getPriceData({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .then((data) => {
        let finalData;
        if (isSuccess && currentPriceData) {
          // Add current datapoint
          finalData = {
            labels: [...data.labels, moment.tz(TIMEZONE).toISOString()],
            data: [...data.data, currentPriceData.amount],
            // There is a small chance that one of the stations hasn't been seen
            //  yet, which would mean that it wouldn't be shown in the tooltip. We
            //  are going to live with this issue.
            stationsMap: [...data.stationsMap, currentPriceData.stations.map((item) => item.id)]
          }
        } else {
          finalData = data;
        }
        setChartData(new ChartData({intl, ...finalData}));
      })
      .catch((e) => {
        console.error(`Failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(intl.formatMessage({
          description: "PriceHistoryChart error",
          defaultMessage: "Die Preise für diesen Ort konnten nicht abgerufen werden, " +
            "bitte probier es nochmal."
        }));
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
    const dataset = items[0].dataset as unknown as { stationsMap: number[][] }
    const stationIds = dataset.stationsMap[dataIndex];

    const stationNames = [];
    if (stationIds.length > 0) {
      // Only show the header if there is at least one station
      stationNames.push(intl.formatMessage({
        description: "AveragePriceChart stations title",
        defaultMessage: "Tankstellen:"
      }));
      for (const id of stationIds) {
        const station = stations[id];
        if (typeof station === "undefined") {
          continue;
        }

        stationNames.push(`\t- ${station.name}`);
      }
    }

    return stationNames;
  }, [isStationsFetching, intl])

  useEffect(() => {
    if (isPriceFetching || !chartData) {
      return;
    }

    const chartCanvas = canvasRef.current?.getContext("2d");
    if (!chartCanvas) {
      return;
    }

    chartRef.current?.destroy();
    const config = new ChartConfig(isMobile, isInteractive, intl, getStation, chartData);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
  }, [chartData, isMobile, intl]);

  let mainComponent;
  if (!isPriceFetching && chartData) {
    if (chartData.labels.length === 0) {
      mainComponent = <NoGraphDataField/>;
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
    mainComponent = <Spinner/>;
  }

  return mainComponent;
}

export {BTN_CHART_HISTORY_DATE_RANGE_ID};
