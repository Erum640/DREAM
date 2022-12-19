const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    class:{
        type: Number,
        required:true,
        min:0
    },
    place:{
        type: String,
        required:true
    },
    motherName:{
        type: String,
        required:true
    },
    fatherName:{
        type: String,
        required:true
    },
    mobile:{
        type: Number,
        required:true
    },
    centre: {
        type:String,
        uppercase: true,
        enum:['IITISM','IITB','IITD','IITBHU']
    },
})

const Student = mongoose.model('Student',studentSchema);
module.exports = Student;