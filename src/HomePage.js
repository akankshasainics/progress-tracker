import React from "react";
import './HomePage.css';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
const days = ['S','M','T','W','T','F','S'];
const mapping =  {
                0: 'emptyCircle',
                1: 'halfCircle',
                2: 'fullCircle'
            }
const MaxValue = 1;
const daysOnOnePage = 15;
const currentMonth = new Date().toLocaleDateString('default', {month: 'short'}) 
const currentYear =  new Date().toLocaleDateString('default', {year: "numeric"})
var currentRange  = Math.floor(Number(new Date().toLocaleString("en-US", { day : '2-digit'}))/daysOnOnePage)
if(currentRange > MaxValue){
    currentRange = MaxValue;
}
const key = currentMonth + " " + currentYear + " " + currentRange;


class HomePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            toggle: false,
            task: '',
            focusedTaskIndex: null,
            foucsedName: null,
            month : currentMonth,
            range: currentRange,
            year: currentYear,
            tasks: localStorage.getItem(key) !== null && JSON.parse(localStorage.getItem(key))["tasks"] !== undefined? JSON.parse(localStorage.getItem(key))["tasks"]: [], 
            fillStates: localStorage.getItem(key) !== null && JSON.parse(localStorage.getItem(key))["fillStates"] !== undefined? JSON.parse(localStorage.getItem(key))["fillStates"]: [], 
            daysInMonth: new Date(
                currentYear,
                new Date().toLocaleDateString('default', {month: "numeric"}),
                0).getDate(),
        }
    }

    arrowFunction = (event) => {
        if(this.state.task === '' && this.state.focusedTaskIndex === null)
        {
            if(event.key === "ArrowRight"){
                this.newMonth(1);
            }
            if(event.key === "ArrowLeft"){
                this.newMonth(-1);
            }
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.arrowFunction, false);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.arrowFunction, false);
      }

    onClick = () => {
        this.setState({
            toggle: !this.state.toggle
        })
    }

    handleChange = (e) => {
        this.setState({
            task: e.target.value
        })
    }

    handleKeyDown = (e) => {
        if(e.key === 'Enter'){
            if(this.state.task.trim().length  > 0){
                const val = this.state.task.trim();
                const duplicatedTask = this.state.tasks.filter(function(task) {
                    return task === val 
                })
                if(duplicatedTask !== null && duplicatedTask.length > 0){
                    alert("Task with same name already exists, Please try with another name")
                }
                else{
                    this.state.tasks.push(this.state.task);
                    var arr = []
                    for(var j = 0; j < this.state.daysInMonth; j++){
                        arr.push(0)
                    }
                    this.setState({
                        fillStates: [...this.state.fillStates, arr]
                    })
                    this.setLocalStorage();
                }
            }
            else{
                alert("Task name is empty")
            }
            this.setState({
                task: "",
                toggle: false,
            })
        }
    }

    handleEnter = (e) => {
        if(e.key === 'Enter'){
            if(this.state.foucsedName.length > 0){
                var tasks = this.state.tasks;
                tasks[this.state.focusedTaskIndex] = this.state.foucsedName;
                this.setState({
                    tasks
                })
                }
            else{
                alert("name can't be empty");
            }
            this.setState({
                foucsedName: null,
                focusedTaskIndex: null
            })
        }
    }

    readFile = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const fileContain =  JSON.parse(text)
            const tasks = Object.keys(fileContain.details[0]).slice(2) 
            const fillStates = [];
            for(var i = 0; i < tasks.length; i++){
                fillStates.push([])
            }
            for(i = 0; i < fileContain.details.length; i++){
                const oneDayDetail = fileContain.details[i];
                for(var j = 0; j < tasks.length; j++){
                    fillStates[j].push(oneDayDetail[tasks[j]])
                }
            }
            this.setState({
                month: fileContain.month,
                year: fileContain.year,
                range: fileContain.range,
                tasks: tasks,
                fillStates: fillStates,
                daysInMonth: new Date(
                            fileContain.year,
                            months.indexOf(fileContain.month) + 1,
                            0).getDate(),
            });
        };
        reader.readAsText(e.target.files[0]);
    }

    onDelete = (i) => {
        var selectedTask = this.state.tasks[i];
        this.setState({tasks: this.state.tasks.filter(function(task) { 
            return task !== selectedTask 
        })});
        var fillStates = []
        for(var j = 0; j < this.state.fillStates.length; j++){
            if(j !== i){
                fillStates.push(this.state.fillStates[j]);
            }
        }
        this.setState({fillStates});
        this.setLocalStorage();
    }

    nameUpate = (e) => {
        this.setState({
            foucsedName: e.target.value
        })
    }

    fillCircle = (i, j) => {
       let fillStates = [...this.state.fillStates];
       let oneRowCircle = [...this.state.fillStates[i]]
       let circle = (oneRowCircle[j] + 1)%3;
       oneRowCircle[j] = circle;
       fillStates[i] = oneRowCircle;
       this.setState({fillStates});
       this.setLocalStorage();
    } 

    setLocalStorage = () => {
        var monthDetails = {"tasks": this.state.tasks, "fillStates": this.state.fillStates};
        var storageKey = this.state.month + " " + this.state.year + " " + this.state.range;
        localStorage.setItem(storageKey, JSON.stringify(monthDetails));

    }

    createLogsJson = () => {
        const logs = {
            month: this.state.month,
            year: this.state.year,
            range: this.state.range
        }
        var details = [];
            var start = this.state.range*daysOnOnePage + 1;
            var end = (this.state.range + 1)*daysOnOnePage + 1; 
            if(this.state.range >= MaxValue){
                end = this.state.daysInMonth + 1;
            }
            for(var i = start; i < end; i++){
                const date  =  i;
                const day =  days[new Date(this.state.year, months.indexOf(this.state.month), i).getDay()] 
                const dailyLogs = {}
                dailyLogs["date"] = date;
                dailyLogs["day"] = day;
                for(var j = 0; j < this.state.tasks.length; j++){
                    dailyLogs[this.state.tasks[j]] = this.state.fillStates[j][i - start];
                }
                details.push(dailyLogs);
        }
        logs["details"] = details; 
        return logs;
    }

    newMonth = (count) => {
        var newYear = Number(this.state.year);
        var currentMonthIndex = months.indexOf(this.state.month);
        var newRange = (this.state.range + count);
        var newMonth = this.state.month;
        if((this.state.range === 0 && count === -1) || (this.state.range === MaxValue && count === 1) ){
            newMonth = months[currentMonthIndex + count];
        }
        if(count === 1 && currentMonthIndex === 11 && this.state.range === MaxValue){
            newYear += 1;
            newMonth = months[0];
            newRange = 0;
        }
        else if(count === -1 && currentMonthIndex === 0 && this.state.range === 0){
            newYear -= 1;
            newMonth = months[11];
            newRange = MaxValue;
        }
        if(newRange === -1){
            newRange = MaxValue;
        }
        if(newRange === MaxValue + 1){
            newRange = 0;
        }

        var key = newMonth + " " + newYear + " " + newRange;
        var storedDetails = localStorage.getItem(key);
        var tasks = [];
        var fillStates = []
        if(storedDetails !== null){
            var jsonObj = JSON.parse(storedDetails);
            fillStates = jsonObj["fillStates"];
            tasks = jsonObj["tasks"];
        }
        console.log(newMonth);
        this.setState({
            tasks: tasks,
            fillStates: fillStates,
            month: newMonth,
            year: newYear,
            range: newRange,
            daysInMonth:  new Date(
                            newYear,
                            months.indexOf(newMonth) + 1,
                            0).getDate(),
 
        });
        
    }

    showTasksDetails = () => {
        var allTaskCircles = []
        var oneTaskCircles = []
        var isSame = false;
        if(Number(currentYear) === Number(this.state.year) && currentMonth === this.state.month){
            isSame = true;
        }
        for(let i = 0; i < this.state.tasks.length; i++){
            oneTaskCircles = []
            var length = daysOnOnePage;
            if(this.state.range >= MaxValue){
                length = this.state.daysInMonth - daysOnOnePage;
            }
            for(let j = 0; j < length; j++){
                var date = (this.state.range )*daysOnOnePage + j + 2;
                var toDdate = Math.floor(Number(new Date().toLocaleString("en-US", { day : '2-digit'})))
                if(this.state.fillStates[i][j] === 1){
                    oneTaskCircles.push(<div class="circles">
                                        <div id={j} class="halfCircle" onClick={() => this.fillCircle(i, j)}>
                                        <div class="one"></div>
                                        <div class="two"></div>
                                    </div>
                {isSame && Number(toDdate) === date ? <div class="solid_line"></div>: <div class="vertical_dotted_line"></div>}    
                                     </div>)
                }
                else{
                    oneTaskCircles.push(<div class="circles">
                        <div id={`${i}+${j}`} onClick={() => this.fillCircle(i, j)} class={mapping[this.state.fillStates[i][j]]}></div> 
                            {isSame && Number(toDdate) === date ? <div class="solid_line"></div>: <div class="vertical_dotted_line"></div>}    
                        </div>);
                }
            }
            allTaskCircles.push(
                <div>
                <div class="group">
                    {this.state.focusedTaskIndex === i?
                         <input value={this.state.foucsedName} onChange={this.nameUpate}onKeyDown={this.handleEnter} class="name_update"/>:
                         <button id={i} onFocus={() => this.onFocus(i)}  class="task" >{this.state.tasks[i]}</button>
                    }
                    <div class="taskCircles">
                        {oneTaskCircles}
                    </div>
                    <button class="delete" onClick={() => this.onDelete(i)}>Delete</button>
                    </div>
                    <hr/>
                </div>)
        }
        return allTaskCircles;
    }

    onFocus = (i) => {
        this.setState({
            focusedTaskIndex: i,
            foucsedName: this.state.tasks[i]
        })
    }
   
    render(){
        this.setLocalStorage(); 
        let weekDay = []
        const logs = this.createLogsJson();
        var length = daysOnOnePage;
        if(this.state.range >= MaxValue){
            length = this.state.daysInMonth - daysOnOnePage;
        }
        var isSame = false;
        var toDdate  = new Date().toLocaleString("en-US", { day : '2-digit'})
        if(currentMonth  === this.state.month && Number(currentYear) === Number(this.state.year)){
            isSame = true;
        }
        console.log(currentMonth, this.state.month);
        console.log(currentYear, this.state.year);
        for(let i = 0; i < length; i++){
            var date = this.state.range*daysOnOnePage + i + 1; 
            weekDay.push(<div class="oneDay">
                <div class="pack">
                    <div class="date">{date}</div>
                <div class="day">{days[new Date(this.state.year, months.indexOf(this.state.month), date).getDay()]}</div>
                </div>
                {isSame && Number(toDdate) === date+1  ? <div class="solid_line"></div>: <div class="vertical_dotted_line"></div>}    
                </div>
                )
        };
       
        return(<div class="main">
                    <div class="header">
                        <button onClick={() => this.newMonth(-1)} class="arrow_rect">{String.fromCharCode(8592)}</button>
                        <p class="heading"> {this.state.month} {this.state.year}</p> 
                        <button onClick={() => this.newMonth(1)} class="arrow_rect">
                            {String.fromCharCode(8594)}
                        </button>
                    </div>
                    <div class="days_row">
                        <div class="empty_div"></div>
                        <div class="days"> {weekDay}</div>
                    </div>
                    <hr/>
                    {this.showTasksDetails()}
                    {this.state.toggle? null: <button class="add" onClick={this.onClick}> + Add New Task</button>}
                    {this.state.toggle ? <input class="text_input" value={this.state.task} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/>: null}
                    <br/>
                    
                    <br/>
                    
                    <div class="transfer">
                        <div>
                            <label htmlFor="files">
                            <div class="import">Import</div>
                            </label>
                            <input type="file" id="files" onChange={this.readFile} />
                        </div>
                        <div class="line"></div>
                        <a class="export"
                            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                                JSON.stringify(logs)
                                )}`}
                            download={this.state.month + " " + this.state.year + ".json"}
                        > 
                        Export 
                        </a>
                    </div>

               </div>)
    }
}

export default HomePage;