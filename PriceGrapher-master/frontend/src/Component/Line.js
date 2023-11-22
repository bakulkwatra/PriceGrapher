import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


const Line = ({newData}) => {
    const data = Object.values(newData)
    const svgRef = useRef(null);

    useEffect(() => {

        if(!data || data.length === 0) return;

        d3.select(svgRef.current).selectAll('svg').remove();

        const margin = {top: 20, right: 20, bottom: 30, left: 50}
        const width = svgRef.current.clientWidth - margin.left - margin.right
        const height = 500 - margin.top - margin.bottom
        const widthRange = data.length * 75

        const toolTip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip');
        
        const svg = d3.select(svgRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height + margin.top + margin.bottom)

        const g = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        
        const xScale = d3.scaleTime()
                        .range([0, widthRange])


        const yScale = d3.scaleLinear()
                        .range([0, height])

        const x = d3.scaleBand()
            .range([0,widthRange])
            .domain(data.map((d) => d.date));


        const y = d3.scaleLinear()
            .range([0, height])
            .domain([d3.min(data, (d) => d.low), d3.max(data, (d) => d.high)]);


        const xAxis = d3.axisBottom(x).tickSizeOuter(0);
        const yAxis = d3.axisLeft(y).tickSizeOuter(0);

        g.append('g').attr('transform', `translate(0,${height})`)
            .call(xAxis
                .ticks(d3.timeMonth.every(6))
                .tickFormat(d3.timeFormat("%d %b %Y")))
            .attr('dx', '10em')
            .style('font-size', '12px')
            .style('text-anchor', 'center')
            .style('margin', '20px')
            .attr('overflow', 'scroll')
            .style('color', 'white');
        
        g.append('g')
        .call(yAxis)
        .style('color', 'white');

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.close));

        const line2 = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.open));

        const line3 = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.high));
        
        const line4 = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.low));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", line2);
        
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr("d", line3);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", 1.5)
            .attr("d", line4);

        g.selectAll('xGrid')
            .data(xScale.ticks().slice(1))
            .join('line')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', "red")
            .attr('stroke-width', .5);
            
        g.selectAll('yGrid')
            .data(yScale.ticks().slice(1))
            .join('line')
            .attr('x1', 0)
            .attr('x2', widthRange)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', "green")
            .attr('stroke-width', .5);

        const circle = g.append('circle')
                        .attr('r', 0)
                        .attr('fill', 'steelblue')
                        .style('stroke', 'white')
                        .attr('opacity', .70)
                        .style('pointer-events', 'none');

        const listeningReact = g.append('rect')
                                .attr('width', width)
                                .attr('height', height)
                                .attr('opacity', 0);

        listeningReact.on('mousemove', function (event) {
            const [xCoord] = d3.pointer(event, this);
            const bisectDate = d3.bisector(d => d.date).left;
            const x0 = xScale.invert(xCoord);
            const i = bisectDate(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            const xPos = xScale(d.date);
            const yPos = yScale(d.close);

            circle.attr("cx", xPos)
                .attr("cy", yPos);
                
            console.log(xPos)
                
            circle.transition()
                .duration(50)
                .attr('r', 5);
        
            toolTip
                .style('display', 'block')
                .style('left', `${xPos + 100}px`)
                .style('top', `${yPos + 50}px`)
                .html(`<strong>Date:</strong> ${d.date}<br><strong>open:</strong> ${d.close}`)
        
        })

        svg.append("circle").attr("cx",1000).attr("cy",30).attr("r", 6).style("fill", "green")
        svg.append("circle").attr("cx",1000).attr("cy",50).attr("r", 6).style("fill", "red")
        svg.append("circle").attr("cx",1000).attr("cy",70).attr("r", 6).style("fill", "orange")
        svg.append("circle").attr("cx",1000).attr("cy",90).attr("r", 6).style("fill", "yellow")
        svg.append("text").attr("x", 1020).attr("y", 35).text("open").style("font-size", "15px").style("fill", "white").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 1020).attr("y", 55).text("close").style("font-size", "15px").style("fill", "white").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 1020).attr("y", 75).text("high").style("font-size", "15px").style("fill", "white").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 1020).attr("y", 95).text("low").style("font-size", "15px").style("fill", "white").attr("alignment-baseline","middle")
        
    }, [data])

    return (
        <div ref={svgRef} style={{width: "auto", overflow:'scroll'}}></div>
    );
}

export default Line;