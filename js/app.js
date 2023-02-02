const tooltipContainer = document.getElementById('tooltip-container');
const tooltipWidth = 160;
const tooltipHeight = 80;
const tooltipDistanceConsonant = 20;
const tooltipDistanceRight = tooltipDistanceConsonant;
const tooltipDistanceLeft = -(tooltipWidth + tooltipDistanceConsonant);
const tooltipDistanceTop = -(tooltipHeight / 2);
const pagePadding = 20;

const setHorizontalDistance = (x) => {
  const { width: clientWidth } = document.body.getBoundingClientRect();

  if (x + tooltipDistanceRight + tooltipWidth + pagePadding > clientWidth) {
    return tooltipDistanceLeft;
  }

  return tooltipDistanceRight;
};

const formatTooltipText = (date, gdp) => {
  const quarterMap = {
    0: 'Q1',
    3: 'Q2',
    6: 'Q3',
    9: 'Q4',
  };
  const dateObj = new Date(date);

  return `${dateObj.getFullYear()} ${
    quarterMap[dateObj.getMonth()]
  }<br />$${gdp} Billion`;
};

const drawTooltip = (event, data) => {
  const { clientX, clientY } = event;
  const distance = setHorizontalDistance(clientX);

  const tooltip = d3
    .create('div')
    .attr('id', 'tooltip')
    .attr('data-date', data[0])
    .attr('data-gdp', data[1])
    .style('top', `${clientY + tooltipDistanceTop}px`)
    .style('left', `${clientX + distance}px`)
    .join('p')
    .html(formatTooltipText(data[0], data[1]));

  tooltipContainer.appendChild(tooltip.node());
};

const updateTooltipLocation = (event) => {
  d3.select('#tooltip').style('top', `${event.clientY + tooltipDistanceTop}px`);
};

const removeTooltip = () => {
  tooltipContainer.innerHTML = '';
};

const drawChart = async () => {
  const { data: dataset } = await d3.json(
    'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'
  );

  const svgContainer = document.getElementById('svg-container');

  const { height: HEIGHT, width: WIDTH } = svgContainer.getBoundingClientRect();
  const TB_PADDING = 50;
  const LEFT_PADDING = 70;
  const RIGHT_PADDING = 40;

  const svg = d3.create('svg').attr('width', WIDTH).attr('height', HEIGHT);

  const dates = dataset.map((data) => new Date(data[0]));
  const minDate = d3.min(dates);
  const maxDate = d3.max(dates);
  maxDate.setMonth(maxDate.getMonth() + 3);

  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([LEFT_PADDING, WIDTH - RIGHT_PADDING]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (data) => data[1])])
    .range([HEIGHT - TB_PADDING, TB_PADDING]);

  const axisLeft = d3.axisLeft(yScale);
  const axisBottom = d3.axisBottom(xScale);

  const barWidth = (WIDTH - LEFT_PADDING + RIGHT_PADDING) / dataset.length;

  svg
    .selectAll('rect')
    .data(dataset)
    .join('rect')
    .attr('class', 'bar')
    .attr('data-date', (data) => data[0])
    .attr('data-gdp', (data) => data[1])
    .attr('width', barWidth)
    .attr('height', (data) => HEIGHT - TB_PADDING - yScale(data[1]))
    .attr('x', (data) => xScale(new Date(data[0])))
    .attr('y', (data) => yScale(data[1]))
    .attr('shape-rendering', 'crispEdges')
    .on('mouseover', (event, data) => drawTooltip(event, data))
    .on('mousemove', (event, data) => updateTooltipLocation(event, data))
    .on('mouseout', () => removeTooltip());

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${HEIGHT - TB_PADDING})`)
    .call(axisBottom);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${LEFT_PADDING}, 0)`)
    .call(axisLeft);

  svgContainer.appendChild(svg.node());
};

drawChart();
