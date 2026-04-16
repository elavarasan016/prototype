const API="http://localhost:3000";
let autoOpen=false;

// SOUND ALERT
function beep(){
    let audio=new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
}

function showPage(p){
homePage.style.display=p==="home"?"block":"none";
pipePage.style.display=p==="pipes"?"block":"none";
motorPage.style.display=p==="motors"?"block":"none";
analyticsPage.style.display=p==="analytics"?"block":"none";
}

function showAutoOptions(){
autoOpen=true;
autoOptions.style.display="block";
autoBtn.style.display="none";
}

async function loadData(){
let d=await (await fetch(API+"/status")).json();

// POWER
powerStatus.innerHTML=d.power?
"⚡ Current Available":"❌ No Current";

line.innerText=d.power?"Line: "+d.currentLine:"";

// STATUS COLORS
// FLOW
// FLOW
flow.innerHTML = d.flow === "LOW"
    ? "Flow: <span class='badge red'>LOW</span>"
    : "Flow: <span class='badge green'>NORMAL</span>";

if(d.flow==="LOW") beep();

// SOIL
soil.innerHTML =
    d.soil === "DRY"
    ? "Soil: <span class='badge red'>DRY</span>"
    : d.soil === "WET"
    ? "Soil: <span class='badge blue'>WET</span>"
    : "Soil: <span class='badge green'>NORMAL</span>";

// ACTIVE PIPE
activePipe.innerHTML =
    d.activePipe !== null
    ? "Active Pipe: <span class='badge green'>" + d.pipes[d.activePipe].name + "</span>"
    : "Active Pipe: None";

// TIMER
timer.innerHTML =
    d.autoTimer > 0
    ? "Time Left: <span class='badge yellow'>" + d.autoTimer + " sec</span>"
    : "";

// PIPES
pipeList.innerHTML="";
pipeCheckboxes.innerHTML="";
autoPipe.innerHTML="";
d.pipes.forEach((p,i)=>{
pipeList.innerHTML+=`<div>${p.name}</div>`;
pipeCheckboxes.innerHTML+=`<input type="checkbox" class="pipeCheck">${p.name}<br>`;
autoPipe.innerHTML+=`<option value="${i}">${p.name}</option>`;
});

// MOTORS
motorList.innerHTML="";
motorSelect.innerHTML="";
autoMotor.innerHTML="";
d.motors.forEach((m,i)=>{
motorList.innerHTML+=`<div>${m.name}</div>`;
motorSelect.innerHTML+=`<option value="${i}">${m.name}</option>`;
autoMotor.innerHTML+=`<option value="${i}">${m.name}</option>`;
});

// ALERTS
notifications.innerHTML=d.notifications.slice(-5).join("<br>");
alerts.innerHTML=d.alerts.slice(-5).join("<br>");

// BUTTONS
let running=d.selectedMotor!==null&&d.motors[d.selectedMotor]?.running;

startBtn.style.display=running?"none":"block";
stopBtn.style.display=running?"block":"none";

if(running){
autoSection.style.display="none";
autoOpen=false;
}else{
autoSection.style.display="block";

if(autoOpen){
autoOptions.style.display="block";
autoBtn.style.display="none";
}else{
autoOptions.style.display="none";
autoBtn.style.display="block";
}
}
}

// ACTIONS (same as before)
async function addPipe(){await fetch(API+"/addPipe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newPipeName.value})});}
async function addMotor(){let pipes=[];document.querySelectorAll(".pipeCheck").forEach((e,i)=>{if(e.checked)pipes.push(i);});await fetch(API+"/addMotor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:motorName.value,line:motorLine.value,pipes})});}
async function selectMotor(){await fetch(API+"/selectMotor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({index:motorSelect.value})});}
async function startMotor(){let r=await fetch(API+"/motor/start",{method:"POST"});let d=await r.json();if(d.error){alert(d.error);beep();}}
async function stopMotor(){await fetch(API+"/motor/stop",{method:"POST"});}
async function setAuto(){await fetch(API+"/auto",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({motor:autoMotor.value,pipe:autoPipe.value,time:autoTime.value})});}

setInterval(loadData,2000);
loadData();