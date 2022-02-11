import React from "react";
import './HomePage.css';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
const days = ['S','M','T','W','T','F','S'];
const mapping =  {
                0: 'emptyCircle',
                1: 'halfCircle',
                2: 'fullCircle'
            }
const currentMonth = new Date().toLocaleDateString('default', {month: 'short'}) 
const currentYear =  new Date().toLocaleDateString('default', {year: "numeric"})
const key = currentMonth + " " + currentYear;

class HomePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            toggle: false,
            task: '',
            tasks: localStorage.getItem(key) !== null && JSON.parse(localStorage.getItem(key))["tasks"] !== undefined? JSON.parse(localStorage.getItem(key))["tasks"]: [], month : currentMonth,
            year: currentYear,
            daysInMonth: new Date(
                currentYear,
                new Date().toLocaleDateString('default', {month: "numeric"}),
                0).getDate(),
            fillStates: localStorage.getItem(key) !== null && JSON.parse(localStorage.getItem(key))["fillStates"] !== undefined? JSON.parse(localStorage.getItem(key))["fillStates"]: [], 

        }
    }
    componentDidMount(){
        this.setState({
            task: ' '
        })
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
                    //localStorage.setItem("tasks", JSON.stringify(this.state.tasks));
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
            console.log(tasks);
            console.log(fillStates);
            this.setState({
                month: fileContain.month,
                year: fileContain.year,
                daysInMonth: fileContain.details.length,
                tasks: tasks,
                fillStates: fillStates
            })
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
        //localStorage.setItem("tasks", JSON.stringify(this.state.tasks));
        //localStorage.setItem("fillStates", JSON.stringify(this.state.fillStates));
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
        var storageKey = this.state.month + " " + this.state.year;
        localStorage.setItem(storageKey, JSON.stringify(monthDetails));

    }

    createLogsJson = () => {
        var details = [];
            for(var i = 0; i < this.state.daysInMonth; i++){
                const date  =  i + 1;
                const day =  days[new Date(this.state.year, 1, i+1).getDay()] 
                const dailyLogs = {}
                dailyLogs["date"] = date;
                dailyLogs["day"] = day;
                for(var j = 0; j < this.state.tasks.length; j++){
                    dailyLogs[this.state.tasks[j]] = this.state.fillStates[j][i];
                }
                details.push(dailyLogs);
        }
        return details;
    }

    newMonth = (count) => {
        var newYear = Number(this.state.year);
        var currentMonthIndex = months.indexOf(this.state.month);
        var newMonth;
        if(count === 1 && currentMonthIndex === 11){
            newYear += 1;
            newMonth = months[0];
        }
        else if(count === -1 && currentMonthIndex === 0){
            newYear -= 1;
            newMonth = months[11];
        }
        else{
            newMonth = months[currentMonthIndex + count]
        }
        var key = newMonth + " " + newYear;
        var storedDetails = localStorage.getItem(key);
        var tasks = [];
        var fillStates = []
        if(storedDetails !== null){
            var jsonObj = JSON.parse(storedDetails);
            fillStates = jsonObj["fillStates"];
            tasks = jsonObj["tasks"];
        }
        this.setState({
            tasks: tasks,
            fillStates: fillStates,
            month: newMonth,
            year: newYear
        });
    }

    showTasksDetails = () => {
        var allTaskCircles = []
        var oneTaskCircles = []
        for(let i = 0; i < this.state.tasks.length; i++){
            oneTaskCircles = []
            for(let j = 0; j < this.state.daysInMonth; j++){
                if(this.state.fillStates[i][j] === 1){
                    oneTaskCircles.push(<div id={j} class="halfCircle" onClick={() => this.fillCircle(i, j)}>
                                        <div class="one"></div>
                                        <div class="two"></div>
                                    </div>)
                }
                else{
                    oneTaskCircles.push(<div id={`${i}+${j}`} onClick={() => this.fillCircle(i, j)} class={mapping[this.state.fillStates[i][j]]}> </div>);
                }
            }
            allTaskCircles.push(
                <div class="group">
                    <button><div class="task">{this.state.tasks[i]}</div></button>
                    <div class="taskCircles">
                        {oneTaskCircles}
                    </div>
                    <button class="delete" onClick={() => this.onDelete(i)}>Delete</button>
                </div>)
        }
        return allTaskCircles;
    }
   
    render(){
        this.setLocalStorage(); 
        //console.log(this.state.tasks, this.state.fillStates)
        let rows = []
        let weekDay = []
        const logs = {
            month: this.state.month,
            year: this.state.year,
        }
        logs["details"] = this.createLogsJson();
        for(let i = 0; i < this.state.daysInMonth; i++){
            rows.push(<div class="date">{i+1}</div>)
            weekDay.push(<div class="day">{days[new Date(this.state.year, 1, i+1).getDay()]}</div>)
        };
        
       
        return(<div class="main">
                    <div class="header">
                        <button onClick={() => this.newMonth(-1)}>{"<"}</button>
                        <h1 class="heading"> {this.state.month} {this.state.year}</h1> 
                        <button onClick={() => this.newMonth(1)}>{">"}</button>
                    </div>
                    <hr/>
                    <div class="dates">{rows}</div>
                    <div class="days">{weekDay}</div>
                    <hr/>
                    {this.showTasksDetails()}
                    {this.state.toggle? null: <button class="add" onClick={this.onClick}>Add new task</button>}
                    {this.state.toggle ? <input value={this.state.task} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/>: null}
                    <br/>
                    <a
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(
                            JSON.stringify(logs)
                            )}`}
                        download={this.state.month + " " + this.state.year + ".json"}
                    > 
                    Donwload Json 
                    </a>
                    <br/>
                    <div>
                             <input type="file" onChange={this.readFile} /> 
                    </div>

               </div>)
    }
}

export default HomePage;