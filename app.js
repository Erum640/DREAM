if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Student= require('./smodels/student');

const userRoutes = require('./routes/users');
const centreRoutes = require('./routes/centres');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require("connect-mongo");

const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');


// const dbUrl = 'mongodb://127.0.0.1:27017/STUDENTS';
const dbUrl =process.env.DB_URL;
// const dbUrl ='mongodb+srv://erum:erum@cluster0.symlxna.mongodb.net/rahul?retryWrites=true&w=majority';

// 'mongodb://127.0.0.1:27017/STUDENTS'
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
})
.then(()=>{console.log("Mongoose Connection open!!!")})
.catch(err=>{
    console.log('Oh No!! mongoose connection error!!');
    console.log(err)
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use('/public',express.static(path.join(__dirname, 'public')))

// app.use(session({  secret: 'secret', store: new Mongostore({  mongooseConnection: mongoose.connection }), resave: true, saveUninitialized: true }))
// app.use(session({
//     store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/STUDENTS' })
//   }));
// app.use(session({
//     secret:"secret",
//     cookie:{maxAge:60000},
//     resave:false,
//     saveUninitialized:false,
//     store:MongoStore.create({mongoUrl:process.env.DB_URL}),
// }));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret:'thisshouldbeabettersecret!',
    touchAfter:24*60*60
});

store.on("error",function(e){
    console.log("session store error",e)
})

const sessionConfig = {
    store,
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.use('/', userRoutes);
app.use('/centres', centreRoutes)
app.use('/centres/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});
app.get('/whoweare',(req,res)=>{
    res.render('who');
})
app.get('/ourwork',(req,res)=>{
    res.render('work');
})



const centres=['IITISM','IITD','IITB','IITBHU']

app.get('/students', async(req, res) => {
    const {centre} = req.query;
    if(centre){
      const students = await Student.find({centre})
      res.render('students/index',{students,centre})
    }else{
        const students = await Student.find({})
        res.render('students/index',{students,centre:'All'})
    }
});

app.get('/students/new',(req,res)=>{
    res.render('students/new',{centres})
})   

app.post('/students',async (req,res)=>{
    const newStudent = new Student(req.body)
    await newStudent.save();
    res.redirect(`/students/${newStudent._id}`)
})

app.get('/students/:id', async (req, res) => {
    const {id} = req.params;
    const student = await Student.findById(id);
    res.render('students/show',{student})})

app.get('/students/:id/edit',async(req,res)=>{
    const {id} = req.params;
    const student = await Student.findById(id);
    res.render('students/edit',{student, centres})
})  

app.put('/students/:id',async(req,res)=>{
    const {id} = req.params;
    const student = await Student.findByIdAndUpdate(id, req.body, {runValidators:true , new:true});
    res.redirect(`/students/${student._id}`);
})
 
app.delete('/students/:id',async(req,res)=>{
    const {id} = req.params;
    const deleteStudent = await Student.findByIdAndDelete(id);
    res.redirect('/students');
})
//new
app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'kennedi42@ethereal.email', // generated ethereal user
        pass: 'tfeWD4T8ND9Bqf2vG4'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Nodemailer Contact" <kennedi42@ethereal.email>', // sender address
      to: 'rahulapple043@gmail.com', // list of receivers
      subject: 'Node Contact Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('contact', {msg:'Email has been sent'});
  });
  });





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})


