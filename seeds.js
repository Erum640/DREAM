const mongoose = require('mongoose');
const Student= require('./smodels/student');


mongoose.connect('mongodb://127.0.0.1:27017/STUDENTS')
.then(()=>{console.log("Mongoose Connection open!!!")})
.catch(err=>{
    console.log('Oh No!! mongoose connection error!!');
    console.log(err)
});

const s = new Student({
    name:'Erum',
    class:6,
    place:'kanpur',
    motherName:'Fatima',
    fatherName:'abcd',
    mobile:8776766677,
    centre:'IITISM'
})

s.save().then(s=>{
    console.log(s)
})
.catch(e=>{
    console.log(e)
})