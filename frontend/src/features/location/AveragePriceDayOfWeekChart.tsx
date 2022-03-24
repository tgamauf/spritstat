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
import {defineMessage, IntlShape, MessageDescriptor, useIntl} from "react-intl";

import {DateRange, Location} from "../../common/types";
import Spinner from "../../common/components/Spinner";
import {useIsMobile} from "../../common/utils";
import {useLazyGetPriceDayOfWeekDataQuery} from "./locationApiSlice";
import DateRangeButton from "../../common/components/DateRangeButton";
import NoGraphDataField from "../../common/components/NoGraphDataField";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

const BAR_CHART_CONTAINER_NAME = "bar-chart";
const BAR_COLOR = "#88B04B";
const BAR_LOWER_BOUND_FRACTION = 0.999;
const DAY_OF_WEEK_MAPPING: {[key: string]: MessageDescriptor} = {
  0: defineMessage({
    description: "AveragePriceDayOfWeekChart Monday",
    defaultMessage: "Montag"
  }),
  1: defineMessage({
    description: "AveragePriceDayOfWeekChart Tuesday",
    defaultMessage: "Dienstag"
  }),
  2: defineMessage({
    description: "AveragePriceDayOfWeekChart Wednesday",
    defaultMessage: "Mittwoch"
  }),
  3: defineMessage({
    description: "AveragePriceDayOfWeekChart Thursday",
    defaultMessage: "Donnerstag"
  }),
  4: defineMessage({
    description: "AveragePriceDayOfWeekChart Friday",
    defaultMessage: "Freitag"
  }),
  5: defineMessage({
    description: "AveragePriceDayOfWeekChart Saturday",
    defaultMessage: "Samstag"
  }),
  6: defineMessage({
    description: "AveragePriceDayOfWeekChart Sunday",
    defaultMessage: "Sonntag"
  }),
}


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

  constructor(isMobile: boolean, intl: IntlShape, data: ChartData) {
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
          text: intl.formatMessage({
            description: "AveragePriceDayOfWeekChart graph title",
            defaultMessage: "Niedrigster Preis pro Wochentag"
          })
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
          footerFont: {
            weight: "normal"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            callback: (index) => {
              return this.intl.formatMessage(DAY_OF_WEEK_MAPPING[index]);
            }
          }
        },
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
  location: Location;
  setErrorMessage: (msg: string) => void;
}

export default function AveragePriceDayOfWeekChart({location, setErrorMessage}: Props) {
  const [getPriceData, {isFetching}] = useLazyGetPriceDayOfWeekDataQuery();
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const chartRef = useRef<Chart | null>();
  const isMobile = useIsMobile();
  const chartId = `${BAR_CHART_CONTAINER_NAME}-${location.id}`;
  const [selectedDateRange, setSelectedDateRange] = useState(DateRange.OneMonth);
  const [chartData, setChartData] = useState<ChartData>();
  const intl = useIntl();

  useEffect(() => {
    getPriceData({locationId: location.id, dateRange: selectedDateRange}).unwrap()
      .then((data) => {
        setChartData(new ChartData({intl, ...data}));
      })
      .catch((e) => {
        console.error(`Failed to get price data: ${JSON.stringify(e, null, 2)}`);
        setErrorMessage(intl.formatMessage({
          description: "AveragePriceDayOfWeekChart error",
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
    const config = new ChartConfig(isMobile, intl, chartData);
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
            items={[
              DateRange.OneMonth,
              DateRange.ThreeMonths,
              DateRange.SixMonths,
              DateRange.All,
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
