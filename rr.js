function RR(processes) {
    // Get time quantum through a styled modal instead of basic prompt
    let timeQuantum = null;
    while (timeQuantum === null || timeQuantum <= 0) {
        timeQuantum = parseInt(prompt("Enter Time Quantum (must be positive integer):"));
        if (timeQuantum <= 0) {
            alert("Time Quantum must be a positive integer");
        }
    }

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let completed = 0;
    let ganttChart = [];
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

    // Initialize process tracking
    let queue = [];
    for (let i = 0; i < processes.length; i++) {
        processes[i].completed = false;
        processes[i].remainingTime = processes[i].burstTime;
        processes[i].startTime = -1;
        processes[i].finishTime = -1;
    }

    // Add initial arriving processes to queue
    for (let i = 0; i < processes.length; i++) {
        if (processes[i].arrivalTime <= currentTime) {
            queue.push(i);
        }
    }

    while (completed < processes.length) {
        if (queue.length === 0) {
            // CPU is idle
            ganttChart.push({id: "-", time: currentTime});
            currentTime++;
            
            // Check for new arriving processes
            for (let i = 0; i < processes.length; i++) {
                if (!processes[i].completed && 
                    processes[i].arrivalTime <= currentTime && 
                    !queue.includes(i)) {
                    queue.push(i);
                }
            }
            continue;
        }

        let currentIndex = queue.shift();
        let currentProcess = processes[currentIndex];
        
        // Mark start time if not already set
        if (currentProcess.startTime === -1) {
            currentProcess.startTime = currentTime;
        }

        // Execute for time quantum or remaining time, whichever is smaller
        let executeTime = Math.min(timeQuantum, currentProcess.remainingTime);
        
        // Add to Gantt chart
        for (let t = 0; t < executeTime; t++) {
            ganttChart.push({id: currentProcess.processId, time: currentTime + t});
        }
        
        currentTime += executeTime;
        currentProcess.remainingTime -= executeTime;

        // Check for new arriving processes
        for (let i = 0; i < processes.length; i++) {
            if (!processes[i].completed && 
                processes[i].arrivalTime <= currentTime && 
                !queue.includes(i) && 
                i !== currentIndex) {
                queue.push(i);
            }
        }

        // If process not completed, add back to queue
        if (currentProcess.remainingTime > 0) {
            queue.push(currentIndex);
        } else {
            // Process completed
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

    // Generate Gantt chart HTML with tooltips
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

    // Calculate averages
    let avgWT = (totalWT / processes.length).toFixed(2);
    let avgTAT = (totalTAT / processes.length).toFixed(2);

    // Generate analysis
    let analysis = `
        <div class="analysis">
            <div><i class="fas fa-stopwatch"></i> Average Turnaround Time: <strong>${avgTAT}</strong></div>
            <div><i class="fas fa-hourglass-half"></i> Average Waiting Time: <strong>${avgWT}</strong></div>
            <div><i class="fas fa-clock"></i> Time Quantum: <strong>${timeQuantum}</strong></div>
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
        <button onclick='RR(${JSON.stringify(processes)})'>
            <i class="fas fa-play"></i> Run Round Robin Simulation
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
