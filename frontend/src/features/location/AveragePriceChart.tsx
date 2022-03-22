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
import {IntlShape, MessageDescriptor, useIntl} from "react-intl";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {PriceDayQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";
import NoGraphDataField from "../../common/components/NoGraphDataField";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

const BAR_CHART_CONTAINER_NAME = "bar-chart";
const BAR_COLOR = "#88B04B";
const BAR_LOWER_BOUND_FRACTION = 0.999;

interface ChartDataProps {
  intl: IntlShape;
  labels: string[];
  data: number[];
}

class ChartData {
  public labels: string[];
  public datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];

  constructor({intl, labels, data}: ChartDataProps) {
    this.labels = labels;
    this.datasets = [
      {
        label: intl.formatMessage({
          description: "AveragePriceChart tooltip label",
          defaultMessage: "Durchschnittlich geringster Preis"
        }),
        data,
        backgroundColor: BAR_COLOR,
        borderColor: BAR_COLOR
      },
    ];
  }
}

class ChartConfig implements ChartConfiguration {
  private intl: IntlShape;

  public type: ChartType = "bar";
  public options: ChartOptions<"bar">;
  public data: ChartData;

  constructor(name: MessageDescriptor, isMobile: boolean, intl: IntlShape, data: ChartData) {
    // As the difference between the weekdays isn't really all too significant
    //  we set the minimum so that the lowest bar is BAR_LOWER_BOUND_FRACTION of
    //  the scale. We ignore 0 as this isn't a valid value, but is added if no
    //  value is available for a day.
    const minValue = Math.min(...data.datasets[0].data.filter(
      (value) => value > 0)
    );
    this.intl = intl;
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
          text: intl.formatMessage(name)
        },
        tooltip: {
          callbacks: {
            // Remove reprinting of the label in the tooltip - we only have
            //  a few bars, so this is information that doesn't add anything
            title: () => "",
            label: (item) => {
              return this.intl.formatNumber(
                item.parsed.y,
                {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 3
                }
              )
            },
          },
        }
      },
      scales: {
        y: {
          min: BAR_LOWER_BOUND_FRACTION * minValue,
          ticks: {
            callback: (value) => {
              return this.intl.formatNumber(
                value as number,
                {style: "currency", currency: "EUR"}
              )
            }
          }
        }
      },
    };

    this.data = data;
  }
}

interface Props {
  name: MessageDescriptor;
  location: Location;
  queryHook: PriceDayQuery,
  dateRangeItems?: DateRange[];
  initialDateRange?: DateRange;
  setErrorMessage: (msg: string) => void;
}

export default function AveragePriceChart(
  {
    name,
    location,
    queryHook,
    dateRangeItems = [
      DateRange.OneMonth,
      DateRange.ThreeMonths,
      DateRange.SixMonths,
      DateRange.All
    ],
    initialDateRange = DateRange.OneMonth,
    setErrorMessage
  }: Props
) {
  const [getPriceData, {isFetching}] = queryHook();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${BAR_CHART_CONTAINER_NAME}-${location.id}`;
  const [selectedDateRange, setSelectedDateRange] = useState(initialDateRange);
  const [chartData, setChartData] = useState<ChartData>();
  const intl = useIntl();

  useEffect(() => {
    getPriceData({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .then((data) => {
        setChartData(new ChartData({intl, ...data}));
      })
      .catch((e) => {
        console.error(`[${name}] failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(intl.formatMessage({
          description: "AveragePriceChart error",
          defaultMessage: "Die Preise für diesen Ort konnten nicht abgerufen werden, " +
            "bitte probier es nochmal."
        }));
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
    const config = new ChartConfig(name, isMobile, intl, chartData);
    // @ts-ignore type incompatibility seems to be a fluke
    chartRef.current = new Chart(chartCanvas, config);
  }, [chartData, isMobile, intl]);

  let mainComponent;
  if (!isFetching && chartData) {
    if (chartData.datasets[0].data.length === 0) {
      mainComponent = <NoGraphDataField/>;
    } else {
      mainComponent = (
        <div className="chart-container">
          <div className="content">
            <canvas id={chartId} ref={canvasRef}/>
          </div>
          <DateRangeButton
            items={dateRangeItems}
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
