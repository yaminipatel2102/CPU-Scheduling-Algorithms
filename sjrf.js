function SJRF(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    let ganttChart = [];
    let currentTime = 0;
    let totalTAT = 0, totalWT = 0;
    let completed = 0;

    let resultTable = `
        <table class='output'>
            <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Finish Time</th>
                <th>Turnaround Time</th>
                <th>Waiting Time</th>
            </tr>
    `;

    // Initialize process tracking
    for (let i = 0; i < processes.length; i++) {
        processes[i].completed = false;
        processes[i].remainingTime = processes[i].burstTime;
        processes[i].startTime = -1;
        processes[i].finishTime = -1;
    }

    while (completed < processes.length) {
        let index = -1;
        let minRemainingTime = Infinity;

        // Find process with shortest remaining time
        for (let j = 0; j < processes.length; j++) {
            if (!processes[j].completed && 
                processes[j].arrivalTime <= currentTime && 
                processes[j].remainingTime < minRemainingTime) {
                minRemainingTime = processes[j].remainingTime;
                index = j;
            }
        }

        if (index === -1) {
            // CPU is idle
            ganttChart.push({id: "-", time: currentTime});
            currentTime++;
            continue;
        }

        let currentProcess = processes[index];
        
        // Mark start time if not already set
        if (currentProcess.startTime === -1) {
            currentProcess.startTime = currentTime;
        }

        // Execute for 1 time unit
        ganttChart.push({id: currentProcess.processId, time: currentTime});
        currentProcess.remainingTime--;
        currentTime++;

        // Check if process completed
        if (currentProcess.remainingTime === 0) {
            currentProcess.completed = true;
            currentProcess.finishTime = currentTime;
            let turnAroundTime = currentProcess.finishTime - currentProcess.arrivalTime;
            let waitingTime = turnAroundTime - currentProcess.burstTime;
            totalTAT += turnAroundTime;
            totalWT += waitingTime;
            completed++;
            
            resultTable += `
                <tr>
                    <td>${currentProcess.processId}</td>
                    <td>${currentProcess.arrivalTime}</td>
                    <td>${currentProcess.burstTime}</td>
                    <td>${currentProcess.finishTime}</td>
                    <td>${turnAroundTime}</td>
                    <td>${waitingTime}</td>
                </tr>
            `;
        }
    }

    // Calculate averages
    let avgWT = (totalWT / processes.length).toFixed(2);
    let avgTAT = (totalTAT / processes.length).toFixed(2);

    // Generate Gantt chart HTML
    let chartHtml = "";
    let prevProcess = null;
    let startTime = 0;
    
    for (let i = 0; i < ganttChart.length; i++) {
        if (prevProcess !== ganttChart[i].id) {
            if (prevProcess !== null) {
                // Close previous chart segment
                chartHtml += `</div>`;
            }
            // Start new chart segment
            startTime = ganttChart[i].time;
            chartHtml += `
                <div class='chart' title="${ganttChart[i].id === "-" ? "Idle" : "Process "+ganttChart[i].id} from ${startTime} to ${startTime+1}">
                    ${ganttChart[i].id}
            `;
            prevProcess = ganttChart[i].id;
        }
    }
    chartHtml += `</div>`; // Close last segment

    // Generate analysis
    let analysis = `
        <div class="analysis">
            <div><i class="fas fa-stopwatch"></i> Average Turnaround Time: <strong>${avgTAT}</strong></div>
            <div><i class="fas fa-hourglass-half"></i> Average Waiting Time: <strong>${avgWT}</strong></div>
        </div>
    `;

    // Update DOM
    document.getElementById('gainchart').innerHTML = chartHtml;
    document.getElementById('outputTable').innerHTML = resultTable + "</table>";
    document.getElementById('analysis').innerHTML = analysis;
    document.getElementById('clear').style.display = "inline-flex";
}

function displayInputTable() {
    let size = parseInt(document.getElementById('nprocesses').value);
    if (size < 1 || size > 10) {
        alert("Please enter a number between 1 and 10");
        document.getElementById('nprocesses').value = "";
        return;
    }

    let table = `
        <table class='input'>
            <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
            </tr>
    `;
    
    for (let i = 0; i < size; i++) {
        table += `
            <tr>
                <td>P${i + 1}</td>
                <td><input type='number' id='arrival_${i + 1}' min="0" placeholder="0"></td>
                <td><input type='number' id='burst_${i + 1}' min="1" placeholder="1"></td>
            </tr>
        `;
    }
    table += "</table>";

    document.getElementById('inputTable').innerHTML = table;
    document.getElementById('save').style.display = "inline-flex";
}

function saveData() {
    let size = parseInt(document.getElementById('nprocesses').value);
    let processes = [];

    for (let i = 0; i < size; i++) {
        let arrival = parseInt(document.getElementById(`arrival_${i + 1}`).value) || 0;
        let burst = parseInt(document.getElementById(`burst_${i + 1}`).value) || 1;
        
        if (burst < 1) {
            alert("Burst time must be at least 1");
            document.getElementById(`burst_${i + 1}`).value = 1;
            burst = 1;
        }

        let process = {
            processId: "P" + (i + 1),
            arrivalTime: arrival,
            burstTime: burst
        };
        processes.push(process);
    }

    document.getElementById('options').innerHTML = `
        <button onclick='SJRF(${JSON.stringify(processes)})'>
            <i class="fas fa-play"></i> Run SJRF Simulation
        </button>
    `;
}

function clearAll() {
    document.getElementById('nprocesses').value = "";
    document.getElementById('inputTable').innerHTML = "";
    document.getElementById('gainchart').innerHTML = "";
    document.getElementById('outputTable').innerHTML = "";
    document.getElementById('analysis').innerHTML = "";
    document.getElementById('options').innerHTML = "";
    document.getElementById('save').style.display = "none";
    document.getElementById('clear').style.display = "none";
}
