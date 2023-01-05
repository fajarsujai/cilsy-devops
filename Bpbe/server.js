const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const promMid = require('express-prometheus-middleware');
const PORT = 4000;
require('dotenv').config();
const baseURL = process.env.MONGO_SVC_BASE_URL

let Todo = require('./todo.model');

app.use(cors());
app.use(bodyParser.json());

// mongoose.connect('https://mongo.fajarsujai.my.id/todos', { useNewUrlParser: true });
mongoose.connect(`mongodb://${baseURL}:27017/todos`, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

todoRoutes.route('/').get(function(req, res) {
    Todo.find(function(err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});

todoRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Todo.findById(id, function(err, todo) {
        res.json(todo);
    });
});

todoRoutes.route('/update/:id').post(function(req, res) {
    Todo.findById(req.params.id, function(err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
            todo.todo_description = req.body.todo_description;
            todo.todo_responsible = req.body.todo_responsible;
            todo.todo_priority = req.body.todo_priority;
            todo.todo_completed = req.body.todo_completed;

            todo.save().then(todo => {
                res.json('Todo updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

app.use('/todos', todoRoutes);


app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  /**
   * Uncomenting the `authenticate` callback will make the `metricsPath` route
   * require authentication. This authentication callback can make a simple
   * basic auth test, or even query a remote server to validate access.
   * To access /metrics you could do:
   * curl -X GET user:password@localhost:9091/metrics
   */
  // authenticate: req => req.headers.authorization === 'Basic dXNlcjpwYXNzd29yZA==',
  /**
   * Uncommenting the `extraMasks` config will use the list of regexes to
   * reformat URL path names and replace the values found with a placeholder value
  */
  // extraMasks: [/..:..:..:..:..:../],
  /**
   * The prefix option will cause all metrics to have the given prefix.
   * E.g.: `app_prefix_http_requests_total`
   */
  // prefix: 'app_prefix_',
  /**
   * Can add custom labels with customLabels and transformLabels options
   */
  // customLabels: ['contentType'],
  // transformLabels(labels, req) {
  //   // eslint-disable-next-line no-param-reassign
  //   labels.contentType = req.headers['content-type'];
  // },
}));

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});





// curl -X GET localhost:9091/hello?name=Chuck%20Norris
// app.get('/hello', (req, res) => {
//   console.log('GET /hello');
//   const { name = 'Anon' } = req.query;
//   res.json({ message: `Hello, ${name}!` });
// });

// app.listen(PORT, () => {
//   console.log(`Example api is listening on http://localhost:${PORT}`);
// });