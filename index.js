const express = require('express')
var cors = require('cors')
const app = express()
const port = 3000
const Chart = require('chart.js')
// const { each } = require('chart.js/dist/helpers/helpers.core')

app.use(cors())
app.set('view engine', 'ejs') //to use external variables generated in express
app.engine('html', require('ejs').renderFile)

//parameter
// app.get('/:name', (req, res) => {
//     const {name} = req.params //key:value를 간단하게 받고 싶을때 {}안에 key이름을 넣으면 한번에 assign할 수 있음
//     if(name == 'dog'){
//         res.send({'sound':'멍멍'})

//query
let dataArray = []//전체 데이터 모음
// let eachSensorArr = []//센서별 데이터 모듬, 2차원 배열
let maxSize = 3000 //set the max array size
let sensors = []
let eachSensorArr = []
var chartData = {}
var xtime = []
var yhumid = []
var ytemp = []//declare global variables
let xyhumid = []
let xytemp = []

app.get('/dataTr/:name', (req, res) => {
    // const q = req.query //localhost:3000/dataTr/ab?id=Jason&sensor=room1&temp=27.5&humid=25
    let date = new Date()
    let options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    let senseTime = date.toLocaleString('ko', options)
    senseTime = +senseTime.replace(/[^0-9]/g, "")//+convert string to number,202301231305yyyymmddhhmmss

    const data = req.query //object로 받아옴, 초기화

    if (Object.keys(data).length != 0) {//if not data is empty

        data['time'] = senseTime //add 'current time' key&value to the object
        console.log(`data:`)
        console.log(data)

        //convert string to number
        let keysToConvert = ['temp', 'humid', 'time']//숫자형으로 변환할 key 선택
        Object.keys(data).map(key => {
            if (keysToConvert.includes(key)) {
                data[key] = +data[key];
            }
        });

        dataArray = [...dataArray, data] //data객체를 dataArray에 append

        if (dataArray.length > maxSize) { //limit the size of the variable
            dataArray.splice(0, dataArray.length - maxSize) //delete the data exceeding maxSize
        }

        res.send(dataArray)

        //object array에서 sensor모듈별로  array추출
        // let sensors = dataArray.map(obj => obj['sensor']) //sensor value값만 추출
        // sensors = [...new Set(sensors)]//중복되지 않은 값만 추출, 센서모듈 명칭만 배열로 만듦
        if (!sensors.includes(data['sensor'])) { //sensor값이 sensors에 있는지 확인
            sensors = [...sensors, data['sensor']]//없으면 append
            let sensorNumber = sensors.length-1
            //추가되는 아이템을 위한 배열 초기화, 초기화 해야 push에서 에러 없어짐
            eachSensorArr[sensorNumber] = []
            xtime[sensorNumber] = []
            yhumid[sensorNumber] = []
            ytemp[sensorNumber] = []
            xyhumid[sensorNumber] = []
            xytemp[sensorNumber] = []

        }
        console.log(`sensors: ${sensors}`)

        // let eachSensorArr = [] //초기화, 센서모듈별2차원배열 1행: 센서모듈1의 객체배열, 2행: 센서모듈2의 객체배열...
        // xtime = []
        // yhumid = []
        // ytemp = []
        for (let i in sensors) {
            let sensorName = sensors[i]
            console.log(`for ${i}th sensor: ${sensorName}`)
            // let eachSensor = dataArray.filter(obj => obj['sensor'] === sensorName)//1차원 객체배열
            // console.log('eachSensor: ')
            // console.log(eachSensor)
            if (data['sensor'] == sensorName) {
                // console.log('eachSensorArr: ')
                // console.log(eachSensorArr)
                eachSensorArr[i].push(data)
                let items = Object.keys(data)
                for (let item of items) {//수정필요
                    console.log(`items: ${item}`)
                }
                console.log('data[time')
                console.log(data['time'])
                console.log('xtime')
                console.log(xtime)
                xtime[i].push(data['time'])//객체에서 time의 value만 array에 추가
                ytemp[i].push(data['temp'])
                yhumid[i].push(data['humid'])
                xytemp[i].push({ 'x': data['time'], 'y': data['temp'] })
                xyhumid[i].push({ 'x': data['time'], 'y': data['humid'] })
            }
            // eachSensorArr.push(eachSensor)
            // xtime.push(eachSensor.map(obj => obj.time))
            // ytemp.push(eachSensor.map(obj => obj.temp))
            // yhumid.push(eachSensor.map(obj => obj.humid))
        }

        // user = dataArray.map(obj => obj.id)
        // sensor = dataArray.map(obj => obj.sensor)
        //convert two arrays into an array of objects
        // let xytemp = xtime.map((item, index) =>
        //     Object.assign({}, { x: item }, { y: ytemp[index] }));

        // let xyhumid = xtime.map((item, index) =>
        //     Object.assign({}, { x: item }, { y: yhumid[index] }));
        console.log('eachSensorArr:')
        console.log(eachSensorArr);
        console.log(`xtime: `)
        console.log(xtime)
        console.log(`ytemp: `)
        console.log(ytemp)
        console.log(`yhumid: `)
        console.log(yhumid)

        // xytemp = []
        // xyhumid = []
        // let imax = xtime.length
        // console.log(`imax:${imax}`)
        // for (let i = 0; i < imax; i++) {
        //     if (imax > 1) {
        //         console.log(`i:${i}`)
        //         let jmax = xtime[i].length
        //         console.log(`jmax: ${jmax}`)
        //         for (let j = 0; j < jmax; j++) {
        //             xytemp[i][j] = xytemp.push({ 'x': xtime[i][j], 'y': ytemp[i][j] })
        //             xyhumid[i][j] = xyhumid.push({ 'x': xtime[i][j], 'y': yhumid[i][j] })
        //         }
        //     } else if (imax == 1) {
        //         let jmax = xtime[0].length
        //         console.log(`jmax: ${jmax}`)
        //         // xytemp = new Array(jmax)
        //         // xyhumid = new Array(jmax)
        //         for (let j = 0; j < jmax; j++) {
        //             console.log(`i==0, j=${j}`)
        //             console.log(`xtime: ${xtime[i[j]]}`)
        //             xytemp[0] = xytemp.push({ 'x': xtime[i][j], 'y': ytemp[i][j] })
        //             xyhumid[0] = xyhumid.push({ 'x': xtime[i][j], 'y': yhumid[i][j] })
        //         }
        //     }

        // }
        console.log('xydata:')
        // JSON.stringify(xytemp)
        // JSON.stringify(xyhumid)
        console.log(xytemp)
        console.log(xyhumid)

    }
    // module.exports = chartData,xtime,yhumid,ytemp
})

app.get('/chart', (req, res) => {
    const myVariable = 'Hello World';
    // res.sendFile(__dirname + '/chart.html');
    res.render('index', { 
        xdata: xtime, y1data: ytemp, y2data: yhumid, 
        xy1data: xytemp, xy2data: xyhumid, 
        sensor0: sensors[0], sensor1: sensors[1] })
    // module.exports = chartData
});

app.listen(port, () => {
    console.log(`web server started @ ${port}`)
})