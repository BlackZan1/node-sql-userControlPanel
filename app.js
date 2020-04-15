const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const methodOverride = require('method-override');
const randId = require('rand-id-generator');

const app = express();

app.use(cors());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressLayouts);
app.use('/static', express.static('public')); // url - static, папка - public

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdata'
});

const parseToObject = (data) => {
    return JSON.parse(JSON.stringify(data));
}

app.get('/', (req, res, next) => {
    try {
        connection.query('SELECT * FROM users', (err, result) => {
            res.render('index', {
                count: parseToObject(result).length
            })
        })
    }
    catch(err) {
        console.log(err);

        throw err;
    }
})

app.get('/create', (req, res, next) => {
    try {
        res.render('user/create');
    }
    catch(err) {
        console.log(err);

        res.redirect('/');
    }
})

app.get('/users', (req, res, next) => {
    try {
        connection.query('SELECT * FROM users', (err, result, fields) => {
            console.log(parseToObject(result, fields));

            res.render('user/index', {
                users: parseToObject(result)
            })
        })
    }
    catch(err) {
        console.log(err);

        res.redirect('/')
    }
});

app.get('/user', (req, res) => {
    res.redirect('/users')
})

app.get('/user/:id', (req, res, next) => {
    try {
        connection.query('SELECT * FROM users WHERE id = ?', [ req.params.id ], (err, result, fields) => {
            console.log(parseToObject(result));

            if(!parseToObject(result).length) {
                res.redirect('/users')
            }

            res.render('user/edit', {
                user: parseToObject(result)[0]
            })
        })
    }
    catch(err) {
        console.log(err);

        res.redirect('/users')
    }
})

app.put('/user/:id', (req, res, next) => {
    let id = req.params.id;
    let updatedAt = new Date().toISOString();

    let query = [
        {
            ...req.body, updatedAt
        },
        req.params.id
    ]

    try {
        connection.query(
            `UPDATE users SET ? WHERE id = ?`, query, (err, result) => {
            console.log(result);

            if(err) {
                console.log(err);
            }

            res.redirect('/users');
        })
    }
    catch(err) {
        console.log(err);

        res.redirect(`/user/${id}`);
    }
})

app.post('/user', (req, res, next) => {
    try {
        let {name, email, password, role, salary} = req.body;
        let id = randId(12, {
            numbers: true,
            lowerCase: true
        });
        let createdAt = new Date().toISOString();
        let updatedAt = new Date().toISOString();

        const values = [[id, email, password, name, role, salary, createdAt, updatedAt]];

        console.log(id);

        connection.query(`INSERT INTO users(id, username, password, fullname, role, salary, createdAt, updatedAt) VALUES ?`, 
        [values], (err, result) => {
            if(err && !result) {
                res.redirect('/create')
            }

            res.redirect('/users');
        })
    }
    catch(err) {
        console.log(err);

        res.redirect('/create');
    }
})

app.delete('/user/:id', (req, res, next) => {
    let id = req.params.id;

    try {
        connection.query('DELETE FROM users WHERE id = ?', [[id]], (err, result) => {
            if(err) {
                console.log(err);
            }

            res.redirect('/users');
        })
    }
    catch(err) {
        console.log(err);

        res.redirect('/users');
    }
})

app.listen(process.env.PORT || 3000 , () => {
    console.log('Port started in ' + process.env.PORT);
})