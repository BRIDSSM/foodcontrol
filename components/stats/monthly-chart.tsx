import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import type { MonthlyUtilization } from '@/features/stats/queries';

const PAD = { top: 20, right: 12, bottom: 28, left: 42 };
const CHART_H = 160;
const GRID_RATES = [0, 50, 100];

interface Props {
  data: MonthlyUtilization[];
  color: string;
  gridColor: string;
  labelColor: string;
}

export function MonthlyChart({ data, color, gridColor, labelColor }: Props) {
  const { width: screenW } = useWindowDimensions();
  const W = screenW - 64;
  const plotW = W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;
  const n = data.length;

  function xAt(i: number) {
    return PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  }

  function yAt(rate: number) {
    return PAD.top + (1 - rate / 100) * plotH;
  }

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.rate).toFixed(1)}`)
    .join(' ');

  return (
    <View>
      <Svg width={W} height={CHART_H}>
        {/* Grid lines */}
        {GRID_RATES.map((rate) => {
          const y = yAt(rate);
          return (
            <Line
              key={rate}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke={gridColor}
              strokeWidth={0.5}
              strokeDasharray={rate === 0 ? undefined : '3,3'}
            />
          );
        })}

        {/* Y axis labels */}
        {GRID_RATES.map((rate) => (
          <SvgText
            key={`yl-${rate}`}
            x={PAD.left - 14}
            y={yAt(rate) + 4}
            fontSize={9}
            fill={labelColor}
            textAnchor="end"
          >
            {`${rate}%`}
          </SvgText>
        ))}

        {/* Data line */}
        <Path
          d={pathD}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots + X labels */}
        {data.map((d, i) => {
          const x = xAt(i);
          const y = yAt(d.rate);
          return (
            <React.Fragment key={i}>
              <Circle
                cx={x}
                cy={y}
                r={4}
                fill={d.total > 0 ? color : 'transparent'}
                stroke={color}
                strokeWidth={1.5}
              />
              <SvgText x={x} y={CHART_H - 4} fontSize={9} fill={labelColor} textAnchor="middle">
                {d.month}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
