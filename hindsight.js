///////////////////////////////////////////////////////////////////////////////
//
// Hindsight - Simple HTML5 Canvas / Javascript Graphing
//
////////////////////////////////////////////////////////////////////////////////

function Hindsight(cv) {

    var self = this;
    self.version = "0.5.0";
    self.canvas = document.getElementById(cv);
    self.context = self.canvas.getContext("2d");

    ////////////////////////////////////////////////////////////

    self.Pie = function(data, options) {

        self.Pie.defaults = {
            stroke: "#ffffff",
            lineWidth: 2,
            radius: null, // Default to auto from width
            angle: 30,
            titleFont: "12pt Arial",
            titleColor: "#444444",
            titleStroke: "#eeeeee",
            legendFont: "8pt Arial",
            legendColor: "#000000",
            legendStroke: "#f8f8f8",
            legendPosition: "right", // or "bottom"
            legendValues: false,
            legendUnit: "",
            legend: true,
            ring: true,
            ringRadius: null, // Default to auto from radius
            ringColor: "#ffffff",
            center: false,
            duration: 1500,
            animateStyle: "grow", // "grow" or "sequential"
            animate: true
        };

        var config = combineOptions(self.Pie.defaults, options);

        var r = (config.radius) ? config.radius : x - 30;
        var y = (config.radius) ? (config.radius + 10) : Math.round(self.canvas.height / 2);
        var x = Math.round(self.canvas.width / 2);

        var dataMax = 0;
        for (var e = 0; e < data.dataset.length; e++) {
            dataMax += data.dataset[e].value;
        }

        var startAngle = config.angle * (Math.PI / 180);

        var legendStartY = (config.legendPosition === "right") ? y - r : y + r;
        var legendStartX = (config.legendPosition === "right") ? x + r + config.lineWidth + 24 : 20;

        var legendY = legendStartY;
        var legendX = legendStartX;

        // Graph Key
        for (i = 0; i < data.dataset.length; i++) {
            if (config.legend && data.dataset[i].value !== 0) {
                var lx = legendX;
                var ly = legendY + 20;
                var s = data.dataset[i].label;
                if (config.legendValues) {
                    s = data.dataset[i].label + ": " + data.dataset[i].value;
                    if (config.legendUnit.length) {
                        s += " " + config.legendUnit;
                        if (data.dataset[i].value > 1) {
                            s += "s";
                        }
                    }
                }
                self.context.fillStyle = data.dataset[i].color;
                self.context.strokeStyle = data.dataset[i].color;
                self.context.lineWidth = 2;
                self.context.beginPath();
                self.context.globalAlpha = 0.75;
                self.context.fillRect(lx - 10, ly - 9, 10, 10);
                self.context.globalAlpha = 1;
                self.context.strokeRect(lx - 10, ly - 9, 10, 10);
                self.context.closePath();
                self.context.font = config.legendFont;
                self.context.fillStyle = config.legendColor;
                self.context.strokeStyle = config.legendStroke;
                self.context.strokeText(s, lx + 6, ly);
                self.context.fillText(s, lx + 6, ly);
                legendY += 18;
            }
        }

        var startTime = -1;

        if (config.animate) {
            requestAnimationFrame(drawPie);
        } else {
            config.duration = -1;
            drawPie(0);
        }

        function drawPie(now) {
            if (startTime === -1) {
                startTime = now;
            }
            var elapsed = now - startTime;
            if (elapsed > config.duration) {
                elapsed = config.duration;
            }
            var perc = elapsed / config.duration;
            perc = Math.sqrt(perc);

            var lastEnd = startAngle;
            var cycleMax = Math.PI * 2 * perc;

            var done = 0;

            self.context.save();

            self.context.clearRect(x - r, y - r, r * 2, r * 2);

            for (var i = 0; !done && i < data.dataset.length; i++) {
                var gradient = self.context.createRadialGradient(x, y, r / 4, x, y, r * 5);
                gradient.addColorStop(0, data.dataset[i].color);
                gradient.addColorStop(1, config.stroke);
                self.context.fillStyle = gradient;
                self.context.strokeStyle = config.stroke;
                self.context.lineWidth = config.lineWidth;
                self.context.beginPath();
                self.context.moveTo(x, y);
                var vw = data.dataset[i].value / dataMax;
                var w = Math.PI * 2 * vw;
                var newEnd;
                if (config.style == "sequential") {
                    newEnd = lastEnd + w;
                    if ((newEnd - startAngle) > cycleMax) {
                        newEnd = cycleMax + startAngle;
                        done = 1;
                    }
                } else {
                    newEnd = lastEnd + (w * perc);
                }
                self.context.arc(x, y, r, lastEnd, newEnd, false);
                self.context.lineTo(x, y);
                self.context.fill();
                self.context.stroke();
                self.context.closePath();
                lastEnd = newEnd;
            }

            if (config.ring) {
                self.context.strokeStyle = config.stroke;
                self.context.fillStyle = config.ringColor;
                self.context.lineWidth = config.lineWidth;
                self.context.beginPath();
                rw = (config.ringRadius) ? config.ringRadius : r / 2;
                self.context.arc(x, y, rw, 0, Math.PI * 2);
                self.context.closePath();
                self.context.fill();
                self.context.stroke();
            }

            if (config.ring && config.center) {
                self.context.font = config.titleFont;
                self.context.fillStyle = config.titleColor;
                self.context.strokeStyle = config.titleStroke;
                var metrics = self.context.measureText(data.title);
                self.context.strokeText(data.title, x - (metrics.width / 2), y + 2);
                self.context.fillText(data.title, x - (metrics.width / 2), y + 2);
            } else {
                self.context.font = config.titleFont;
                self.context.fillStyle = config.titleColor;
                self.context.strokeStyle = config.titleStroke;
                self.context.strokeText(data.title, 10, y - (r - 4));
                self.context.fillText(data.title, 10, y - (r - 4));
            }

            self.context.restore();

            if (elapsed < config.duration) {
                requestAnimationFrame(drawPie);
            }
        }
    };

    ////////////////////////////////////////////////////////////

    self.Line = function(data, options) {

        self.Line.defaults = {
            gridColor: "rgb(248,248,248)",
            steps: 10,
            increment: null,
            lineWidth: 2,
            seperator: 1,
            titleFont: "12pt Arial",
            titleColor: "#444444",
            titleStroke: "#eeeeee",
            legendFont: "8pt Arial",
            legendColor: "#666666",
            legendStroke: "#f8f8f8",
            labels: true,
            grid: true,
            fill: true,
            curves: true,
            dots: true,
            legend: false,
            duration: 1500,
            animate: true
        };
        ////////////////////////////////////////////////////////////
        if (data.dataset.length > 1) {
            self.Line.defaults.legend = true;
        }

        var config = combineOptions(self.Line.defaults, options);

        var w = self.canvas.width - 25;
        var h = self.canvas.height - 40;
        var startX = 50;
        var startY = 50;

        var ticksY = config.steps;

        var dataMax = 0;
        var dataLength = 0;
        for (var j = 0; j < data.dataset.length; j++) {
            var datasetMax = Math.max.apply(Math, data.dataset[j].data);
            dataMax = Math.max(dataMax, datasetMax);
            dataLength = Math.max(data.dataset[j].data.length, dataLength);
        }
        dataMax *= 1.05; // Increase by 5%

        var graphHeight = h - startY;
        var graphWidth = w - startX;
        var GraphStepX = Math.floor(graphWidth / (dataLength - 1));
        var graphCurrentX = startX;

        var unit = 0;
        if (config.increment) {
            unit = config.increment;
        } else {
            unit = Math.round(dataMax / ticksY);
            if (unit < 1) {
                unit = 1;
            } else if (unit === 4 || unit === 6) {
                unit = 5;
            } else if (unit === 9 || unit === 11) {
                unit = 10;
            }
        }
        var unitIncrement = Math.round(graphHeight * (unit / dataMax));

        var diff = (graphHeight + startY) - unitIncrement;
        while (diff > startY) {
            diff -= unitIncrement;
        }
        diff = startY - diff;
        graphWidth = Math.min(graphWidth, (GraphStepX * (dataLength - 1)) + diff);

        var startTime = -1;

        if (config.animate) {
            requestAnimationFrame(drawLine);
        } else {
            config.duration = -1;
            drawLine(0);
        }

        function drawLine(now) {
            if (startTime === -1) {
                startTime = now;
            }
            var perc = 1;
            var elapsed = 0;
            if (config.animate) {
                elapsed = now - startTime;
                if (elapsed > config.duration) elapsed = config.duration;
                perc = elapsed / config.duration;
                perc = Math.sqrt(perc);
            }

            graphCurrentX = startX;

            self.context.save();

            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

            ////////////////////////////////////////
            // Title
            self.context.textBaseline = "alphabetic";
            self.context.textAlign = "start";
            self.context.font = config.titleFont;
            self.context.fillStyle = config.titleColor;
            self.context.strokeStyle = config.titleStroke;
            self.context.lineWidth = config.lineWidth;
            self.context.strokeText(data.title, 10, startY - 16);
            self.context.fillText(data.title, 10, startY - 16);

            ////////////////////////////////////////
            // Draw Grid and Labels
            if (config.grid) {
                self.context.strokeStyle = config.gridColor;
                self.context.lineWidth = config.lineWidth;
                self.context.moveTo(startX - 1, startY); // Position at top
                self.context.lineTo(startX - 1, startY + graphHeight);
                self.context.lineTo(startX + graphWidth, startY + graphHeight);
                self.context.stroke();
                // X-Axis Lines and Labels
                for (var e = 0; e < dataLength - 1; e++) {
                    graphCurrentX += GraphStepX;
                    self.context.moveTo(graphCurrentX, startY);
                    self.context.lineTo(graphCurrentX, graphHeight + startY);
                    self.context.stroke();
                }
            }
            if (config.labels) {
                self.context.font = config.legendFont;
                self.context.textBaseline = "top";
                self.context.textAlign = "left";
                self.context.fillStyle = config.legendColor;
                self.context.strokeStyle = config.legendStroke;
                graphCurrentX = startX - GraphStepX;
                self.context.beginPath();
                self.context.moveTo(startX, graphHeight);
                var labelInterval = 1;
                var m = self.context.measureText(data.labels[0]);
                if (m.width > GraphStepX) {
                    labelInterval = Math.ceil(m.width / GraphStepX);
                }
                for (var labelCount = 0, l = 0; l < dataLength; l++, labelCount++) {
                    graphCurrentX += GraphStepX;
                    if (labelCount % labelInterval === 0) {
                        var metrics = self.context.measureText(data.labels[l]);
                        self.context.strokeText(data.labels[l], graphCurrentX - (metrics.width / 2), graphHeight + startY + 5);
                        self.context.fillText(data.labels[l], graphCurrentX - (metrics.width / 2), graphHeight + startY + 5);
                    }
                }
                self.context.closePath();
            }

            // Y-Axis Lines and Labels
            var unitCurrent = unit;
            var incrementCurrent = (graphHeight + startY) - unitIncrement;
            while (incrementCurrent > startY) {
                if (config.grid) {
                    self.context.moveTo(startX - 1, incrementCurrent);
                    self.context.lineTo(graphWidth + startX, incrementCurrent);
                    self.context.stroke();
                }
                if (config.labels) {
                    self.context.font = config.legendFont;
                    self.context.textBaseline = "middle";
                    self.context.fillStyle = config.legendColor;
                    self.context.strokeStyle = config.legendStroke;
                    self.context.textAlign = "right";
                    self.context.strokeText(unitCurrent, (startX - 8), incrementCurrent);
                    self.context.fillText(unitCurrent, (startX - 8), incrementCurrent);
                }
                unitCurrent += unit;
                incrementCurrent -= unitIncrement;
            }

            ////////////////////////////////////////
            // Graph the Data
            var legendPreviousX = startX;
            for (q = 0; q < data.dataset.length; q++) {
                var values = data.dataset[q].data;
                var color = data.dataset[q].color;
                var fillColor = data.dataset[q].fill;
                var title = data.dataset[q].title;

                var dotColor = (data.dataset[q].dotColor) ? data.dataset[q].dotColor : color;
                var dotStroke = (data.dataset[q].dotStroke) ? data.dataset[q].dotStroke : "#fff";


                ////////////////////////////////////////
                // Shape under the Line
                var sx, sy, fx, fy, cdiff, i;
                var datum, dataHeight;
                graphCurrentX = startX - GraphStepX;
                self.context.strokeStyle = color;
                self.context.fillStyle = fillColor;
                if (config.fill) {
                    self.context.beginPath();
                    self.context.moveTo(startX, graphHeight + startY - 1);
                    sx = startX;
                    sy = graphHeight + startY - 1;
                    fx = 0;
                    fy = 0;
                    cdiff = Math.round(GraphStepX / 2);
                    for (i = 0; i < values.length; i++) {
                        datum = values[i] * perc;
                        dataHeight = graphHeight * (datum / dataMax);
                        graphCurrentX += GraphStepX;
                        fx = graphCurrentX;
                        fy = (graphHeight - dataHeight) + startY;
                        if (i === 0) {
                            self.context.lineTo(fx, fy);
                        } else {
                            if (config.curves) {
                                self.context.bezierCurveTo(sx + cdiff, sy, fx - cdiff, fy, fx, fy);
                            } else {
                                self.context.lineTo(fx, fy);
                            }
                        }
                        sx = fx;
                        sy = fy;
                    }
                    self.context.lineTo(graphCurrentX, graphHeight + startY - 1);
                    self.context.moveTo(startX, graphHeight + startY - 1);
                    self.context.closePath();
                    self.context.fill();
                }

                ////////////////////////////////////////
                // Line
                graphCurrentX = startX - GraphStepX;
                self.context.strokeStyle = color;
                self.context.beginPath();
                self.context.moveTo(startX, graphHeight);
                sx = startX;
                sy = graphHeight;
                cdiff = Math.round(GraphStepX / 2);
                for (i = 0; i < values.length; i++) {
                    datum = values[i] * perc;
                    dataHeight = graphHeight * (datum / dataMax);
                    graphCurrentX += GraphStepX;
                    if (i === 0) {
                        sx = graphCurrentX;
                        sy = (graphHeight - dataHeight) + startY;
                        self.context.moveTo(graphCurrentX, (graphHeight - dataHeight) + startY);
                    } else {
                        fx = graphCurrentX;
                        fy = (graphHeight - dataHeight) + startY;
                        if (config.curves) {
                            self.context.bezierCurveTo(sx + cdiff, sy, fx - cdiff, fy, fx, fy);
                        } else {
                            self.context.lineTo(fx, fy);
                        }
                        sx = fx;
                        sy = fy;
                    }
                }
                self.context.stroke();
                self.context.closePath();

                ////////////////////////////////////////
                // Dots
                if (config.dots) {
                    self.context.strokeStyle = dotStroke;
                    self.context.fillStyle = dotColor;
                    graphCurrentX = startX - GraphStepX;
                    for (var j = 0; j < values.length; j++) {
                        datum = values[j] * perc;
                        dataHeight = graphHeight * (datum / dataMax);
                        graphCurrentX += GraphStepX;
                        self.context.beginPath();
                        self.context.arc(graphCurrentX, (graphHeight - dataHeight) + startY, 4, 0, Math.PI * 2);
                        self.context.closePath();
                        self.context.fill();
                        self.context.stroke();
                    }
                }
                if (config.legend) {
                    var lx = legendPreviousX;
                    var ly = graphHeight + startY;
                    ly += (config.labels) ? 25 : 5;
                    self.context.strokeStyle = color;
                    self.context.fillStyle = fillColor;
                    self.context.fillRect(lx, ly, 10, 10);
                    self.context.strokeRect(lx, ly, 10, 10);
                    self.context.font = config.legendFont;
                    self.context.textBaseline = "top";
                    self.context.textAlign = "left";
                    self.context.fillStyle = config.legendColor;
                    self.context.strokeStyle = config.legendStroke;
                    var lm = self.context.measureText(title);
                    self.context.strokeText(title, lx + 15, ly);
                    self.context.fillText(title, lx + 15, ly);
                    legendPreviousX += 40 + lm.width;
                }
            }
            self.context.restore();

            if (config.animate && elapsed < config.duration) {
                requestAnimationFrame(drawLine);
            }
        }
    };

    ////////////////////////////////////////////////////////////

    self.Bar = function(data, options) {
        self.Bar.defaults = {
            gridColor: "rgb(248,248,248)",
            steps: 10,
            increment: null,
            lineWidth: 2,
            seperator: 1,
            padding: 0.15,
            titleFont: "12pt Arial",
            titleColor: "#444444",
            titleStroke: "#eeeeee",
            legendFont: "8pt Arial",
            legendColor: "#666666",
            legendStroke: "#f8f8f8",
            labels: true,
            grid: true,
            fill: true,
            legend: false,
            duration: 1500,
            animate: true
        };
        ////////////////////////////////////////////////////////////
        if (data.dataset.length > 1) {
            self.Bar.defaults.legend = true;
            self.Bar.defaults.padding = 0.10;
        }

        var config = combineOptions(self.Bar.defaults, options);

        var w = self.canvas.width - 25;
        var h = self.canvas.height - 40;
        var startX = 50;
        var startY = 50;

        var ticksY = config.steps;

        var dataMax = 0;
        var dataLength = 0;
        for (var j = 0; j < data.dataset.length; j++) {
            var datasetMax = Math.max.apply(Math, data.dataset[j].data);
            dataMax = Math.max(dataMax, datasetMax);
            dataLength = Math.max(data.dataset[j].data.length, dataLength);
        }
        dataMax *= 1.05; // Increase by 5%

        var graphHeight = h - startY;
        var graphWidth = w - startX;
        var GraphStepX = Math.floor(graphWidth / dataLength);
        var graphCurrentX = startX;

        var unit = 0;
        if (config.increment) {
            unit = config.increment;
        } else {
            unit = Math.round(dataMax / ticksY);
            if (unit < 1) {
                unit = 1;
            } else if (unit === 4 || unit === 6) {
                unit = 5;
            } else if (unit === 9 || unit === 11) {
                unit = 10;
            }
        }
        var unitIncrement = Math.round(graphHeight * (unit / dataMax));

        var diff = (graphHeight + startY) - unitIncrement;
        while (diff > startY) {
            diff -= unitIncrement;
        }
        diff = startY - diff;
        graphWidth = Math.min(graphWidth, (GraphStepX * dataLength) + diff);

        var startTime = -1;
        if (config.animate) {
            requestAnimationFrame(drawBar);
        } else {
            config.duration = -1;
            drawBar(0);
        }

        function drawBar(now) {
            if (startTime === -1) {
                startTime = now;
            }
            var elapsed = now - startTime;
            if (elapsed > config.duration) {
                elapsed = config.duration;
            }
            var perc = elapsed / config.duration;
            perc = Math.sqrt(perc);

            graphCurrentX = startX;

            self.context.save();

            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);


            ////////////////////////////////////////
            // Title
            self.context.font = config.titleFont;
            self.context.fillStyle = config.titleColor;
            self.context.strokeStyle = config.titleStroke;
            self.context.lineWidth = config.lineWidth;
            self.context.strokeText(data.title, 10, startY - 16);
            self.context.fillText(data.title, 10, startY - 16);

            ////////////////////////////////////////
            // Draw Grid
            if (config.grid) {
                self.context.strokeStyle = config.gridColor;
                self.context.lineWidth = config.lineWidth;
                self.context.moveTo(startX - 1, startY); // Position at top
                self.context.lineTo(startX - 1, startY + graphHeight);
                self.context.lineTo(startX + graphWidth, startY + graphHeight);
                self.context.stroke();

                // X-Axis Lines and Labels
                for (var e = 0; e < dataLength; e++) {
                    graphCurrentX += GraphStepX;
                    self.context.moveTo(graphCurrentX, startY);
                    self.context.lineTo(graphCurrentX, graphHeight + startY);
                    self.context.stroke();
                }
            }
            if (config.labels) {
                self.context.font = config.legendFont;
                self.context.textBaseline = "top";
                self.context.textAlign = "left";
                self.context.fillStyle = config.legendColor;
                self.context.strokeStyle = config.legendStroke;
                graphCurrentX = startX - GraphStepX;
                self.context.beginPath();
                self.context.moveTo(startX, graphHeight);
                var labelInterval = 1;
                var m = self.context.measureText(data.labels[0]);
                if (m.width > GraphStepX) {
                    labelInterval = Math.ceil(m.width / GraphStepX);
                }
                for (var labelCount = 0, i = 0; i < dataLength; i++, labelCount++) {
                    graphCurrentX += GraphStepX;
                    if (labelCount % labelInterval === 0) {
                        var metrics = self.context.measureText(data.labels[i]);
                        self.context.strokeText(data.labels[i], graphCurrentX, graphHeight + startY + 5);
                        self.context.fillText(data.labels[i], graphCurrentX, graphHeight + startY + 5);
                    }
                }
                self.context.closePath();
            }

            // Y-Axis Lines and Labels
            var unitCurrent = unit;
            var incrementCurrent = (graphHeight + startY) - unitIncrement;
            while (incrementCurrent > startY) {
                if (config.grid) {
                    self.context.moveTo(startX - 1, incrementCurrent);
                    self.context.lineTo(graphWidth + startX, incrementCurrent);
                    self.context.stroke();
                }
                if (config.labels) {
                    self.context.font = config.legendFont;
                    self.context.textBaseline = "middle";
                    self.context.fillStyle = config.legendColor;
                    self.context.strokeStyle = config.legendStroke;
                    self.context.textAlign = "right";
                    self.context.strokeText(unitCurrent, startX - 8, incrementCurrent);
                    self.context.fillText(unitCurrent, startX - 8, incrementCurrent);
                }
                unitCurrent += unit;
                incrementCurrent -= unitIncrement;
            }

            ////////////////////////////////////////
            // Graph the Data
            var s = Math.round(GraphStepX * config.padding);
            var w = GraphStepX - (s * 2);
            w = Math.round((w - ((config.seperator + config.lineWidth) * (data.dataset.length - 1))) / data.dataset.length);
            var legendPreviousX = startX;

            for (q = 0; q < data.dataset.length; q++) {
                var title = data.dataset[q].title;
                var values = data.dataset[q].data;
                var color = data.dataset[q].color;
                var fillColor = data.dataset[q].fill;

                ////////////////////////////////////////
                // Bar and Fill
                graphCurrentX = startX - GraphStepX;
                self.context.strokeStyle = color;
                self.context.fillStyle = fillColor;

                var sy = graphHeight + startY - 1;

                for (var j = 0; j < values.length; j++) {
                    graphCurrentX += GraphStepX;
                    if (values[j] !== 0) {
                        var datum = values[j] * perc;
                        var dataHeight = graphHeight * (datum / dataMax);
                        fx = graphCurrentX + (q * w) + ((config.seperator + config.lineWidth) * q);
                        fy = (graphHeight - dataHeight) + startY + config.lineWidth;
                        var h = dataHeight - config.lineWidth;
                        if (config.fill) {
                            self.context.fillRect(fx + s, fy, w, h);
                        }
                        self.context.beginPath();
                        self.context.moveTo(fx + s, sy);
                        self.context.lineTo(fx + s, fy);
                        self.context.lineTo(fx + s + w, fy);
                        self.context.lineTo(fx + s + w, sy);
                        self.context.stroke();
                        self.context.closePath();
                    }
                }
                if (config.legend) {
                    var lx = legendPreviousX;
                    var ly = graphHeight + startY;
                    ly += (config.labels) ? 25 : 5;
                    self.context.fillRect(lx, ly, 10, 10);
                    self.context.strokeRect(lx, ly, 10, 10);
                    self.context.font = config.legendFont;
                    self.context.textBaseline = "top";
                    self.context.textAlign = "left";
                    self.context.fillStyle = config.legendColor;
                    self.context.strokeStyle = config.legendStroke;
                    var lm = self.context.measureText(title);
                    self.context.strokeText(title, lx + 15, ly);
                    self.context.fillText(title, lx + 15, ly);
                    legendPreviousX += 40 + lm.width;
                }
            }
            self.context.restore();

            if (elapsed < config.duration) {
                requestAnimationFrame(drawBar);
            }
        }
    };

    ////////////////////////////////////////////////////////////

    self.Progress = function(data, options) {

        self.Progress.defaults = {
            stroke: "#ccc",
            font: "8pt Arial",
            fontColor: "#666",
            fontStroke: "#f8f8f8",
            lineCap: "square",
            duration: 1500,
            colorTop: 'rgba(151,187,205,1)',
            colorBottom: 'rgba(151,187,205,0.5)',
            label: true,
            labelPrefix: "",
            labelPostfix: "",
            width: null,
            height: 12,
            seperator: 2,
            animate: true
        };

        var config = combineOptions(self.Progress.defaults, options);

        if (config.width === null) {
            config.width = self.canvas.width - 5;
        }

        var perc = data.value / data.maximum;

        var startTime = -1;

        if (config.animate) {
            requestAnimationFrame(drawProgress);
        } else {
            config.duration = -1;
            drawProgress(0);
        }

        function drawProgress(now) {
            if (startTime === -1) {
                startTime = now;
            }
            var elapsed = now - startTime;
            if (elapsed > config.duration) {
                elapsed = config.duration;
            }
            var offset = elapsed / config.duration;
            offset = Math.sqrt(offset);

            var currentPercent = perc * offset;
            var currentValue = (currentPercent * data.maximum).toFixed(2);
            if (elapsed === config.duration) currentValue = data.value;
            self.context.save();

            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

            var startX = 1.5;
            var startY = 1.5;
            var rw = config.width - (config.seperator * 2) - 1;
            var rh = config.height - (config.seperator * 2) - 1;

            // Draw the Box
            self.context.lineWidth = 1;
            self.context.lineCap = config.lineCap;
            self.context.strokeStyle = config.stroke;
            self.context.strokeRect(startX, startY, config.width, config.height);

            // Draw the data bar
            if (currentPercent > 1) {
                currentPercent = 1;
            }
            var sw = rw * currentPercent;

            var grd = self.context.createLinearGradient(0, 0, 0, config.height * 2);
            grd.addColorStop(0, config.colorTop);
            grd.addColorStop(1, config.colorBottom);
            self.context.fillStyle = grd;
            self.context.fillRect(startX + config.seperator + 0.5, startY + config.seperator + 0.5, sw, rh);

            // Draw the Divisions
            if (data.divisions > 1) {
                var dw = rw / data.divisions;
                self.context.beginPath();
                for (var i = 1; i < data.divisions; i++) {
                    var ddw = i * dw;
                    var sx = startX + ddw + config.seperator;
                    sx = Math.ceil(sx) + 0.5;
                    self.context.moveTo(sx, startY);
                    self.context.lineTo(sx, startY + config.height);
                }
                self.context.closePath();
                self.context.stroke();
            }

            // Draw the Label
            if (config.label) {
                self.context.strokeStyle = config.fontStroke;
                self.context.fillStyle = config.fontColor;
                self.context.font = config.font;
                var text = config.labelPrefix + formatNumber(currentValue) + config.labelPostfix;
                var m = self.context.measureText(text);
                var tx = startX + ((config.width / 2) - (m.width / 2));
                var ty = startY + config.height + 12;
                self.context.strokeText(text, tx, ty);
                self.context.fillText(text, tx, ty);
            }
            self.context.restore();

            if (elapsed < config.duration) {
                requestAnimationFrame(drawProgress);
            }
        }

    };

    ////////////////////////////////////////////////////////////

    function combineOptions(defaults, options) {
        var config = {};
        for (var i in defaults) {
            config[i] = defaults[i];
        }
        for (var j in options) {
            config[j] = options[j];
        }
        return config;
    }

    function formatNumber(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    ////////////////////////////////////////////////////////////
}
