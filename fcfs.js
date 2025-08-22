function FCFS(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let chart = "";
    let currentTime = 0;
    let totalTAT = 0, totalWT = 0;

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

    for (let j = 0; j < processes.length; j++) {
        if (currentTime < processes[j].arrivalTime) {
            // CPU is idle; add '-' to Gantt chart
            while (currentTime < processes[j].arrivalTime) {
                chart += `<div class='chart' title="Idle CPU at time ${currentTime}">-</div>`;
                currentTime++;
            }
        }
        
        // Add process to Gantt chart
        for (let k = 0; k < processes[j].burstTime; k++) {
            chart += `<div class='chart' title="Process ${processes[j].processId} from ${currentTime+k} to ${currentTime+k+1}">
                        ${processes[j].processId}
                     </div>`;
        }

        currentTime += processes[j].burstTime;
        let finishTime = currentTime;
        let turnAroundTime = finishTime - processes[j].arrivalTime;
        let waitingTime = turnAroundTime - processes[j].burstTime;

        totalTAT += turnAroundTime;
        totalWT += waitingTime;

        resultTable += `
            <tr>
                <td>${processes[j].processId}</td>
                <td>${processes[j].arrivalTime}</td>
                <td>${processes[j].burstTime}</td>
                <td>${finishTime}</td>
                <td>${turnAroundTime}</td>
                <td>${waitingTime}</td>
            </tr>
        `;
    }

    let avgWT = (totalWT / processes.length).toFixed(2);
    let avgTAT = (totalTAT / processes.length).toFixed(2);

    let analysis = `
        <div class="analysis">
            <div><i class="fas fa-stopwatch"></i> Average Turnaround Time: <strong>${avgTAT}</strong></div>
            <div><i class="fas fa-hourglass-half"></i> Average Waiting Time: <strong>${avgWT}</strong></div>
        </div>
    `;

    document.getElementById('gainchart').innerHTML = chart;
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
        <button onclick='FCFS(${JSON.stringify(processes)})'>
            <i class="fas fa-play"></i> Run FCFS Simulation
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
