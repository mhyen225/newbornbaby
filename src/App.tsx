import { useMemo, useState } from "react";

type Region = {
  name: string;
  values: number[];
};

const quarters = ["1분기", "2분기", "3분기", "4분기"];
const data: Region[] = [
  { name: "전국", values: [65258, 61116, 65219, 62748] },
  { name: "서울특별시", values: [11688, 10987, 11664, 11177] },
  { name: "전남광주통합특별시", values: [3888, 3621, 3905, 3800] },
  { name: "광주광역시", values: [1663, 1542, 1678, 1612] },
  { name: "전라남도", values: [2225, 2079, 2227, 2188] },
  { name: "부산광역시", values: [3573, 3353, 3575, 3509] },
  { name: "대구광역시", values: [2854, 2605, 2707, 2653] },
  { name: "인천광역시", values: [4222, 3943, 4339, 4077] },
  { name: "대전광역시", values: [1949, 1833, 1951, 1940] },
  { name: "울산광역시", values: [1430, 1348, 1410, 1386] },
  { name: "세종특별자치시", values: [784, 700, 732, 738] },
  { name: "경기도", values: [19545, 18270, 19638, 18856] },
  { name: "강원특별자치도", values: [1728, 1580, 1716, 1653] },
  { name: "충청북도", values: [2103, 2002, 2065, 2059] },
  { name: "충청남도", values: [2668, 2444, 2667, 2463] },
  { name: "전북특별자치도", values: [1812, 1685, 1794, 1754] },
  { name: "경상북도", values: [2664, 2572, 2743, 2438] },
  { name: "경상남도", values: [3493, 3391, 3487, 3431] },
  { name: "제주특별자치도", values: [857, 782, 826, 814] },
];

const regions = data.slice(1);
const colors = [
  "#286B5D", "#D88949", "#5D7EA8", "#A85D69", "#8C7A45", "#5D9282",
  "#8A6C9E", "#B6674D", "#647C55", "#486C8D", "#C08B3A", "#775E80",
  "#3E8576", "#986053", "#6C79A0", "#9A804E", "#4D7891", "#A35F78",
];
const fmt = new Intl.NumberFormat("ko-KR");

function points(values: number[], width: number, height: number, max: number, min = 0) {
  const padX = 18;
  const padY = 18;
  return values
    .map((value, index) => {
      const x = padX + (index * (width - padX * 2)) / (values.length - 1);
      const y = padY + ((max - value) * (height - padY * 2)) / (max - min || 1);
      return `${x},${y}`;
    })
    .join(" ");
}

function OverviewChart({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
  const width = 900;
  const height = 280;
  const max = Math.max(...regions.flatMap((region) => region.values)) * 1.08;
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="행정구역별 분기 출생아 수 추이">
        {[0, 1, 2, 3, 4].map((line) => {
          const y = 18 + (line * (height - 36)) / 4;
          return <line className="grid-line" key={line} x1="18" x2={width - 18} y1={y} y2={y} />;
        })}
        {regions.map((region, index) => (
          <polyline
            className={region.name === selected ? "series selected" : "series"}
            key={region.name}
            points={points(region.values, width, height, max)}
            stroke={colors[index]}
            onClick={() => onSelect(region.name)}
          />
        ))}
      </svg>
      <div className="axis-labels">
        {quarters.map((quarter) => <span key={quarter}>{quarter}</span>)}
      </div>
    </div>
  );
}

function DetailChart({ region }: { region: Region }) {
  const width = 620;
  const height = 250;
  const maxValue = Math.max(...region.values);
  const minValue = Math.min(...region.values);
  const range = Math.max(maxValue - minValue, maxValue * 0.08);
  const max = maxValue + range * 0.45;
  const min = Math.max(0, minValue - range * 0.45);
  const coords = region.values.map((value, index) => {
    const x = 18 + (index * (width - 36)) / 3;
    const y = 18 + ((max - value) * (height - 36)) / (max - min);
    return { x, y, value };
  });
  return (
    <div className="chart-wrap detail-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${region.name} 분기 출생아 수 변화`}>
        {[0, 1, 2, 3].map((line) => {
          const y = 24 + (line * (height - 48)) / 3;
          return <line className="grid-line" key={line} x1="24" x2={width - 24} y1={y} y2={y} />;
        })}
        <polyline className="detail-line" points={points(region.values, width, height, max, min)} />
        {coords.map(({ x, y, value }, index) => (
          <g key={quarters[index]}>
            <circle className="detail-dot-halo" cx={x} cy={y} r="9" />
            <circle className="detail-dot" cx={x} cy={y} r="4" />
            <text className="value-label" x={x} y={y - 16} textAnchor="middle">{fmt.format(value)}</text>
          </g>
        ))}
      </svg>
      <div className="axis-labels">
        {quarters.map((quarter) => <span key={quarter}>{quarter}</span>)}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedName, setSelectedName] = useState("경기도");
  const selected = data.find((region) => region.name === selectedName) ?? data[1];
  const ranked = useMemo(
    () => [...regions].sort((a, b) => b.values[3] - a.values[3]),
    [],
  );
  const national = data[0];
  const qChange = ((national.values[3] - national.values[2]) / national.values[2]) * 100;
  const topShare = (ranked[0].values[3] / national.values[3]) * 100;

  return (
    <main>
      <header className="hero">
        <div className="eyebrow"><span className="pulse" />2025 인구동향</div>
        <h1>대한민국 출생 동향</h1>
        <p>통계청 분기별 출생아 수로 살펴보는 지역의 변화</p>
        <div className="summary-grid">
          <div className="summary-item">
            <span>4분기 전국 출생아</span>
            <strong>{fmt.format(national.values[3])}<small>명</small></strong>
          </div>
          <div className="summary-item">
            <span>전 분기 대비</span>
            <strong className={qChange < 0 ? "down" : "up"}>{qChange.toFixed(1)}<small>%</small></strong>
          </div>
          <div className="summary-item">
            <span>출생아 수 1위</span>
            <strong>{ranked[0].name}</strong>
          </div>
          <div className="summary-item">
            <span>전국 대비 1위 비중</span>
            <strong>{topShare.toFixed(1)}<small>%</small></strong>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-heading">
          <div><span className="section-number">01</span><h2>지역별 분기 추이</h2></div>
          <p>선을 선택하면 해당 지역의 상세 변화를 볼 수 있습니다.</p>
        </div>
        <div className="panel overview-panel">
          <OverviewChart selected={selectedName} onSelect={setSelectedName} />
          <div className="legend">
            {regions.map((region, index) => (
              <button
                className={selectedName === region.name ? "legend-item active" : "legend-item"}
                key={region.name}
                onClick={() => setSelectedName(region.name)}
                type="button"
              >
                <i style={{ backgroundColor: colors[index] }} />
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="section-number">02</span><h2>선택 지역 변화</h2></div>
          <label className="select-label">
            <span>행정구역</span>
            <select value={selectedName} onChange={(event) => setSelectedName(event.target.value)}>
              {regions.map((region) => <option key={region.name}>{region.name}</option>)}
            </select>
          </label>
        </div>
        <div className="panel detail-panel">
          <div className="detail-copy">
            <span className="detail-kicker">2025년 4분기</span>
            <h3>{selected.name}</h3>
            <strong>{fmt.format(selected.values[3])}<small>명</small></strong>
            <p>
              1분기 대비{" "}
              <b className={selected.values[3] >= selected.values[0] ? "up" : "down"}>
                {(((selected.values[3] - selected.values[0]) / selected.values[0]) * 100).toFixed(1)}%
              </b>
            </p>
          </div>
          <DetailChart region={selected} />
        </div>
      </section>

      <section className="section ranking-section">
        <div className="section-heading">
          <div><span className="section-number">03</span><h2>4분기 지역 순위</h2></div>
          <p>전국 합계는 순위에서 제외했습니다.</p>
        </div>
        <div className="panel ranking-panel">
          {ranked.map((region, index) => {
            const percent = (region.values[3] / ranked[0].values[3]) * 100;
            return (
              <button
                className={region.name === selectedName ? "rank-row selected-rank" : "rank-row"}
                key={region.name}
                onClick={() => setSelectedName(region.name)}
                type="button"
              >
                <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="rank-name">{region.name}</span>
                <span className="bar-track"><i style={{ width: `${percent}%` }} /></span>
                <strong>{fmt.format(region.values[3])}<small>명</small></strong>
              </button>
            );
          })}
        </div>
      </section>

      <footer>출처: 통계청 인구동향조사 · 단위: 명 · 2025년 분기 자료</footer>
    </main>
  );
}
