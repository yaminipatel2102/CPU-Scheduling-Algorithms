function SJF(processes) {
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

    for (let i = 0; i < processes.length; i++) {
        processes[i].completed = false;
    }

    let flag = true;
    while (flag) {
        let minBurstTime = Infinity;
        let index = -1;

        // Find the process with the shortest burst time
        for (let j = 0; j < processes.length; j++) {
            if (!processes[j].completed && 
                processes[j].arrivalTime <= currentTime && 
                processes[j].burstTime < minBurstTime) {
                minBurstTime = processes[j].burstTime;
                index = j;
            }
        }

        if (index !== -1) {
            let process = processes[index];
            let finishTime = currentTime + process.burstTime;
            let turnAroundTime = finishTime - process.arrivalTime;
            let waitingTime = turnAroundTime - process.burstTime;
            
            totalTAT += turnAroundTime;
            totalWT += waitingTime;
            
            // Add process to Gantt chart
            for (let k = 0; k < process.burstTime; k++) {
                chart += `<div class='chart' title="Process ${process.processId} from ${currentTime+k} to ${currentTime+k+1}">
                            ${process.processId}
                         </div>`;
            }
            
            currentTime = finishTime;
            process.completed = true;
            
            resultTable += `
                <tr>
                    <td>${process.processId}</td>
                    <td>${process.arrivalTime}</td>
                    <td>${process.burstTime}</td>
                    <td>${finishTime}</td>
                    <td>${turnAroundTime}</td>
                    <td>${waitingTime}</td>
                </tr>
            `;
        } else {
            // If no process is ready, CPU is idle
            chart += `<div class='chart' title="Idle CPU at time ${currentTime}">-</div>`;
            currentTime++;
        }

        flag = processes.some(process => !process.completed);
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
        <button onclick='SJF(${JSON.stringify(processes)})'>
            <i class="fas fa-play"></i> Run SJF Simulation
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
