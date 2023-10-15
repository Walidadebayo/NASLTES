const express = require('express');
const serverless = require('serverless-http');
const client = require('../routes/client');
const adminRoute = require('../routes/adminRoute');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('req-flash');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const { generate } = require('password-hash');
const MemoryStore = require('memorystore')(session);
const app = express();
const port = process.env.PORT || 3500;


app.use(session({
    cookie: { maxAge: 604800000 },
    store: new MemoryStore({
      checkPeriod: 604800000 // prune expired entries every 7days
    }),
    resave: false,
    secret: 'keyboard cat'
  }))

app.use(flash({ locals: 'flash' }));

app.use((req, res, next) => {
    res.locals.formErrors = req.session.formErrors;
    res.locals.formModalErrorId = req.session.formModalErrorId
    res.locals.formBody = req.session.formBody;
    delete req.session.formErrors;
    delete req.session.formModalErrorId;
    delete req.session.formBody;
    next()
});

// app.use(logger("dev"));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload(
    {

        useTempFiles: true,
        tempFileDir: './tmp/'
    }
));

app.use(client);
app.use('/admin', authenticateAdmin, adminRoute);


app.use((req, res, next) => {
    const err = new Error('Page not Found');
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    console.log(err);
    err.status = err.status || 500;
    err.message = err.status == 500 ? 'Internal Server Error' : err.message;
    res.status(err.status || 500);
    let admin = req.session.admin
    let user = req.session.user
    res.render('error', { error: err, admin, user });
})


const router = express.Router();

router.get('/hey', (req, res)=>{
    res.send("Hey");
})
app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);

// Start the server on port 3500.
// app.listen(port, () => {
//     console.log('App listening on http://localhost:'+port);
// });

