/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.93465469796105, "KoPercent": 0.06534530203894243};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8367999642694183, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7081361746713083, 500, 1500, "Requisição POST para buscar voos"], "isController": false}, {"data": [0.7520194680095988, 500, 1500, "Requisição GET para página inicial"], "isController": false}, {"data": [0.9716549072626642, 500, 1500, "Requisição GET para página inicial-1"], "isController": false}, {"data": [0.9920486040694924, 500, 1500, "Requisição POST para buscar voos-0"], "isController": false}, {"data": [0.9701294531197188, 500, 1500, "Requisição POST para buscar voos-1"], "isController": false}, {"data": [0.47103457599621457, 500, 1500, "Fluxo_Busca_TC"], "isController": true}, {"data": [0.9925936879462588, 500, 1500, "Requisição GET para página inicial-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 710074, 464, 0.06534530203894243, 373.75214836763996, 158, 41011, 312.5, 573.0, 669.0, 1131.9900000000016, 217.17962614741472, 880.238217409954, 43.20213701692509], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Requisição POST para buscar voos", 118348, 243, 0.20532666373745226, 568.7913695203966, 407, 40848, 515.0, 672.0, 752.0, 1223.9900000000016, 36.19731801938141, 264.2266396710194, 13.400412629827768], "isController": false}, {"data": ["Requisição GET para página inicial", 118348, 220, 0.1858924527664177, 553.445127927797, 398, 41011, 496.0, 654.0, 734.0, 1198.9900000000016, 36.21551702770083, 175.98114868578065, 8.20497408144605], "isController": false}, {"data": ["Requisição GET para página inicial-1", 118345, 1, 8.449871139465123E-4, 347.42026279098843, 232, 40637, 301.0, 432.0, 483.0, 749.9800000000032, 36.21666036762917, 168.24438359598662, 4.1026685572704915], "isController": false}, {"data": ["Requisição POST para buscar voos-0", 118344, 0, 0.0, 211.93515514094528, 158, 40398, 185.0, 286.90000000000146, 308.0, 546.9400000000096, 36.19923896685468, 8.131657462820106, 8.911736510243971], "isController": false}, {"data": ["Requisição POST para buscar voos-1", 118344, 0, 0.0, 355.7171466234012, 241, 20771, 310.0, 441.0, 490.0, 774.9900000000016, 36.19886249974765, 256.11499128896816, 4.489507360808546], "isController": false}, {"data": ["Fluxo_Busca_TC", 118348, 962, 0.812856998005881, 1122.2364974481923, 817, 42096, 1044.0, 1257.0, 1495.9500000000007, 2164.880000000019, 36.1968530379873, 440.1137007150758, 21.600986066461115], "isController": true}, {"data": ["Requisição GET para página inicial-0", 118345, 0, 0.0, 205.1928091596581, 158, 40647, 183.0, 270.0, 293.0, 532.9900000000016, 36.21771330640225, 7.7467966143920615, 4.10278783549088], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 9, 1.9396551724137931, 0.0012674735309277626], "isController": false}, {"data": ["Assertion failed", 455, 98.0603448275862, 0.06407782850801466], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 710074, 464, "Assertion failed", 455, "503/Service Unavailable", 9, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Requisição POST para buscar voos", 118348, 243, "Assertion failed", 239, "503/Service Unavailable", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Requisição GET para página inicial", 118348, 220, "Assertion failed", 216, "503/Service Unavailable", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Requisição GET para página inicial-1", 118345, 1, "503/Service Unavailable", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
